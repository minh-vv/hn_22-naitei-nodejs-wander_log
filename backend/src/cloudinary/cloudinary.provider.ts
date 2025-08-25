import { v2 as cloudinary, ConfigOptions } from 'cloudinary';

export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  useFactory: () => {
    const conf: ConfigOptions = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    };
    console.log('cloud', process.env.CLOUDINARY_CLOUD_NAME);
    cloudinary.config(conf);
    return cloudinary;
  },
};
