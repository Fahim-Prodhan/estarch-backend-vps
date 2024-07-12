import { v2 as cloudinary } from "cloudinary";

export const uploadSingle = async (req, res, next) => {
  try {
    const uploadResponse = await cloudinary.uploader.upload(req.file.path);
    
    const { public_id, url } = uploadResponse;

    req.body.file = url;
    next();
  } catch (error) {
    console.log(error);
  }
};
