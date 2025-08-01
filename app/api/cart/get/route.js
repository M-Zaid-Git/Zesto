import connectDB from "@/config/db";
import User from "@/models/User";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";



export async function GET(request) {
    try {
        
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" });
        }

        await connectDB();
        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" });
        }

        const { cartItems } = user;
        return NextResponse.json({ success: true, cartItems: cartItems || {} });

    } catch (error) {
        console.error('Error getting cart:', error);
        return NextResponse.json({ success: false, message: error.message });
    }
}