import express from 'express'
import { validateRegisterUser } from '../validator/auth.validator'
import { register } from '../controller/auth.controller'
const userRouter=express.Router()





userRouter.post("/register",validateRegisterUser,register)