const jwt = require("jsonwebtoken");
const { findUserById } = require("../modules/auth/auth.service");

const verifyToken = async (req, res, next) => {
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

    // Validasi is_active dari DATABASE (bukan dari payload JWT yang bisa
    // stale): user yang dinonaktifkan admin harus langsung kehilangan akses,
    // walau JWT-nya masih valid sampai expired.
    const dbUser = await findUserById(decoded.id);
    if (!dbUser) {
      return res.status(401).json({
        success: false,
        message: "Sesi tidak valid. Silakan login kembali.",
      });
    }
    if (!dbUser.is_active) {
      return res.status(403).json({
        success: false,
        message: "Akun kamu dinonaktifkan. Hubungi admin.",
      });
    }

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