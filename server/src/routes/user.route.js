import express from 'express'
import { validateLoginUser, validateRegisterUser } from '../validator/auth.validator.js'
import { register,login, googleCallback } from '../controller/auth.controller.js'
import passport from 'passport'
import { config } from '../config/config.js'
const userRouter=express.Router()





userRouter.post("/register",validateRegisterUser,register)

userRouter.post("/login",validateLoginUser,login)

userRouter.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
userRouter.get('/google/callback',
    passport.authenticate('google', { session: false ,failureRedirect:config.NODE_ENV=="development"?"http://localhost:5173/login":"/login"}),
    googleCallback
)

export default userRouter
