import multer from 'multer';

// Configure multer to use memory storage. This means the file is held in memory
// before being uploaded to Cloudinary, without saving it to the server's disk.
const storage = multer.memoryStorage();

// Initialize multer with the storage configuration.
// We are specifying that we expect a single file with the field name 'image'.
const upload = multer({ storage: storage });

export default upload;