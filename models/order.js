const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// This is copy-paste model from product
// EXCEPT: here is no image field. Because it is not rquired here
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

    description: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 400
    }
});

const orderInnerSchema = new Schema ({
    product: {
        type: productSchema,
        default: {},
        required: true
    },
    
    quantity: {
        type: Number,
        required: true,
    }
});

const orderSchema = new Schema({

    customerId: {
        type: String,
        required: true
    },

    items: {
        type: [orderInnerSchema],
        default: undefined
    }
});

orderSchema.set('toJSON', { virtuals: false, versionKey: false });

const Order = new mongoose.model('Order', orderSchema);
module.exports = Order;