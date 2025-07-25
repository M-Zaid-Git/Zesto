import Address from "@/models/address";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";

export async function GET(request) {

    try {

        const { userId } = await auth();
        
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" });
        }
        
        await connectDB();
        const addresses = await Address.find({ userId });

        return NextResponse.json({ success: true, addresses });

    } catch (error) {
        console.error('Error fetching addresses:', error);
        return NextResponse.json({ success: false, message: "Failed to retrieve addresses", error: error.message });
    }

}