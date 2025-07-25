import { auth } from "@clerk/nextjs/server";
import User from "@/models/User";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";



export async function POST(request) {

    try {
        
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" });
        }

        const cartData = await request.json();

        await connectDB();
        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" });
        }

        user.cartItems = cartData;
        await user.save();

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error updating cart:', error);
        return NextResponse.json({ success: false, message: error.message });
    }
}