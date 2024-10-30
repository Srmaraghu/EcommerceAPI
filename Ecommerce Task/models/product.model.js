const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: { 
        type: String,
         required: true,
         index:true,
         },

    price: { 
        type: Number,
         required: true
         },
    description: {
         type: String, 
         required: true 
        },
    stockQuantity:{
        type:Number,
        required:true,

    },
    image:
    {
        type:String,
    }

},
{timestamps:true}
);

productSchema.pre("deleteOne",{document: true , query:false}, async function(next){
    try {
        await Order.updateMany(
            { "products.product": this._id }, // Match orders containing the product
            { $pull: { products: { product: this._id } } } // Remove the product from orders
        );
        
        
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model("Product", productSchema);