const instructorMiddleware = (req, res, next) => {

  try {

    if (req.user.role_code !== "INS") {

      return res.status(403).json({
        success: false,
        message: "Access denied"
      });

    }

    next();

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }

};

module.exports = instructorMiddleware;