import express from 'express'
import { validateLoginUser, validateRegisterUser } from '../validator/auth.validator.js'
import { register,login, googleCallback,getMe } from '../controller/auth.controller.js'
import { getAddresses, addAddress, deleteAddress, setDefaultAddress } from '../controller/address.controller.js'
import passport from 'passport'
import { config } from '../config/config.js'
const userRouter=express.Router()
import {verifyUser} from "../middleware/auth.middleware.js"



userRouter.post("/register",validateRegisterUser,register)

userRouter.post("/login",validateLoginUser,login)

userRouter.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
userRouter.get('/google/callback',
    passport.authenticate('google', { session: false ,failureRedirect:config.NODE_ENV=="development"?"http://localhost:5173/login":"/login"}),
    googleCallback
)
userRouter.get("/me",verifyUser,getMe)

// Saved Addresses routes
userRouter.get("/addresses", verifyUser, getAddresses)
userRouter.post("/addresses", verifyUser, addAddress)
userRouter.delete("/addresses/:addressId", verifyUser, deleteAddress)
userRouter.patch("/addresses/:addressId/default", verifyUser, setDefaultAddress)

export default userRouter
