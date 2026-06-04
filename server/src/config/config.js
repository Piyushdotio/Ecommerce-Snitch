import 'dotenv/config' 

if(!process.env.MONGO_URI){
    throw new Error("MONGO_URI is not defined in environmental variables")
}

if(!process.env.JWT_SECRET){
    throw new Error("JWT_SECRET is not defined in environmental variables")
}
if(!process.env.GOOGLE_CLIENT_ID){
    throw new Error("GOOGLE_CLIENT_ID is not defined in environmental variables")
}
if(!process.env.GOOGLE_CLIENT_SECRET){
    throw new Error("GOOGLE_CLIENT_SECRET is not defined in environmental variables")
}
if(!process.env.PRIVATE_KEY){
    throw new Error("PRIVATE_KEY is not defined in environmental variables")
}
if(!process.env.RAZORPAY_KEY_ID){
    throw new Error("RAZORPAY_KEY_ID is not defined in environmental variables")
}
if(!process.env.RAZORPAY_KEY_SECRET){
    throw new Error("RAZORPAY_KEY_SECRET is not defined in environmental variables")
}

export const config={
    MONGO_URI:process.env.MONGO_URI,
    JWT_SECRET:process.env.JWT_SECRET,
    GOOGLE_CLIENT_ID:process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET:process.env.GOOGLE_CLIENT_SECRET,
    NODE_ENV:process.env.NODE_ENV||"development",
    PRIVATE_KEY:process.env.PRIVATE_KEY,
    CLIENT_URL:process.env.CLIENT_URL || "http://localhost:5173",
    SERVER_URL:process.env.SERVER_URL || "http://localhost:3000",
    GOOGLE_CALLBACK_URL:process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/api/auth/google/callback",
    RAZORPAY_KEY_ID:process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET:process.env.RAZORPAY_KEY_SECRET

}
