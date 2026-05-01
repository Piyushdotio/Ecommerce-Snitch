import mongoose from 'mongoose'
import {config} from './config.js'

function connectTodb(){
    mongoose.connect(config.MONGO_URI)
    .then(()=>{
        console.log("connected to db")
    })
    .catch((err)=>{
        console.error("database connection failed", err.message)
    })
}

 export default connectTodb
