// middleware/lessonContentUpload.js

const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage();

// const lessonContentUpload = multer({
//     storage,

//     fileFilter: (req, file, cb) => {

//         console.log(
//             "Uploaded MIME:",
//             file.mimetype
//         );


//         const allowed = [

//             // "image/jpeg",
//             // "image/png",
//             // "image/jpg",
//             // "image/webp"

//             "application/pdf",

//             "image/jpeg",
//             "image/jpg",
//             "image/png",
//             "image/webp",

//             "audio/mpeg",
//             "audio/mp3",
//             "audio/wav",

//             "application/msword",
//             "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

//         ];

//         if (allowed.includes(file.mimetype))

//             cb(null, true);

//         else {

//             console.log(
//                 "Blocked MIME:",
//                 file.mimetype
//             );

//             cb(
//                 new Error(
//                     "Only Images Allowed")
//                 );
//         }


//     },

//     limits: {
//         fileSize: 20 * 1024 * 1024 // 20 MB
//     }
// });

const lessonContentUpload = multer({
    storage,

    fileFilter: (req, file, cb) => {

        console.log(file.originalname);

        console.log(
            "Uploaded MIME:",
            file.mimetype
        );


        const allowedMimeTypes = [

            // "image/jpeg",
            // "image/png",
            // "image/jpg",
            // "image/webp"

            "application/pdf",

            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",

            "audio/mpeg",
            "audio/mp3",
            "audio/wav",

            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

        ];

        const allowedExtensions = [

            ".pdf",
            ".jpg",
            ".jpeg",
            ".png",
            ".webp",

            ".mp3",
            ".wav",

            ".doc",
            ".docx"
        ];

        // if (allowed.includes(file.mimetype))

        //     cb(null, true);

        // else {

        //     console.log(
        //         "Blocked MIME:",
        //         file.mimetype
        //     );

        //     cb(
        //         new Error(
        //             "Only Images Allowed")
        //         );
        // }

        /* */
        const extension = path.extname(
            file.originalname
        ).toLowerCase();

        // if (
        //     allowedMimeTypes.includes(file.mimetype) ||
        //     (
        //         file.mimetype === "application/octet-stream" &&
        //         allowedExtensions.includes(extension)
        //     )
        // ) {

        //     return cb(null, true);

        // }

        // cb(
        //     new Error(
        //         `Unsupported file type: ${file.originalname}`
        //     )
        // );


        const isValidMime =
            allowedMimeTypes.includes(
                file.mimetype
            );

        const isValidOctetStream =
            file.mimetype === "application/octet-stream" &&
            allowedExtensions.includes(extension);

        if (
            isValidMime ||
            isValidOctetStream
        ) {
            return cb(null, true);
        }

        cb(
            new Error(
                `Unsupported file type: ${file.originalname}`
            )
        );

    },

    limits: {
        fileSize: 20 * 1024 * 1024 // 20 MB
    }
});

module.exports = lessonContentUpload;