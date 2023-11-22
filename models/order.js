const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// This is copy-paste model from product
// tests do not allow to export 1 more function, so here we replicate this model to make it subtype
const productSchema = new Schema({
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 80,
    },

    price: {
        type: Number,
        required: true,
    },

    image: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 120
    },

    description: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 400
    }
})


const orderSchema = new Schema({
    product: {
        type: productSchema,
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