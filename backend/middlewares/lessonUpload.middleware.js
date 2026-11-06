const path = require("path");

const multer = require("multer");

// const storage = multer.memoryStorage();
const storage = multer.diskStorage({
    destination: "./uploads",
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {

    const ext = path.extname(file.originalname).toLowerCase();

    const allowedExtensions = [

        // Video
        ".mp4",
        ".mov",
        ".avi",
        ".mkv",
        // Documents
        ".pdf",
        ".doc",
        ".docx",
        ".ppt",
        ".pptx",
        ".txt",
        ".zip",
        // Images
        ".png",
        ".jpg",
        ".jpeg",
        ".gif",
        // Audio
        ".mp3",
        ".wav"

    ];

    if (allowedExtensions.includes(ext)) {

        return cb(null, true);

    }

    cb(new Error("Only video files are allowed."), false);

};

const lessonUpload = multer({

    storage,

    fileFilter,

    limits: {

      fileSize: 80 * 1024 * 1024

    }

});

module.exports = lessonUpload;