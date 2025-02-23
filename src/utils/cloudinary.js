import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

// Configuration
cloudinary.config({ 
    cloud_name: 'dhobgmal7', 
    api_key: '769313922676363', 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

export const uploadFileToCloudinary = async (filePath) => {
    try {
        if(!filePath) return null;

        const response = await cloudinary.uploader.upload(filePath, {
            resource_type: 'auto',
        });
        console.log("File upload successful." , response.url);
        console.log(filePath);
        fs.unlinkSync(filePath);
        return response.url;
    } catch (error) {
        console.log(error);
        fs.unlinkSync(filePath);
        return null;
    }
}
    