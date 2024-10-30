const express = require('express');
const {  createProduct,    updateProduct,    deleteProduct,    getProductByName,    createProductValidation,    updateProductValidation,    deleteProductValidation,
    getProductByNameValidation} = require("../controllers/product.controller");
const verifyToken = require("../middlewares/authMiddleware")
const authorizeByRole = require("../middlewares/roleMiddleware");
const upload = require("../services/upload");
const validate = require('../middlewares/validationMiddleware');

const limiter = require("../middlewares/ratelimitMiddleware");


const router = express.Router();

router.post("/",limiter,verifyToken, authorizeByRole("admin"),upload.single('image'),createProductValidation, validate , createProduct);

router.put("/:id",limiter,verifyToken, authorizeByRole("admin"),upload.single('image'),updateProductValidation , validate ,  updateProduct);

router.delete("/delete/:id",limiter, verifyToken, authorizeByRole("admin"),deleteProductValidation, validate , deleteProduct);

router.get("/",limiter, getProductByNameValidation,  validate , getProductByName);

module.exports = router;