import { json } from "express";
import productModel from "../models/product.model.js";
import { fileupload } from "../services/storage.service.js";

export const uploadproductController = async (req, res) => {
  const { title, description, priceAmount, priceCurrency, category, stock, sizeStocks } = req.body;
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
    }),
  );

  let sizeStocksMap = {};
  if (sizeStocks) {
    try {
      sizeStocksMap = JSON.parse(sizeStocks);
    } catch (err) {
      console.error("sizeStocks parsing error:", err);
    }
  }

  const variantsToCreate = [];
  const hasVariants = Object.keys(sizeStocksMap).length > 0;

  if (hasVariants) {
    Object.entries(sizeStocksMap).forEach(([size, sizeStock]) => {
      variantsToCreate.push({
        stock: Number(sizeStock || 0),
        price: {
          amount: Number(priceAmount),
          currency: priceCurrency || "INR",
        },
        attributes: {
          size: size
        },
        images: uploadedImages.map(img => ({ url: img.url }))
      });
    });
  }

  const product = await productModel.create({
    title,
    description,
    price: {
      amount: Number(priceAmount),
      currency: priceCurrency || "INR",
    },
    category: category || "Shirts",
    stock: hasVariants ? 0 : Number(stock || 0),
    images: uploadedImages,
    variants: variantsToCreate,
    seller: seller._id,
  });

  res.status(201).json({
    message: "product created successfully",
    success: true,
    product,
  });
};

export const getsellerproductsController = async (req, res) => {
  const seller = req.user;
  const products = await productModel.find({ seller: seller._id });
  if (!products) {
    return res.status(404).json({
      message: "products not found",
    });
  }
  return res.status(200).json({
    message: "product fetched successfully",
    success: true,
    products,
  });
};

export const getallproducts = async (req, res) => {
  const products = await productModel.find();

  return res.status(200).json({
    message: "products fetched successfully",
    success: true,
    products,
  });
};

export const getProductDetails = async (req, res) => {
  const { id } = req.params;
  const product = await productModel.findById(id);
  if (!product) {
    return res.status(404).json({
      message: "Product not Found",
      success: false,
    });
  }
  return res.status(200).json({
    message: "Product fetched successfully",
    success: true,
    product,
  });
};

export const addProductVariant = async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await productModel.findOne({
      _id: productId,
      seller: req.user._id
    });
    
    if (!product) {
      return res.status(404).json({
        message: "product not found",
        success: false
      });
    }

    const files = req.files || [];
    const images = [];
    if (files && files.length > 0) {
      const uploadedImages = await Promise.all(
        files.map(async (file) => {
          const image = await fileupload({
            buffer: file.buffer,
            fileName: file.originalname,
          });
          return { url: image.url };
        })
      );
      images.push(...uploadedImages);
    }

    const price = Number(req.body.priceAmount) || Number(product.price.amount);
    const stock = Number(req.body.stock) || 0;
    
    let attributes = {};
    if (req.body.attributes) {
      try {
        attributes = JSON.parse(req.body.attributes);
      } catch (parseError) {
        console.error("Attributes JSON parse error:", parseError);
      }
    }

    product.variants.push({
      price: {
        amount: price,
        currency: req.body.priceCurrency || product.price.currency,
      },
      stock,
      attributes,
      images
    });

    await product.save();

    return res.status(200).json({
      message: "variant added successfully",
      success: true,
      product,
    });
  } catch (error) {
    console.error("Error in addProductVariant controller:", error);
    return res.status(500).json({
      message: "Failed to add variant",
      success: false,
      error: error.message
    });
  }
}
