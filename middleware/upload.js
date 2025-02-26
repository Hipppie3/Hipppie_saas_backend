import multer from "multer";

// Store image in memory (or you can use disk storage)
const storage = multer.memoryStorage(); 
const upload = multer({ storage });

export default upload;
