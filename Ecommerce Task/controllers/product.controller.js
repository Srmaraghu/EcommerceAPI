const Product = require("../models/product.model");
const cloudinary = require("../services/cloudinary");
const { body , param, query } = require("express-validator");

// Validation rules for creating a product
const createProductValidation = [
    body('name')
        .notEmpty().withMessage('Product Name is required'),
    body('price')
        .notEmpty().withMessage('Product Price is required')
        .isNumeric().withMessage('Product Price must be a number'),
    body('description')
        .notEmpty().withMessage('Product Description is required'),
    body('stockQuantity')
        .notEmpty().withMessage('Must Enter product stock Quantity ')
        .isInt({ gt: 0 }).withMessage('Stock Quantity must be a positive integer')
];

// Validation rules for updating a product
const updateProductValidation = [
    param('id')
        .notEmpty().withMessage('Product ID is required'),
    body('name')
        .optional()
        .notEmpty().withMessage('Product Name cannot be empty'),
    body('price')
        .optional()
        .notEmpty().withMessage('Product Price is required')
        .isNumeric().withMessage('Product Price must be a number'),
    body('description')
        .optional()
        .notEmpty().withMessage('Product Description cannot be empty'),
    body('stockQuantity')
        .optional()
        .notEmpty().withMessage('Must Enter product stock Quantity ')
        .isInt({ gt: 0 }).withMessage('Stock Quantity must be a positive integer')
];

// Validation rules for deleting a product
const deleteProductValidation = [
    param('id')
        .notEmpty().withMessage('Product ID is required')
];

// Validation rules for getting products by name
const getProductByNameValidation = [
    query('search')
        .optional()
        .isString().withMessage('Search term must be a string')
];

// Create Product
const createProduct = async (req, res, next) => {
    
    try {
        const { name, price, description, stockQuantity } = req.body;

        // Check if there's a file and upload it to Cloudinary
        if (req.file) {
            const uploadResult = await cloudinary.uploader.upload(req.file.path);
            imageUrl = uploadResult.secure_url;
        } else {
            return res.status(400).json({ error: 'Product image is required' });
        }

        const product = await Product.create({
            name,
            description,
            stockQuantity,
            price,
            image: imageUrl
        });

        return res.json({
            product,
            message: "Product created successfully",
            success: true
        });
        
    } catch (error) {
        next(error);
    }
};


// Update Product
const updateProduct = async (req, res, next) => {
    
    try {
        const { id } = req.params;
        const { name, price, description, stockQuantity } = req.body;

        const updatedData = {};

        if (name) updatedData.name = name;
        if (price) updatedData.price = price;
        if (description) updatedData.description = description;
        if (stockQuantity) updatedData.stockQuantity = stockQuantity;

        if (req.file) {
            const uploadResult = await cloudinary.uploader.upload(req.file.path, {
                resource_type: 'image',
                public_id: name,
                overwrite: true
            });
            updatedData.image = uploadResult.secure_url;
        }

        const product = await Product.findByIdAndUpdate(id, updatedData, { new: true });

        if (!product) {
            const error = new Error("Product not found");
            error.statusCode = 404;
            throw error;
        }

        return res.status(200).json({
            product,
            message: "Product updated successfully",
            success: true
        });
    } catch (error) {
        next(error);
    }
};

// Delete Product
const deleteProduct = async (req, res, next) => {
    
    try {
        const { id } = req.params;
        const product = await Product.findById(id);

        if (!product) {
            const error = new Error("Product not found");
            error.statusCode = 404;
            throw error;
        }
        await product.deleteOne();

        res.status(200).json({
            message: "Product deleted successfully",
            success: true
        });
    } catch (error) {
        next(error);
    }
};

// Get Product by Name
const getProductByName = async (req, res, next) => {
    
    try {
        const { search } = req.query;

        let query = {};
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const products = await Product.find(query);

        if (products.length === 0) {
            const error = new Error("No products found");
            error.statusCode = 404;
            throw error;
        }

        return res.status(200).json({
            products,
            message: "Products retrieved successfully",
            success: true
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createProduct,
    updateProduct,
    deleteProduct,
    getProductByName,
    createProductValidation,
    updateProductValidation,
    deleteProductValidation,
    getProductByNameValidation
};
