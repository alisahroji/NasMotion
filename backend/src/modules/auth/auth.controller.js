const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const { findUserByEmail, findUserById } = require("./auth.service");

/**
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email dan password wajib diisi.",
      });
    }

    // Cek user ada
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah.",
      });
    }

    // Cek user aktif
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "Akun kamu dinonaktifkan. Hubungi admin.",
      });
    }

    // Verifikasi password
    const isValid = await argon2.verify(user.password, password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah.",
      });
    }

    // Generate JWT
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "8h",
    });

    // Set cookie HttpOnly
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 8 * 60 * 60 * 1000, // 8 jam dalam ms
    });

    return res.status(200).json({
      success: true,
      message: "Login berhasil.",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server.",
    });
  }
};

/**
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({
      success: true,
      message: "Logout berhasil.",
    });
  } catch (err) {
    console.error("Logout error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server.",
    });
  }
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    const user = await findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan.",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    console.error("GetMe error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server.",
    });
  }
};

module.exports = { login, logout, getMe };
