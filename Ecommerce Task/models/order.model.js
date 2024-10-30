const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({

    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, required: true }
    }],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    totalPrice: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'delivered', 'cancelled'],
        default: 'pending'
    },
    dateOrdered: {
        type: Date,
        default: Date.now
    }


}, {
    timestamps: true
});

module.exports = mongoose.model("Order", orderSchema);