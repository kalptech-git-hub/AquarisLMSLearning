const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({

    storage,

    fileFilter: (req, file, cb) => {

        const allowed = [

            "image/jpeg",
            "image/png",
            "image/jpg",
            "image/webp"

        ];

        if (allowed.includes(file.mimetype))

            cb(null, true);

        else

            cb(new Error("Only Images Allowed"));

    },

    limits: {

        fileSize: 5 * 1024 * 1024

    }

});

module.exports = upload;