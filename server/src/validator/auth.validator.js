import {body,validationResult} from 'express-validator'

function validateRequest(req,res,next){
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})

    }
    next()

}





export const validateRegisterUser=[
    body("email")
    .isEmail().withMessage("Invalid Email Format"),
    body("contact")
    .notEmpty().withMessage("contact must be required")
    .matches(/^\d{10}$/).withMessage("Contact must be 10-digits"),
    body("password")
    .isLength({min:6}).withMessage("password must be atleast 6 digit"),
    body("fullname")
    .notEmpty().withMessage("fullname must be required")
    .isLength({min:3}).withMessage("fullname must contain 3 letter"),
    body("isSeller")
    .isBoolean().withMessage("isSeller must be a boolean value"),
    
    validateRequest
]

export const validateLoginUser=[
    body("password")
    .isLength({min:6}).withMessage("password must be atleast 6 digit"),
    body("email")
    .optional()
    .isEmail().withMessage("Invalid Email Format"),
    body("contact")
    .optional()
    .matches(/^\d{10}$/).withMessage("Contact must be 10-digits"),
    validateRequest
]
