import mongoose from "mongoose";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Product from "@/models/product";

export async function GET(request) {
    try {
        await connectDB();

        // Fetch all products for main page
        const products = await Product.find({});
        console.log(`Found ${products.length} total products`);
        return NextResponse.json({ success: true, products });

    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ success: false, message: error.message });
    }
}