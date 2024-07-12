import multer from "multer";
import  Path  from "path";

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, "uploads/");
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${Path.extname(file.originalname)}`);
    },

});

export const uploder = multer({
    storage,
    fileFilter(req, file, cb) {
        const supportedFileTypes = /jpg|jpeg|pdf/;
        const ext = Path.extname(file.originalname);
        if (!ext.match(supportedFileTypes)) {
            return cb(new Error("File type not supported"));
        }
        cb(null, true);
    },
    limits: {
        fileSize: 2000000,
    },

});