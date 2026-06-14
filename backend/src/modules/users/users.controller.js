const argon2 = require("argon2");
const {
  getAllUsers,
  getUserById,
  findUserByEmail,
  createUser,
  updateUser,
  updateUserPassword,
  toggleUserStatus,
  deleteUser,
} = require("./users.service");

/**
 * GET /api/users
 * Query params: ?role=mekanik&is_active=true
 */
const getAll = async (req, res) => {
  try {
    const { role, is_active } = req.query;

    // Validasi role filter
    const validRoles = ["admin", "kasir", "mekanik"];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role tidak valid. Pilih: admin, kasir, mekanik.",
      });
    }

    const filters = {
      role: role || null,
      is_active: is_active !== undefined ? is_active === "true" : undefined,
    };

    const users = await getAllUsers(filters);

    return res.status(200).json({
      success: true,
      total: users.length,
      data: users,
    });
  } catch (err) {
    console.error("GetAll users error:", err.message);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
};

/**
 * GET /api/users/:id
 */
const getOne = async (req, res) => {
  try {
    const user = await getUserById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User tidak ditemukan." });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error("GetOne user error:", err.message);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
};

/**
 * POST /api/users
 * Body: { name, email, password, role }
 */
const create = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validasi input
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "name, email, password, dan role wajib diisi.",
      });
    }

    // Validasi role (admin tidak bisa dibuat via endpoint ini)
    const allowedRoles = ["kasir", "mekanik"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role hanya boleh: kasir atau mekanik.",
      });
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Format email tidak valid." });
    }

    // Validasi panjang password
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password minimal 6 karakter.",
      });
    }

    // Cek email sudah ada
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, message: "Email sudah digunakan." });
    }

    // Hash password
    const hashedPassword = await argon2.hash(password);

    const newUser = await createUser({ name, email, password: hashedPassword, role });

    return res.status(201).json({
      success: true,
      message: `Akun ${role} berhasil dibuat.`,
      data: newUser,
    });
  } catch (err) {
    console.error("Create user error:", err.message);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
};

/**
 * PUT /api/users/:id
 * Body: { name, email, role, password? }
 */
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, password } = req.body;

    // Validasi input wajib
    if (!name || !email || !role) {
      return res.status(400).json({
        success: false,
        message: "name, email, dan role wajib diisi.",
      });
    }

    // Cek user ada
    const existing = await getUserById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "User tidak ditemukan." });
    }

    // Cek email duplikat (selain user ini sendiri)
    const emailCheck = await findUserByEmail(email);
    if (emailCheck && emailCheck.id !== id) {
      return res.status(409).json({ success: false, message: "Email sudah digunakan." });
    }

    // Update data user
    const updated = await updateUser(id, { name, email, role });

    // Update password jika dikirim
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password minimal 6 karakter.",
        });
      }
      const hashedPassword = await argon2.hash(password);
      await updateUserPassword(id, hashedPassword);
    }

    return res.status(200).json({
      success: true,
      message: "User berhasil diupdate.",
      data: updated,
    });
  } catch (err) {
    console.error("Update user error:", err.message);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
};

/**
 * PATCH /api/users/:id/toggle-status
 */
const toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Cegah admin nonaktifkan dirinya sendiri
    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: "Tidak bisa mengubah status akun sendiri.",
      });
    }

    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User tidak ditemukan." });
    }

    const updated = await toggleUserStatus(id);

    return res.status(200).json({
      success: true,
      message: `Akun berhasil ${updated.is_active ? "diaktifkan" : "dinonaktifkan"}.`,
      data: updated,
    });
  } catch (err) {
    console.error("Toggle status error:", err.message);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
};

/**
 * DELETE /api/users/:id
 */
const remove = async (req, res) => {
  try {
    const { id } = req.params;

    // Cegah admin hapus dirinya sendiri
    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: "Tidak bisa menghapus akun sendiri.",
      });
    }

    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User tidak ditemukan." });
    }

    await deleteUser(id);

    return res.status(200).json({
      success: true,
      message: "User berhasil dihapus.",
    });
  } catch (err) {
    console.error("Delete user error:", err.message);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
};

module.exports = { getAll, getOne, create, update, toggleStatus, remove };
