import mongoose from "mongoose";
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique:true,
    required:true
  },
  contact:{type:String,required:false,unique:true},
  password: {
    type: String,
    required:function(){
      return !this.googleId
    }
  },
  role: {
    type: String,
    enum: ["seller", "buyer"],
    default:'buyer'
  },
  fullname:{type:String,required:true},
  googleId:{
    type:String
  }
});

userSchema.pre("save",async function(){
    if(!this.isModified("password"))return
    

    const hash=await bcrypt.hash(this.password,10)
    this.password=hash
})

userSchema.methods.comparePassword=async function(password){
    return await bcrypt.compare(password,this.password)
}


const userModel = mongoose.model("user", userSchema);

export default userModel;
