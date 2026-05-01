import productModel from "../models/product.model.js";
import { fileupload } from "../services/storage.service.js";

export const uploadproductController = async (req, res) => {
    const { title, description, priceAmount, priceCurrency } = req.body;
    const seller = req.user;
    const files = req.files || [];

    const uploadedImages = await Promise.all(
        files.map(async (file) => {
            const uploadedFile = await fileupload({
                buffer: file.buffer,
                fileName: file.originalname,
            });

            return {
                url: uploadedFile.url,
                alt: title,
            };
        })
    );

    const product = await productModel.create({
        title,
        description,
        price: {
            amount: Number(priceAmount),
            currency: priceCurrency || "INR",
        },
        images: uploadedImages,
        seller: seller._id,
    });

    res.status(201).json({
        message: "product created successfully",
        success: true,
        product,
    });
};

export const getsellerproductsController=async(req,res)=>{
    const seller=req.user
    const products=await productModel.find({seller:seller._id})
    if(!products){
        return res.status(404).json({
            message:"products not found"
        })
    }
    return res.status(200).json({
        message:"product fetched successfully",
        success:true,
        products
    })
}