import { auth } from "@clerk/nextjs/server";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Product from "@/models/product";
import authSeller from "@/lib/authSeller";


// This is a Cloudinary configuration file
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(request) {
  try {
    // Check if Cloudinary is properly configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json({ success: false, message: "Cloudinary configuration missing" }, { status: 500 });
    }

    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ success: false, message: "User not authenticated" }, { status: 401 });
    }
    
    const isSeller = await authSeller(userId);

    if (!isSeller) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
        }

        const formData = await request.formData();

        const name = formData.get('name');
        const description = formData.get('description');
        const category = formData.get('category');
        const price = formData.get('price');
        const offerPrice = formData.get('offerPrice');

        // Validate required fields
        if (!name || !description || !category || !price || !offerPrice) {
            return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 });
        }

        const files = formData.getAll('images');
       
        if (!files || files.length === 0) {
            return NextResponse.json({ success: false, message: "No images provided" }, { status: 400 });
        }

        const result = await Promise.all(files.map(async (file) => {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

    return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {resource_type: 'auto'},
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                   
                }
            );
            
            stream.end(buffer);
        });
    }));

    const image = result.map(result => result.secure_url);    

    await connectDB();
    const newProduct = await Product.create({
        userId,
        name,
        description,
        category,
        price: Number(price),
        offerPrice: Number(offerPrice),
        images: image,
        date: Date.now(),
    });

    return NextResponse.json({ success: true, message: "Product added successfully", product: newProduct }, { status: 201 });

  } catch (error) {
       console.error('Error in product add API:', error);
       return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}