const express = require('express');
const {
    placeOrder, getAllOrders, getOrderById,  updateOrderById,   cancelOrderById,   placeOrderValidation, cancelOrderValidation,
    updateOrderValidation} = require("../controllers/order.controller");
const verifyToken = require("../middlewares/authMiddleware");
const authorizeByRole = require("../middlewares/roleMiddleware");
const validate = require('../middlewares/validationMiddleware');
const limiter = require("../middlewares/ratelimitMiddleware");


const router = express.Router();

module.exports = (io) => { 
    // Place an order
    router.post('/place', limiter,  verifyToken, authorizeByRole("user"),   placeOrderValidation,  validate,  placeOrder(io) );
    
    router.get("/", limiter, verifyToken, authorizeByRole("admin", "user"), getAllOrders);

    // Get order by ID
    router.get("/:id",  limiter,   verifyToken,authorizeByRole("admin", "user"),   getOrderById   );

    // Update order
    router.put("/update/:id", limiter, verifyToken, authorizeByRole("admin", "user"),  updateOrderValidation, validate, updateOrderById );

    // Cancel order
    router.delete("/cancel/:id",  limiter,  verifyToken,  authorizeByRole("admin", "user"), cancelOrderValidation, validate, cancelOrderById(io)    );

    return router; // Return the router
};
