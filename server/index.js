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
compression()
);


app.use(
express.json()
);


app.use(
express.urlencoded({

extended:
true

})
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