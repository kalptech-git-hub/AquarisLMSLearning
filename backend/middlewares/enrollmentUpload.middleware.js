const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        // const userId = req.user.um_id || "temp";

        const enrollmentId = req.params.id || "temp";

        const dir = path.join(
            __dirname,
            `../uploads/enrollments/${enrollmentId}`
        );

        fs.mkdir(dir, { recursive: true }, (err) => {

            if (err) {

                console.log(err);
                return cb(err);

            }

            cb(null, dir);

        });

    },

    filename: (req, file, cb) => {

        const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);

        const sanitizedName =
            file.originalname.replace(
                /[^a-zA-Z0-9._-]/g,
                "_"
            );

        cb(
            null,
            uniqueSuffix + "-" + sanitizedName
        );

    }

});

const fileFilter = (req, file, cb) => {

    const allowedTypes = [

        "image/jpeg",
        "image/png",
        "image/webp",
        "image/jpg",
        "application/pdf"

    ];

    if (allowedTypes.includes(file.mimetype)) {

        cb(null, true);

    } else {

        cb(
            new Error("Only image/pdf files allowed"),
            false
        );

    }

};

const upload = multer({

    storage,

    fileFilter,

    limits: {
        fileSize: 10 * 1024 * 1024
    }

});

module.exports = upload;