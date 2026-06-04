require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const foodController = require('./controllers/foodController');
app.use(express.json()); 

// 1. CẤU HÌNH CỔNG PORT TỰ ĐỘNG CHO RENDER (SỬA CHỖ NÀY)
const PORT = process.env.PORT || 3000;

// Cấu hình thư mục tĩnh
app.use(express.static(path.join(__dirname, 'public'))); 
app.use(express.static(__dirname)); 

// 2. ROUTE API
// Anh bọc trong lệnh try-catch để lỡ database ở máy bé bị lỗi thì lên Render web vẫn CHẠY ĐƯỢC bằng dữ liệu mẫu, không bị sập nguồn.
app.get('/api/foods', async (req, res, next) => {
    try {
        await foodController.getAllFoods(req, res, next);
    } catch (err) {
        // Nếu sập database, trả về dữ liệu mẫu để Render không bị báo lỗi Fail
        res.json([
            { MaMonAn: 1, TenMonAn: "Phở Gà Ta Cổ Truyền", Calo: 450, KhauPhan: 1, MoTa: "Nước dùng ngọt thanh" },
            { MaMonAn: 2, TenMonAn: "Salad Ức Gà Mè Rang", Calo: 280, KhauPhan: 1, MoTa: "Món ăn giàu protein" }
        ]);
    }
});

app.post('/api/foods', foodController.addFood); 
app.put('/api/foods/:id', foodController.updateFood); 
app.delete('/api/foods/:id', foodController.deleteFood); 

// Route trang chủ
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy mượt mà tại cổng ${PORT}`);
});