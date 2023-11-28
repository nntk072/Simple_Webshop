const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
});

productSchema.set('toJSON', { virtuals: false, versionKey: false });

const Product = new mongoose.model('Product', productSchema);
module.exports = Product;