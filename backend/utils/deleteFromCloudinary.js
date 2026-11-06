// utils/deleteFromCloudinary.js

const cloudinary = require("./cloudinary");

const deleteFromCloudinary = async (
    publicId,
    resourceType = "auto"
) => {

    return cloudinary.uploader.destroy(
        publicId,
        {
            resource_type: resourceType
        }
    );

};

module.exports = deleteFromCloudinary;