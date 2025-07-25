import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Product from "@/models/product";
import authSeller from "@/lib/authSeller";
import { inngest } from "@/config/inngest"; 




export async function GET(request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ success: false, message: "User not authenticated" });
        }

        const isSeller = await authSeller(userId);

        if (!isSeller) {
            return NextResponse.json({ success: false, message: "Unauthorized" });
        }

        await connectDB();

        // Fetch products for the seller
        const products = await Product.find({ userId: userId });
        console.log(`Found ${products.length} products for seller ${userId}`);
        return NextResponse.json({ success: true, products });

    } catch (error) {
        console.error('Error in seller-list API:', error);
        return NextResponse.json({ success: false, message: error.message });
    }
}