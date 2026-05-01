import jwt from "jsonwebtoken"
import { config } from "../config/config.js"
import userModel from "../models/userSchema.model.js"

const verifySeller=async(req,res,next)=>{
        const token=req.cookies.token
        
        if(!token){
            return res.status(400).json({
                message:"token not found"
            })
        }
        try{
            const decoded=await jwt.verify(token,config.JWT_SECRET)
            console.log(decoded.id)
            const user=await userModel.findById(
                decoded.id
            )
            
            if(user.role!="seller"){
                return res.status(401).json({
                    message:"you are not seller"
                })
            }
            req.user=user
            next()
        }catch(err){
            res.status(401).json(
                {
                    message:"Invalid Token"
                }
            )
        }





}
export default verifySeller
