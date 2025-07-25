import { inngest } from "@/config/inngest";
import User from "@/models/User";
import Product from "@/models/product";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";

export async function POST(request) {

    try {
        const { userId } = await auth();
        
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" });
        }
        
        const { address, items } = await request.json();

        if ( !address || items.length === 0) {
            return NextResponse.json({ success: false, message: "Invalid request data" });
        }


        // Calculate total amount
        let amount = 0;
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (product) {
                amount += product.offerPrice * item.quantity;
            }
        }

        await inngest.send({
            name: "order/created",
            data: {
                userId,
                address,
                items,
                amount: amount + Math.floor(amount * 0.02), // Adding 2% tax
                date: Date.now()
            }
        })

// Clear User Cart
        await connectDB();
        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" });
        }

        user.cartItems = {};
        await user.save();

        return NextResponse.json({ success: true, message: "Order created successfully" });
       
    } catch (error) {
        console.error("Error creating order:", error);
        return NextResponse.error();
    }
}
        