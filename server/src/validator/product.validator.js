import { body, validationResult } from "express-validator";

function validateRequest(req, res, next) {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ error: error.array() });
    }
    next();
}

export const validateProduct = [
    body("title")
        .notEmpty().withMessage("Title is required")
        .isLength({ min: 3 }).withMessage("Title must be at least 3 characters"),

    body("description")
        .notEmpty().withMessage("Description is required")
        .isLength({ min: 10 }).withMessage("Description must be at least 10 characters"),

    body("priceAmount")
        .notEmpty().withMessage("Price is required")
        .isFloat({ gt: 0 }).withMessage("Price must be greater than 0"),

    body("priceCurrency")
        .optional()
        .isIn(["INR", "USD", "EUR", "GBP", "JPY"])
        .withMessage("Invalid currency"),

    body().custom((_, { req }) => {
        if (!req.user?._id) {
            throw new Error("Seller authentication is required");
        }

        if (!req.files || req.files.length === 0) {
            throw new Error("At least one image is required");
        }

        return true;
    }),

    validateRequest,
];
