import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('Testing Cloudinary config with credentials:');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY);
console.log('API Secret is set:', !!process.env.CLOUDINARY_API_SECRET);

// Upload a 1x1 transparent PNG pixel in base64 format
const dummyBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

cloudinary.uploader.upload(dummyBase64, { folder: 'verification_test' }, (error, result) => {
  if (error) {
    console.error('\n--- CLOUDINARY API UPLOAD ERROR ---');
    console.error(error);
  } else {
    console.log('\n--- CLOUDINARY API UPLOAD SUCCESS ---');
    console.log('URL:', result.secure_url);
    console.log('Public ID:', result.public_id);
  }
});
