import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({

    userId: { type: String, required: true, ref : 'user' },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    offerPrice: { type: Number, required: true },
    images: { type: [String], required: true }, // Changed to array of strings
    category: { type: String, required: true },
    date: { type: Date, default: Date.now }, 

})

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

export default Product;