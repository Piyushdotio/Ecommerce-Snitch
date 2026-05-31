import jwt from "jsonwebtoken"
import { config } from "../config/config.js"
import userModel from "../models/userSchema.model.js"

const getTokenFromRequest = (req) => {
    const cookieToken = req.cookies?.token
    if (cookieToken) {
        return cookieToken
    }

    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith("Bearer ")) {
        return null
    }

    return authHeader.slice(7).trim()
}

const verifyAuth = async (req, res, next, requiredRole) => {
    const token = getTokenFromRequest(req)

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "token not found",
        })
    }

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET)
        const user = await userModel.findById(decoded.id)

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "unauthorized",
            })
        }

        if (requiredRole && user.role !== requiredRole) {
            return res.status(403).json({
                success: false,
                message: "you are not seller",
            })
        }

        req.user = user
        next()
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "Invalid Token",
        })
    }
}

export const verifySeller = async (req, res, next) => {
    return verifyAuth(req, res, next, "seller")
}

export const verifyUser = async (req, res, next) => {
    return verifyAuth(req, res, next)
}

