const NodeCache =
require('node-cache');

const cache =
new NodeCache({

stdTTL:
120,

checkperiod:
150

});

module.exports =
cache;