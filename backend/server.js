const app = require('../backend/src/app')
const config = require('./src/config/config')
const connectDB = require('../backend/src/db/db')


app.listen(config.PORT,(req,res)=>{
    console.log(`Server Running on port ${config.PORT}`);
    
})

connectDB()