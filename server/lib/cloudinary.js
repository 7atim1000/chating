import {v2 as cloudinary} from 'cloudinary' ;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export default cloudinary;

// exports: Are used to expose functioality from module to other module in our application
// we can export functions, variables, classes and other javascript entities by using export keywords