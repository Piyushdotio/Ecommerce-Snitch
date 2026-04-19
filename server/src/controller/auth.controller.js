import userModel from "../models/userSchema.model";
import jwt from 'jsonwebtoken'
import { config } from "../config/config";


async function sendTokenresponse(user,res,message){
    const token=jwt.sign({
                id:user._id
    },config.JWT_SECRET,{expiresIn:"7d"})


    res.cookies("token",token)

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
        const user=userModel.create({
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