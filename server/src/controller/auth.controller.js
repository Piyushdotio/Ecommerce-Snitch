import userModel from "../models/userSchema.model.js";
import jwt from 'jsonwebtoken'
import { config } from "../config/config.js";


async function sendTokenresponse(user,res,message){
    const token=jwt.sign({
                id:user._id
    },config.JWT_SECRET,{expiresIn:"7d"})


    res.cookie("token",token, {
        httpOnly: true,
        sameSite: 'lax'
    })

    res.status(200).json({
        message,
        success:true,
        user:{
            id:user._id,
            email:user.email,
            contact:user.contact,
            fullname:user.fullname,
            role:user.role

        }
        
    })
}
export const register=async(req,res)=>{
    const {email,password,contact,fullname,isSeller}=req.body

    try{
        const existingUser=await userModel.findOne({
            $or:[
                {email},
                {contact}
            ]
        })
        if(existingUser){
            return res.status(400).json({message:"user with this email and contact number already existed"})
        }
        const user=await userModel.create({
            email,
            password,
            contact,
            fullname,
            role:isSeller?"seller":"buyer"
        })
        await sendTokenresponse(user,res,"user registered successfully")
    }
    catch(err){
        console.log(err)
        return res.status(500).json({message:"Invalid Register"})
    }
}

export const login=async(req,res)=>{
    const {email,contact,password}=req.body

    try{
        const user=await userModel.findOne({
            $or:[
                {email},
                {contact}
            ]
        })
        if(!user){
            return res.status(400).json({
                message:"Invalid Email and contact Number  "
            })
        }
        const isMatched=await user.comparePassword(password)
        if(!isMatched){
            return res.status(400).json({
                message:"Invalid Password"
            })
        }
        await sendTokenresponse(user,res,"user Logged in Successfully")
    }catch(err){
        console.error(err)
        return res.status(500).json({message:"Invalid Login"})
    }


}
export const googleCallback=async(req,res)=>{
    const {id,displayName,emails,photos}=req.user
    const email=emails[0].value
    const profile=photos[0].value

    let user=await userModel.findOne({
        email
    })
    if(!user){
        const user=await userModel.create({
            email:email,
            googleId:id,
            fullname:displayName
            

        })
    }
    const token=await jwt.sign({
      id:user._id, 
    },config.JWT_SECRET,{
        expiresIn:"7d"
    })
    res.cookie("token",token)
    res.redirect("http://localhost:5173/")
}