const cloudinary = require('cloudinary');
const fs = require('fs');

cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.CLOUD_API_KEY, 
    api_secret: process.env.CLOUD_API_SECRET // Click 'View Credentials' below to copy your API secret
});

const uploadOnCLoudinary = async(localFilePath)=>{
    try{
        if(!localFilePath){
            return null;
        }
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type : "auto"
        })
        fs.unlinkSync(localFilePath);
        console.log('file uploaded',response.url);
        return response;
    }
    catch(error){
        fs.unlinkSync(localFilePath); // remove the temporary file
        return null;
    }
}
module.exports = uploadOnCLoudinary;