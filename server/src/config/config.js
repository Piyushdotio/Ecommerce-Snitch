import 'dotenv/config' 

if(!process.env.MONGO_URI){
    throw new error("MONGO_URI is not defined in environmental variables")
}

if(!process.env.JWT_SECRET){
    throw new error("JWT_SECRET is not defined in environmental variables")
}

export const config={
    MONGO_URI:process.env.MONGO_URI,
    JWT_SECRET:process.env.JWT_SECRET
}