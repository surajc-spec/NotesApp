const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const Note = require('../models/Note');

const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const {
  canAccessNote,
  verifyNotePassword,
  streamPreviewFile,
  toSafeNote,
} = require('../services/notePreviewService');

const {
  getCache,
  setCache,
  clearCache,
} = require('../services/cacheService');


// =======================
// UPLOAD
// =======================

router.post('/upload', protect, (req, res) => {
  upload.single('file')(req, res, async (err) => {

    if (err) {
      return res.status(400).json({
        message:
          typeof err === 'string'
            ? err
            : err.message
      });
    }

    try {

      const {
        title,
        subject,
        description,
        isPublic,
        password
      } = req.body;

      if (!req.file) {
        return res.status(400).json({
          message: 'Please upload file'
        });
      }

      let hashedPassword;

      if (password?.trim()) {
        hashedPassword =
          await bcrypt.hash(
            password,
            10
          );
      }

      const note =
        await Note.create({

          title,
          subject,
          description,

          branch:
            req.user.branch,

          year:
            req.user.year,

          uploader:
            req.user.id,

          isPublic:
            isPublic === 'true',

          password:
            hashedPassword,

          fileUrl:
            req.file.path,

          filePublicId:
            req.file.filename ||
            req.file.public_id,

          fileResourceType:
            req.file.resource_type ||
            'raw',

          fileStorageType:
            'authenticated',

        });

      await clearCache();

      const populated =
        await note.populate(
          'uploader',
          'name email year branch'
        );

      res
        .status(201)
        .json(
          toSafeNote(populated)
        );

    }

    catch (error) {

      res.status(500).json({
        message:
          error.message
      });

    }

  });
});


// =======================
// NOTES LIST (CACHE)
// =======================

router.get('/', protect, async (req, res) => {

try{

const key=
`notes_${req.user.id}_${req.query.subject}`;

const cached=
getCache(key);

if(cached){

return res.json(cached);

}

let query={
$and:[
{
branch:req.user.branch,
year:req.user.year
},
{
$or:[
{isPublic:true},
{uploader:req.user.id}
]
}
]
};

if(
req.query.subject &&
req.query.subject!=='All'
){

query.$and.push({

subject:
new RegExp(
`^${req.query.subject}$`,
'i'
)

});

}

const notes=
await Note
.find(query)
.populate(
'uploader',
'name email year branch'
)
.sort({
createdAt:-1
});

const grouped=
notes.reduce((a,n)=>{

const s=
n.subject||
'Other';

if(!a[s])
a[s]=[];

a[s].push(
toSafeNote(n)
);

return a;

},{});

setCache(
key,
grouped
);

res.json(
grouped
);

}

catch(error){

res.status(500).json({
message:
error.message
});

}

});


// =======================
// MY NOTES CACHE
// =======================

router.get(
'/mine',
protect,

async(req,res)=>{

try{

const key=
`mine_${req.user.id}`;

const cached=
getCache(key);

if(cached)
return res.json(cached);

const notes=
await Note
.find({
uploader:
req.user.id
})
.populate(
'uploader',
'name email'
)
.sort({
createdAt:-1
});

const data=
notes.map(
toSafeNote
);

setCache(
key,
data
);

res.json(
data
);

}

catch(error){

res.status(500).json({
message:
error.message
});

}

});


// =======================
// SEARCH CACHE
// =======================

router.get(
'/search',
protect,

async(req,res)=>{

try{

const key=
`search_${req.user.id}_${req.query.q}`;

const cached=
getCache(key);

if(cached)
return res.json(cached);

const regex=
new RegExp(
req.query.q,
'i'
);

const notes=
await Note
.find({

branch:
req.user.branch,

year:
req.user.year,

$or:[
{
title:regex
},
{
subject:regex
},
{
description:regex
}
]

})
.populate(
'uploader',
'name email'
);

const data=
notes.map(
toSafeNote
);

setCache(
key,data);

res.json(
data
);

}

catch(error){

res.status(500).json({
message:
error.message
});

}

});


// KEEP EXISTING ROUTES
// preview
// preview-info
// verify-password


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

return res.status(404).json({
message:
'Not found'
});

}

if(
note.uploader.toString()
!==req.user.id
){

return res.status(401).json({
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

res.status(500).json({
message:
error.message
});

}

});

module.exports=
router;