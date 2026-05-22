const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const Note = require('../models/Note');

const {
protect,
protectCached
} =
require('../middleware/authMiddleware');

const upload =
require('../middleware/uploadMiddleware');

const {
canAccessNote,
verifyNotePassword,
streamPreviewFile,
toSafeNote
} =
require('../services/notePreviewService');

const {
getCacheRaw,
setCacheRaw,
clearCache
} =
require('../services/cacheService');

const CACHE_DEBUG =
process.env.CACHE_DEBUG ===
'true';

const PERF_DEBUG =
process.env.PERF_DEBUG ===
'true';

const getMs =
(start)=>
Number(
process.hrtime.bigint()-
start
)/
1000000;


// =======================
// UPLOAD
// =======================

router.post(
'/upload',
protect,

(req,res)=>{

upload.single('file')(
req,
res,

async(err)=>{

try{

if(err){

return res
.status(400)
.json({
message:
err.message
});

}

if(!req.file){

return res
.status(400)
.json({
message:
'Please upload file'
});

}

let hashedPassword;

if(
req.body.password?.trim()
){

hashedPassword=
await bcrypt.hash(
req.body.password,
10
);

}

const note=
await Note.create({

title:
req.body.title,

subject:
req.body.subject,

description:
req.body.description,

branch:
req.user.branch,

year:
req.user.year,

uploader:
req.user.id,

isPublic:
req.body.isPublic==='true',

password:
hashedPassword,

fileUrl:
req.file.path,

filePublicId:
req.file.filename||
req.file.public_id,

fileResourceType:
req.file.resource_type||
'raw',

fileStorageType:
'authenticated'

});

await clearCache();

const populated=
await note.populate(
'uploader',
'name email year branch'
);

res
.status(201)
.json(
toSafeNote(
populated
)
);

}

catch(error){

res
.status(500)
.json({
message:
error.message
});

}

}

);

}

);


// =======================
// GET NOTES
// =======================

const getNotesHandler =
async(req,res)=>{

try{

const routeStart =
process.hrtime.bigint();

let cacheMs =
0;

let mongoMs =
0;

let serializationMs =
0;

const page=
Math.max(
Number(req.query.page)||
1,
1
);

const limit=
Math.min(
Math.max(
Number(req.query.limit)||
0,
0
),
50
);

const subject=
req.query.subject&&
req.query.subject!=='All'
?
String(req.query.subject)
:
'All';

const key=
`noteshare:notes:${req.user.id}:${subject}:${page}:${limit||'all'}`;

const cacheStart =
process.hrtime.bigint();

const cached=
await getCacheRaw(key);

cacheMs =
getMs(
cacheStart
);

if(cached){

if(
CACHE_DEBUG
){
console.log(
'Cache HIT',
key
);
}

if(
PERF_DEBUG
){
console.log({
route:
'GET /api/notes',
cache:
'hit',
authMs:
req.perfAuthMs,
cacheMs,
mongoMs,
serializationMs,
responseBytes:
Buffer.byteLength(
cached
),
totalMs:
getMs(
routeStart
)
});
}

return res
.type(
'application/json'
)
.send(
cached
);

}

if(
CACHE_DEBUG
){
console.log(
'Cache MISS',
key
);
}

const query={

branch:
req.user.branch,

year:
req.user.year,

$or:[
{
isPublic:true
},
{
uploader:
req.user.id
}
]

};

if(
subject!=='All'
){

query.subject=
subject;

}

const dbQuery=
Note
.find(
query
)
.populate(
'uploader',
'name email year branch'
)
.sort({
createdAt:-1
});

if(
limit
){

const mongoStart =
process.hrtime.bigint();

dbQuery
.skip(
(page-1)*limit
)
.limit(
limit
);

const [
notes,
total
]=
await Promise.all([
dbQuery.lean(),
Note.countDocuments(
query
)
]);

mongoMs =
getMs(
mongoStart
);

const grouped=
notes.reduce(
(acc,n)=>{

const s=
n.subject||
'Other';

if(
!acc[s]
)
acc[s]=[];

acc[s]
.push(
toSafeNote(n)
);

return acc;

},
{}
);

const payload={

data:
grouped,

pagination:{

page,

limit,

total,

pages:
Math.ceil(
total/
limit
),

hasMore:
page*limit<
total

}

};

const serializationStart =
process.hrtime.bigint();

const serialized =
JSON.stringify(
payload
);

serializationMs =
getMs(
serializationStart
);

await setCacheRaw(
key,
serialized
);

if(
PERF_DEBUG
){
console.log({
route:
'GET /api/notes',
cache:
'miss',
authMs:
req.perfAuthMs,
cacheMs,
mongoMs,
serializationMs,
responseBytes:
Buffer.byteLength(
serialized
),
totalMs:
getMs(
routeStart
)
});
}

return res
.type(
'application/json'
)
.send(
serialized
);

}

const mongoStart =
process.hrtime.bigint();

const notes=
await dbQuery.lean();

mongoMs =
getMs(
mongoStart
);

const grouped=
notes.reduce(
(acc,n)=>{

const s=
n.subject||
'Other';

if(
!acc[s]
)
acc[s]=[];

acc[s]
.push(
toSafeNote(n)
);

return acc;

},
{}
);

const serializationStart =
process.hrtime.bigint();

const serialized =
JSON.stringify(
grouped
);

serializationMs =
getMs(
serializationStart
);

await setCacheRaw(
key,
serialized
);

if(
PERF_DEBUG
){
console.log({
route:
'GET /api/notes',
cache:
'miss',
authMs:
req.perfAuthMs,
cacheMs,
mongoMs,
serializationMs,
responseBytes:
Buffer.byteLength(
serialized
),
totalMs:
getMs(
routeStart
)
});
}

res
.type(
'application/json'
)
.send(
serialized
);

}

catch(error){

res
.status(500)
.json({
message:
error.message
});

}

};

router.get(
'/',
protectCached,
getNotesHandler
);


// =======================
// PREVIEW INFO
// =======================

router.get(
'/:id/preview-info',
protect,

async(req,res)=>{

try{

const note=
await Note
.findById(
req.params.id
);

if(
!note
){

return res
.status(404)
.json({
message:
'Note not found'
});

}

if(
!canAccessNote(
note,
req.user
)
){

return res
.status(403)
.json({
message:
'Access denied'
});

}

res.json({

requiresPassword:
!!note.password

});

}

catch(error){

res
.status(500)
.json({
message:
error.message
});

}

}
);


// =======================
// VERIFY PASSWORD
// =======================

router.post(
'/:id/verify-password',
protect,

async(req,res)=>{

try{

const note=
await Note.findById(
req.params.id
);

if(
!note
){

return res
.status(404)
.json({
message:
'Not found'
});

}

const ok=
await verifyNotePassword(

note,
req.user,
req.body.password

);

if(!ok){

return res
.status(401)
.json({
message:
'Wrong password'
});

}

res.json({

success:true

});

}

catch(error){

res
.status(500)
.json({
message:
error.message
});

}

}
);


// =======================
// PREVIEW PDF
// =======================

router.get(
'/:id/preview',
protect,

async(req,res)=>{

try{

const note=
await Note
.findById(
req.params.id
);

if(
!note
){

return res
.status(404)
.json({
message:
'Note not found'
});

}

const allowed=
await verifyNotePassword(

note,
req.user,
req.query.password

);

if(
!allowed
){

return res
.status(401)
.json({
message:
'Password required'
});

}

await streamPreviewFile(
note,
res
);

}

catch(error){

console.log(error);

res
.status(404)
.json({

message:
'Preview failed'

});

}

}
);


// =======================
// DELETE
// =======================

router.delete(
'/:id',
protect,

async(req,res)=>{

try{

const note=
await Note.findById(
req.params.id
);

if(
!note
){

return res
.status(404)
.json({
message:
'Not found'
});

}

if(
String(
note.uploader
)!==
String(
req.user.id
)
){

return res
.status(401)
.json({
message:
'Unauthorized'
});

}

await note.deleteOne();

await clearCache();

res.json({

message:
'Deleted'

});

}

catch(error){

res
.status(500)
.json({
message:
error.message
});

}

}
);

module.exports=
router;

module.exports.getNotesMiddleware=[
protectCached,
getNotesHandler
];
