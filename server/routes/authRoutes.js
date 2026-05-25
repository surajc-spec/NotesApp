const express = require('express');
const router = express.Router();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');

const User = require('../models/User');
const RateLimitEvent = require('../models/RateLimitEvent');
const { protect } = require('../middleware/authMiddleware');

const normalizeEmail = (email) =>
  String(email || '')
    .trim()
    .toLowerCase();

const escapeRegex = (value) =>
  String(value)
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const emailQuery = (email) => ({
  email:
  new RegExp(
    `^${escapeRegex(normalizeEmail(email))}$`,
    'i'
  )
});

const getAuthRateLimitKey = (req) =>
  `${ipKeyGenerator(req.ip)}:${normalizeEmail(req.body?.email) || 'unknown'}`;

const getWaitMinutes = (req) => {
  const waitMs = req.rateLimit?.resetTime
    ? req.rateLimit.resetTime.getTime() - Date.now()
    : 60 * 1000;

  return Math.max(1, Math.ceil(waitMs / (60 * 1000)));
};

const handleRateLimit = (route) => async (req, res) => {
  const email = normalizeEmail(req.body?.email) || 'unknown';
  const waitMinutes = getWaitMinutes(req);

  try {
    await RateLimitEvent.create({
      email,
      route,
      reason: 'Rate limit',
    });

    const keep = await RateLimitEvent
      .find({})
      .select('_id')
      .sort({ createdAt: -1 })
      .skip(50)
      .lean();

    if (keep.length) {
      await RateLimitEvent.deleteMany({ _id: { $in: keep.map((event) => event._id) } });
    }
  } catch (error) {
    console.error('Could not log rate limit event:', error.message);
  }

  return res.status(429).json({
    message: `Too many attempts detected. Please wait ${waitMinutes} minute${waitMinutes === 1 ? '' : 's'} and try again.`,
    retryAfterMinutes: waitMinutes,
  });
};


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
10,

keyGenerator:
getAuthRateLimitKey,

handler:
handleRateLimit('/register'),

standardHeaders:
true,

legacyHeaders:
false,

});



// LOGIN LIMIT

const loginLimiter =
rateLimit({

windowMs:
60 *
60 *
1000,

max:
10,

keyGenerator:
getAuthRateLimitKey,

handler:
handleRateLimit('/login'),

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



const normalizedEmail =
normalizeEmail(
email
);

const userExists =
await User.findOne(
emailQuery(
normalizedEmail
)
);

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

name:
String(name).trim(),

email:
normalizedEmail,

password:
hashedPassword,

year:
year,

branch:
branch

});

await registerLimiter.resetKey(
getAuthRateLimitKey(req)
);



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
await User.findOne(
emailQuery(
email
)
);



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
