import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

const uploader = multer({
    storage,
    fileFilter(req, file, cb) {
        const supportedFileTypes = /jpg|jpeg|png/;
        const ext = path.extname(file.originalname).toLowerCase();
        if (!ext.match(supportedFileTypes)) {
            return cb(new Error('File type not supported'));
        }
        cb(null, true);
    },
    limits: {
        fileSize: 10000000, // 10MB
    },
});

export default uploader;
