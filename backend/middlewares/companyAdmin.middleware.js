const companyAdminMiddleware = (req, res, next) => {
  try {

    // console.log("Authenticated user:", req.user);
    // console.log("Company ID:", req.user?.company_id);
    // console.log("Company name:", req.user?.company_name);


    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    // Role check: CAD = CompanyAdmin
    if (req.user.role_code !== "CAD") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Company Admin only."
      });
    }

    if (!req.user.company_id) {
      return res.status(403).json({
        success: false,
        message: "No company associated with this account."
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

module.exports = companyAdminMiddleware;