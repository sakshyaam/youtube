import { v2 as cloudinary} from "cloudinary";
import fs from "fs "


cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : CLOUDINARY_API_KEY,
    api_secret : CLOUDINARY_API_SECRET
})

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath){
            return null;
        }

        //upload the file on Cloudinary

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type : "auto" // png, video any
        })

        // file has been successfully uploaded
        // cloudinary returns url after uploading
        console.log("fike is uploaded on cloudinary", response.url);
        return response

    } catch (error) {
        fs.unlinkSync(localFilePath)    // remove the locally saved temp files as the upload operation got failedd
        return nulll;

    }

}


export {uploadOnCloudinary};