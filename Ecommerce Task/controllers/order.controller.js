const Order = require("../models/order.model");
const Product = require("../models/product.model");

const { body, param } = require("express-validator");

const placeOrderValidation = [
    body('products')
        .isArray().withMessage('Products must be an array')
        .notEmpty().withMessage('No products provided for the order')
        .custom((value) => {
            for (const item of value) {
                if (!item.productId || !item.quantity) {
                    throw new Error('Each product must have a productId and a quantity');
                }
            }
            return true;
        })
];

const updateOrderValidation = [
    param('id').isMongoId().withMessage('Invalid order ID'),
    body('status')
        .optional()
        .isIn(['pending', 'completed', 'cancelled']).withMessage('Invalid status'),
    body('products')
        .optional()
        .isArray().withMessage('Products must be an array')
        .custom((value) => {
            for (const item of value) {
                if (!item.Id || !item.quantity) {
                    throw new Error('Each product must have an Id and a quantity');
                }
            }
            return true;
        })
];

const cancelOrderValidation = [
    param('id').isMongoId().withMessage('Invalid order ID')
];


// Place an order
const placeOrder = (io) => async (req, res, next) => {
    console.log("User info:", req.user); // Log user information

    try {
        const { products } = req.body;

        if (!products || products.length === 0) {
            const error = new Error("No products provided for the order");
            error.statusCode = 400;
            throw error;
        }

        let totalPrice = 0;
        let orderedProducts = [];

        for (let item of products) {
            const product = await Product.findById(item.productId);
            if (!product) {
                const error = new Error(`Product with ID ${item.productId} not found`);
                error.statusCode = 404;
                throw error;
            }
            if (product.stockQuantity < item.quantity) {
                const error = new Error(`Product ${product.name} is out of stock`);
                error.statusCode = 400;
                throw error;
            }
            totalPrice += product.price * item.quantity;
            orderedProducts.push({ product: product._id, quantity: item.quantity });
        }

        const order = await Order.create({
            user: req.user.userId,
            totalPrice,
            products: orderedProducts,
        });

        for (let item of orderedProducts) {
            await Product.findByIdAndUpdate(item.product, { $inc: { stockQuantity: -item.quantity } });
        }

        io.emit('orderPlaced', {
            message: "New Order Placed",
            order: order
        });
        console.log("Order placed event emitted via socket.io");


        return res.status(201).json({
            message: "Order placed successfully",
            success: true,
            order
        });

    } catch (error) {
        console.error("Error placing order:", error);
        next(error);
    }
};

const getAllOrders = async (req, res, next) => {
    let orders;
    try {
        if (req.user.role === "admin") {
            orders = await Order.find()
                .populate({
                    path: 'products.product',
                    select: 'name price'
                })
                .populate({
                    path: 'user',
                    select: 'name'
                });
        } else {
            // For regular users, only fetch their own orders
            orders = await Order.find({ user: req.user.userId })
                .populate({
                    path: 'products.product',
                    select: 'name price'
                })
                .populate({
                    path: 'user',
                    select: 'name'
                });
        }


        return res.status(200).json({
            message: "All Orders retrieved successfully",
            orders,
            success: true
        });
    } catch (error) {
        console.error("Error in getting orders:", error);
        next(error);
    }
};


const getOrderById = async (req, res, next) => {
    const { id } = req.params;

    try {
        const order = await Order.findById(id).populate({
            path: 'products.product',
            select: 'name price'
        });
       // Check if order exists
       if (!order) {
        const error = new Error("Order not found");
        error.statusCode = 404;
        throw error;
    }

    // If the user is not an admin, check ownership
    if (req.user.role !== 'admin' && order.user.toString() !== req.user.userId) {
        const error = new Error("You are not authorized to access this order");
        error.statusCode = 403; // Forbidden
        throw error;
    }
        return res.status(200).json({
            message: "Order retrieved successfully",
            order,
            success: true
        });
    } catch (error) {
        console.error("Error retrieving order by id:", error);
        next(error);
    }
};

// Update Order
const updateOrderById = async (req, res, next) => {
    const { id } = req.params;
    const { products } = req.body;

    try {
        let order = await Order.findById(id);

        if (!order) {
            const error = new Error("Order not found");
            error.statusCode = 404;
            throw error;
        }

        // Allow admin to cancel any order; regular users can only update their own
        if (req.user.role !== 'admin' && order.user.toString() !== req.user.userId) {
            const error = new Error("You are not authorized to change this order");
            error.statusCode = 403; // Forbidden
            throw error;
        }
      

        if (products && products.length > 0) {
            let totalPrice = 0;
            let updatedProducts = [];

            for (let item of products) {
                const product = await Product.findById(item.Id);

                if (!product) {
                    const error = new Error(`Product with ID ${item.Id} not found`);
                    error.statusCode = 404;
                    throw error;
                }

                const existingOrderProduct = order.products.find(p => p.product.toString() === product._id.toString());
                const previousQuantity = existingOrderProduct ? existingOrderProduct.quantity : 0;
                const quantityChange = item.quantity - previousQuantity;

                if (quantityChange > 0 && product.stockQuantity < quantityChange) {
                    const error = new Error(`Not enough stock for product ${product.name}`);
                    error.statusCode = 400;
                    throw error;
                }

                totalPrice += product.price * item.quantity;
                updatedProducts.push({ product: product._id, quantity: item.quantity });

                await Product.findByIdAndUpdate(product._id, { $inc: { stockQuantity: -quantityChange } });
            }

            order.products = updatedProducts;
            order.totalPrice = totalPrice;
        }
        
        //allowing only admins to change status of order
        if (req.user.role === 'admin' && req.body.status) {
            order.status = req.body.status;
        }


        order = await order.save();

        return res.status(200).json({
            message: "Order updated successfully",
            order,
            success: true
        });

    } catch (error) {
        console.error("Error updating order:", error);
        next(error);
    }
};

// Cancel Order
const cancelOrderById = (io) => async (req, res, next) => {
    const { id } = req.params;

    try {
        const order = await Order.findById(id);
        if (!order) {
            const error = new Error("Order not found");
            error.statusCode = 404;
            throw error;
        }

        // Allow admin to cancel any order; regular users can only cancel their own
        if (req.user.role !== 'admin' && order.user.toString() !== req.user.userId) {
            const error = new Error("You are not authorized to cancel this order");
            error.statusCode = 403; // Forbidden
            throw error;
        }
        if (order.status === "delivered") {
            const error = new Error("Cannot cancel a delivered order");
            error.statusCode = 400;
            throw error;
        }

        order.status = 'cancelled';
        await order.save();

        io.emit('orderCanceled', {
            message: "Order canceled",
            order
        });

        return res.status(200).json({
            message: "Order cancelled successfully",
            order,
            success: true
        });

    } catch (error) {
        console.error("Error cancelling order:", error);
        next(error);
    }
};

module.exports = {
    placeOrder,
    getAllOrders,
    getOrderById,
    updateOrderById,
    cancelOrderById,
    placeOrderValidation,
    updateOrderValidation,
    cancelOrderValidation,
    
};
