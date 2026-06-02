const express = require('express');
const path = require('path');
const app = express();
const foodController = require('./controllers/foodController');
app.use(express.json()); 

// Cấu hình thư mục tĩnh
app.use(express.static(path.join(__dirname, 'public'))); 
app.use(express.static(__dirname)); 

// Route API
app.get('/api/foods', foodController.getAllFoods);
app.post('/api/foods', foodController.addFood); // Thêm dòng này nếu chưa có để thêm món
app.put('/api/foods/:id', foodController.updateFood); 
app.delete('/api/foods/:id', foodController.deleteFood); 

// Route trang chủ
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(3000, () => {
    console.log("🚀 Server đang chạy tại http://localhost:3000");
});