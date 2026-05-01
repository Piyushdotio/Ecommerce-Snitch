import express from "express";
import verifySeller from "../middleware/auth.middleware.js";
import { validateProduct } from "../validator/product.validator.js";
import multer from "multer";
import { uploadproductController, getsellerproductsController } from "../controller/product.controller.js";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

const productRouter = express.Router();

const uploadProductImages = (req, res, next) => {
    upload.array("images", 7)(req, res, (err) => {
        if (!err) {
            return next();
        }

        if (err instanceof multer.MulterError) {
            return res.status(400).json({
                success: false,
                message: err.message,
            });
        }

        if (err.message?.includes("Malformed part header")) {
            return res.status(400).json({
                success: false,
                message: "Invalid multipart form-data request. Send files with FormData and do not set the multipart boundary manually.",
            });
        }

        return next(err);
    });
};
/**
 * @route post /api/products/create
 * @description create a new product
 * @access Private (seller only)
 */
productRouter.post("/create", verifySeller, uploadProductImages, validateProduct, uploadproductController);
/**
 * @route post /api/products/showproduct
 * @description show  all products of seller
 * @access Private (seller only)
 */
productRouter.get("/showproduct",verifySeller,getsellerproductsController)

export default productRouter;
