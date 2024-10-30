const mongoose = require('mongoose');
const Order =  require("../models/order.model");
const userSchema= new mongoose.Schema(
    {
        name:{
            type:String,
            required:true
        },
        email:{
            type:String,
            required:true,
            unique:true
        },
        password:{
            type:String,
            required:true
        },
        role:{
            type:String,
            enum:['user', 'admin'],
            default: 'user'
        }
    },{timestamps:true}
);


userSchema.pre("remove", async function (next) {
    try {
        await Order.deleteMany({ user: this._id });
        next();
    } catch (error) {
        next(error);
    }
});
module.exports = mongoose.model('User', userSchema);