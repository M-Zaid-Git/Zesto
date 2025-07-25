import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Address from "@/models/address";

export async function POST(request) { 

    try {
        
        const { userId } = await auth();
        
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" });
        }

        const address = await request.json();

        // Validate required fields
        if (!address.fullName || !address.phoneNumber || !address.area || !address.city) {
            return NextResponse.json({ success: false, message: "All required fields must be filled" });
        }

        await connectDB();
        const newAddress = await Address.create({...address, userId});

        return NextResponse.json({ success: true, message: "Address added successfully", address: newAddress });

    } catch (error) {
        console.error('Error adding address:', error);
        return NextResponse.json({ success: false, message: "Failed to add address", error: error.message });
    }
}