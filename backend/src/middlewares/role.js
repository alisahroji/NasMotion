/**
 * Middleware role-based access control
 * Penggunaan: authorizeRoles("admin") atau authorizeRoles("admin", "kasir")
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Silakan login terlebih dahulu.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak. Role '${req.user.role}' tidak memiliki izin.`,
      });
    }

    next();
  };
};

module.exports = authorizeRoles;