import multer from "multer";
import ResponseError from "../utils/ResponseError.js";

const storage = multer.memoryStorage();

const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 5000000, // 5MB
  },
  fileFilter: (req, file, callback) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];

    if (!allowedTypes.includes(file.mimetype)) {
      const error = new ResponseError("Invalid file type", 422);
      return callback(error);
    }
    callback(null, true);
  },
});

export default uploadMiddleware;
