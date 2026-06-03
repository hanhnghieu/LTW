const db = require('../config/database');

class UserModel {
    // Tìm người dùng bằng tên đăng nhập
    static async findByUsername(username) {
        const sql = "SELECT * FROM NguoiDung WHERE TenDangNhap = ?";
        const [rows] = await db.execute(sql, [username]);
        return rows[0]; // Trả về người dùng đầu tiên tìm thấy
    }

    // Đăng ký người dùng mới (nếu bạn cần làm thêm chức năng Đăng ký)
    static async create(userData) {
        const sql = "INSERT INTO NguoiDung (TenDangNhap, MatKhau, Email) VALUES (?, ?, ?)";
        return await db.execute(sql, [userData.username, userData.password, userData.email]);
    }
}

module.exports = UserModel;
