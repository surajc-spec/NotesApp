const express = require('express');
const router = express.Router();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const rateLimit = require('express-rate-limit');

const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');



// TOKEN

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: '30d',
    }
  );
};



// REGISTER LIMIT

const registerLimiter =
rateLimit({

windowMs:
60 *
60 *
1000,

max:
3,

message: {
message:
'Too many registrations. Try again in 1 hour.'
},

standardHeaders:
true,

legacyHeaders:
false,

});



// LOGIN LIMIT

const loginLimiter =
rateLimit({

windowMs:
15 *
60 *
1000,

max:
20,

message:{
message:
'Too many login attempts. Try later.'
},

standardHeaders:
true,

legacyHeaders:
false,

});



// REGISTER

router.post(
'/register',

registerLimiter,

async (req, res) => {

try {

const {
name,
email,
password,
year,
branch
} = req.body;



if (
!name ||
!email ||
!password ||
!year ||
!branch
) {

return res
.status(400)
.json({
message:
'Please add all fields'
});

}



const userExists =
await User.findOne({
email
});

if (userExists) {

return res
.status(400)
.json({
message:
'User already exists'
});

}



const salt =
await bcrypt.genSalt(10);

const hashedPassword =
await bcrypt.hash(
password,
salt
);



const user =
await User.create({

name,

email:
email
.toLowerCase()
.trim(),

password:
hashedPassword,

year,

branch

});



res.status(201).json({

_id:
user.id,

name:
user.name,

email:
user.email,

year:
user.year,

branch:
user.branch,

token:
generateToken(
user._id
)

});

}

catch (error) {

res
.status(500)
.json({

message:
error.message

});

}

}
);



// LOGIN

router.post(
'/login',

loginLimiter,

async (
req,
res
)=>{

try {

const {
email,
password
}
=
req.body;



const user =
await User.findOne({

email:
email
.toLowerCase()
.trim()

});



if (
user &&
await bcrypt.compare(
password,
user.password
)
) {

res.json({

_id:
user.id,

name:
user.name,

email:
user.email,

year:
user.year,

branch:
user.branch,

token:
generateToken(
user._id
)

});

}

else {

res
.status(400)
.json({

message:
'Invalid credentials'

});

}

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



// PROFILE

router.put(
'/profile',

protect,

async (
req,
res
)=>{

try {

const user =
await User.findById(
req.user.id
);

if(!user){

return res
.status(404)
.json({

message:
'User not found'

});

}



user.year =
req.body.year ||
user.year;

user.branch =
req.body.branch ||
user.branch;



const updatedUser =
await user.save();



res.json({

_id:
updatedUser.id,

name:
updatedUser.name,

email:
updatedUser.email,

year:
updatedUser.year,

branch:
updatedUser.branch,

token:
generateToken(
updatedUser._id
)

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



module.exports =
router;