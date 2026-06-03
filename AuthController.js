const UserModel = require('../models/userModel');

const authController = {
    login: async (req, res) => {
        const { username, password } = req.body;

        try {
            const user = await UserModel.findByUsername(username);

            if (!user) {
                return res.status(401).json({ message: "Tên đăng nhập không tồn tại!" });
            }

            // Kiểm tra mật khẩu (Trong thực tế nên dùng thư viện bcrypt để mã hóa)
            if (user.MatKhau !== password) {
                return res.status(401).json({ message: "Mật khẩu không chính xác!" });
            }

            // Nếu đúng, trả về thông báo thành công
            res.json({ 
                message: "Đăng nhập thành công!", 
                user: { id: user.MaNguoiDung, name: user.TenDangNhap } 
            });

        } catch (error) {
            res.status(500).json({ message: "Lỗi hệ thống: " + error.message });
        }
    }
};

module.exports = authController;