import {body,param,validationResult} from "express-validator"

function validateRequest(req, res, next) {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ error: error.array() });
    }
    next();
}

export const validateAddToCart=[
    param("productId")
    .notEmpty().withMessage("Product Id is required"),
    param("variantId")
    .optional(),
    body("quantity")
    .optional()
    .isNumeric().withMessage("Quantity must be a number"),
    validateRequest
]