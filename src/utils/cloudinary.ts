import dotenv from "dotenv";
import { ConfigOptions, v2 as cloudinary } from "cloudinary";

dotenv.config({ path: "../../.env" });

const config: ConfigOptions = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
};

cloudinary.config(config);

export { cloudinary };
