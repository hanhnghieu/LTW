const UserModel = require('../models/userModel');
const bcrypt = require('bcrypt');

const authController = {

    login: async (req, res) => {

        const { username, password } = req.body;

        try {

            const user =
                await UserModel.findByUsername(username);

            if (!user) {
                return res.status(401).json({
                    message: "Tên đăng nhập không tồn tại!"
                });
            }

            const match =
                await bcrypt.compare(
                    password,
                    user.MatKhau
                );

            if (!match) {
                return res.status(401).json({
                    message: "Sai mật khẩu!"
                });
            }

            res.json({
                message: "Đăng nhập thành công!",
                user: {
                    id: user.MaNguoiDung,
                    name: user.TenDangNhap
                }
            });

        } catch (error) {

            res.status(500).json({
                message: error.message
            });

        }
    }
};

module.exports = authController;
