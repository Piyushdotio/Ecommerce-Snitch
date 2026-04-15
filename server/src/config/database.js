import mongoose from 'mongoose'


function connectTodb(){
    mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log("connected to db")
    })
}

 export default connectTodb