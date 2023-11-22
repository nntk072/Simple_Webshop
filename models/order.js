const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductModel = require('./product')

const orderSchema = new Schema({
    product: {
        type: ProductModel.productSchema,
        default: {},
        required: true
    },

    quantity: {
        type: Number,
        required: true,
    }
})

orderSchema.set('toJSON', { virtuals: false, versionKey: false });

const Order = new mongoose.model('Order', orderSchema);
module.exports = Order;