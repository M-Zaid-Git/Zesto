import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import User from "@/models/User";

export async function GET(request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({success: false, message: "Unauthorized"});
        }

        await connectDB();
        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json({success: false, message: "User not found"});
        }

        return NextResponse.json({success: true, user: user});

    } catch (error) {
       return NextResponse.json({success: false, message: error.message});
    }
}