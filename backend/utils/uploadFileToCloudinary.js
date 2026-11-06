const cloudinary = require("./cloudinary");
const streamifier = require("streamifier");

const uploadFileToCloudinary = (
    buffer,
    folder,
    resourceType = "auto",
    filename = null
) => {

    return new Promise((resolve, reject) => {

        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: resourceType,
                use_filename: true,
                unique_filename: true,
                filename_override: filename
            },
            (error, result) => {

                if (error) {
                    return reject(error);
                }

                resolve(result);

            }
        );

        streamifier
            .createReadStream(buffer)
            .pipe(stream);

    });

};

module.exports = uploadFileToCloudinary;