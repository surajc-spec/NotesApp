const NodeCache = require('node-cache');

// Cache TTL = 10 min
const cache =
new NodeCache({

stdTTL:
600,

checkperiod:
120

});



// GET

const getCache =
(key)=>{

return cache.get(key);

};



// SET

const setCache =
(
key,
value
)=>{

cache.set(
key,
value
);

};



// CLEAR SINGLE

const deleteCache =
(
key
)=>{

cache.del(
key
);

};



// CLEAR ALL

const clearCache =
()=>{

cache.flushAll();

};



module.exports={

getCache,

setCache,

deleteCache,

clearCache

};