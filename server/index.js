require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const rateLimit =
require('express-rate-limit');

const authRoutes =
require('./routes/authRoutes');

const noteRoutes =
require('./routes/noteRoutes');

const app =
express();



// RATE LIMIT

const apiLimiter =
rateLimit({

windowMs:
15 *
60 *
1000,

max:
300,

message:{

message:
'Too many requests. Please try again later.'

},

standardHeaders:
true,

legacyHeaders:
false,

});



// MIDDLEWARE

app.use(cors());

app.use(express.json());

app.use(
express.urlencoded({
extended:true
})
);

// APPLY LIMITER

app.use(
apiLimiter
);



// ROUTES

app.use(
'/api/auth',
authRoutes
);

app.use(
'/api/notes',
noteRoutes
);



// HEALTH CHECK

app.get(
'/',
(req,res)=>{

res.json({

message:
'Backend Running'

});

}
);



const PORT =
process.env.PORT ||
5000;



mongoose
.connect(
process.env
.MONGO_URI
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