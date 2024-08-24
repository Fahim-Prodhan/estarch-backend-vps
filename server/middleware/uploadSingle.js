import multer from 'multer';
import uploader from './uploader.js';

export const uploadSingle = (req, res, next) => {
    const upload = uploader.single('image');

    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // Handle multer-specific errors
            return res.status(400).json({ error: err.message });
        } else if (err) {
            // Handle other errors
            return res.status(400).json({ error: err.message });
        }
        next();
    });
};
