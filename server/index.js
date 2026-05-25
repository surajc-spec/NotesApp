require('dotenv').config();

const express =
require('express');

const mongoose =
require('mongoose');

const cors =
require('cors');

const compression =
require('compression');

const authRoutes =
require('./routes/authRoutes');

const noteRoutes =
require('./routes/noteRoutes');

const questionPaperRoutes =
require('./routes/questionPaperRoutes');

const adminRoutes =
require('./routes/adminRoutes');

const contactRoutes =
require('./routes/contactRoutes');

const {
migrateSubjects
} =
require('./services/subjectMigrationService');

const app =
express();

app.set(
'etag',
false
);



// --------------------
// GLOBAL MIDDLEWARE
// --------------------

app.use(
cors()
);

app.get(
'/api/notes',
noteRoutes.getNotesMiddleware
);

app.get(
'/api/questionpapers',
questionPaperRoutes.getQuestionPapersMiddleware
);


// ENABLE GZIP COMPRESSION

app.use(
compression({
filter:(req,res)=>{

if(
req.method ===
'GET' &&
(
req.path ===
'/api/notes' ||
req.path ===
'/api/questionpapers'
)
){
return false;
}

return compression.filter(
req,
res
);

}
})
);

const jsonParser =
express.json();

const urlencodedParser =
express.urlencoded({

extended:
true

});

const skipBodyParserForGet =
(parser)=>
(req,res,next)=>{

if(
req.method ===
'GET'
){
return next();
}

return parser(
req,
res,
next
);

};

app.use(
skipBodyParserForGet(
jsonParser
)
);


app.use(
skipBodyParserForGet(
urlencodedParser
)
);



// --------------------
// HEALTH CHECK
// --------------------

app.get(

'/',

(req,res)=>{

res.json({

message:
'Backend Running'

});

}

);



// --------------------
// ROUTES
// --------------------

// AUTH PROTECTED

app.use(

'/api/auth',

authRoutes

);


// NOTES NORMAL

app.use(

'/api/admin',

adminRoutes

);

app.use(

'/api/contact',

contactRoutes

);

app.use(

'/api/notes',

noteRoutes

);

app.use(

'/api/questionpapers',

questionPaperRoutes

);



// --------------------
// DATABASE
// --------------------

const PORT =
process.env.PORT ||
5000;



mongoose
.connect(
process.env.MONGO_URI
)

.then(async()=>{

console.log(
'MongoDB Connected'
);

await migrateSubjects();

app.listen(

PORT,

()=>{

console.log(

`Server running on port ${PORT}`

);

}

);

})

.catch(

(err)=>{

console.error(

'MongoDB connection error:',

err

);

}

);
