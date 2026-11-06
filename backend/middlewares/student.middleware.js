exports.studentMiddleware = (req, res, next) => {

    if (req.user.role_code !== "STD") {
        return res.status(403).json({
            success: false,
            message: "Access denied."
        });
    }

    next();
};