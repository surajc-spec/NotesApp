const mongoose = require('mongoose')
const config = require('../config/config')

async function connectDB(){
    try{
       await mongoose.connect(config.MONGO_URI)
        console.log("Database Connected");
        
    }catch(error){
        console.log("Database Connection Error",error);
    
    }
}

module.exports = connectDB;