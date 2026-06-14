const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  try {
    // Ambil token dari cookie atau Authorization header
    const token =
      req.cookies?.token ||
      req.headers?.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Akses ditolak. Token tidak ditemukan.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, name, email, role }
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Token tidak valid atau sudah expired.",
    });
  }
};

module.exports = verifyToken;