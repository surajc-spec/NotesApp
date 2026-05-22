require('dotenv').config();

const express =
require('express');

const mongoose =
require('mongoose');

const cors =
require('cors');

const compression =
require('compression');

const rateLimit =
require('express-rate-limit');

const authRoutes =
require('./routes/authRoutes');

const noteRoutes =
require('./routes/noteRoutes');

const app =
express();

app.set(
'etag',
false
);



// --------------------
// AUTH RATE LIMIT
// --------------------

const authLimiter =
rateLimit({

windowMs:
60 *
60 *
1000,

max:
20,

message:{

message:
'Too many registrations. Try again in 1 hour.'

},

standardHeaders:
true,

legacyHeaders:
false,

});



// --------------------
// GLOBAL MIDDLEWARE
// --------------------

app.use(
cors()
);


// ENABLE GZIP COMPRESSION

app.use(
compression({
filter:(req,res)=>{

if(
req.method ===
'GET' &&
req.path ===
'/api/notes'
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

authLimiter,

authRoutes

);


// NOTES NORMAL

app.use(

'/api/notes',

noteRoutes

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

.then(()=>{

console.log(
'MongoDB Connected'
);

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
