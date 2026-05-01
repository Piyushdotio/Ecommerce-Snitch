import express from "express";
import cors from "cors";
import userRouter from "./routes/user.route.js";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { config } from "./config/config.js";
import productRouter from "./routes/product.route.js";
import cookieParser from "cookie-parser";

const app = express();
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", userRouter);
app.use("/api/products", productRouter);
app.use(passport.initialize());

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback",
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

app.use((err, req, res, next) => {
    console.error(err);

    if (res.headersSent) {
        return next(err);
    }

    return res.status(500).json({
        success: false,
        message: err.message || "Internal server error",
    });
});

export default app;
