const multer = require("multer");
// const path = require("path");
// const fs = require("fs");

// const storage = multer.diskStorage({

//   destination: (req, file, cb) => {

//     const courseId = req.params.id || "temp";

//     const dir = path.join(
//       __dirname,
//       `../uploads/courses/${courseId}`
//     );

//     fs.mkdir(dir, { recursive: true }, (err) => {

//       if (err) {
//         console.log(err);
//         return cb(err);
//       }

//       cb(null, dir);

//     });
//   },

//   filename: (req, file, cb) => {

//     const uniqueSuffix =
//       Date.now() + "-" + Math.round(Math.random() * 1e9);

//     const sanitizedName =
//       file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");

//     cb(null, uniqueSuffix + "-" + sanitizedName);

//   },

// });

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg"
  ];

  if (allowedTypes.includes(file.mimetype)) {

    cb(null, true);

  } else {

    cb(new Error("Only image files allowed"), false);

  }

};

const upload = multer({

  storage,

  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024
  }

});

module.exports = upload;