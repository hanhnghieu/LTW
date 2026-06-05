// ==========================================================================
// 1. ĐIỀU HƯỚNG TAB GIAO DIỆN
// ==========================================================================
function showSection(sectionId, event) {
    const sections = document.querySelectorAll('.tab-content');
    sections.forEach(section => {
        section.style.display = 'none';
        section.classList.remove('active');
    });

    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.style.display = 'block';
        activeSection.classList.add('active');
    }

    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });

    // Khắc phục triệt để việc dùng biến 'event' toàn cục không an toàn
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    // Nếu người dùng chọn tab quản lý dinh dưỡng hoặc dashboard thì nạp lại giao diện tức thời
    if (sectionId === 'food-manager') {
        const dateInput = document.getElementById('history-date');
        if (dateInput && dateInput.value) {
            renderDailyTable(dateInput.value);
        }
    } else if (sectionId === 'dashboard') {
        drawChart();
    }
}

// ==========================================================================
// 2. CẬP NHẬT LỜI CHÀO THEO THỜI GIAN THỰC
// ==========================================================================
function updateGreeting() {
    const greetingElement = document.getElementById('greeting');
    const heroSection = document.getElementById('hero-bg');
    
    const loginBtn = document.getElementById('nav-login-btn');
    const registerBtn = document.getElementById('nav-register-btn');
    const logoutBtn = document.getElementById('nav-logout-btn');

    if (!greetingElement) return;

    const hour = new Date().getHours();
    let message, bgColor;

    if (hour >= 5 && hour < 12) {
        message = "Chào buổi sáng ✨";
        bgColor = "linear-gradient(135deg, #e0f2f1 0%, #80cbc4 100%)";
    } else if (hour >= 12 && hour < 18) {
        message = "Chào buổi chiều 💪";
        bgColor = "linear-gradient(135deg, #fff9c4 0%, #ffeb3b 100%)";
    } else {
        message = "Chào buổi tối 🌙";
        bgColor = "linear-gradient(135deg, #cfd8dc 0%, #b0bec5 100%)";
    }

    const savedName = localStorage.getItem('db_fullname');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    if (isLoggedIn && savedName) {
        greetingElement.innerHTML = `${message}, <span style="color:#43a047">${savedName}</span>! 🌿`;
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'block';
    } else {
        greetingElement.innerText = `${message}!`;
        if (loginBtn) loginBtn.style.display = 'block';
        if (registerBtn) registerBtn.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'none';
    }

    if (heroSection) heroSection.style.background = bgColor;
}

// ==========================================================================
// 3. XỬ LÝ HỆ THỐNG THÀNH VIÊN LOCALSTORAGE (AUTH giả lập)
// ==========================================================================
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.onsubmit = function(e) {
        e.preventDefault();
        const fullName = document.getElementById('regFullName').value.trim();
        const user = document.getElementById('regUser').value.trim();
        const pass = document.getElementById('regPass').value;
        const passConfirm = document.getElementById('regPassConfirm').value;

        if (pass !== passConfirm) {
            alert("❌ Mật khẩu nhập lại không khớp!");
            return;
        }

        localStorage.setItem('db_fullname', fullName);
        localStorage.setItem('db_user', user);
        localStorage.setItem('db_pass', pass);

        alert("✨ Đăng ký thành công! Hãy đăng nhập bằng tài khoản này.");
        toggleModal('modal-register');
        this.reset();
    };
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.onsubmit = function(e) {
        e.preventDefault();
        const inputUser = document.getElementById('loginUser').value.trim();
        const inputPass = document.getElementById('loginPass').value;

        const savedUser = localStorage.getItem('db_user');
        const savedPass = localStorage.getItem('db_pass');

        if (inputUser === savedUser && inputPass === savedPass && savedUser !== null) {
            alert("🔓 Đăng nhập thành công!");
            localStorage.setItem('isLoggedIn', 'true');
            toggleModal('modal-login');
            updateGreeting(); 
        } else {
            alert("❌ Sai tài khoản hoặc mật khẩu rồi!");
        }
    };
}

function handleLogout() {
    if (confirm("Bạn muốn đăng xuất thật hả? 🥺")) {
        localStorage.removeItem('isLoggedIn');
        alert("👋 Đã đăng xuất thành công!");
        window.location.reload();
    }
}

function togglePasswordVisibility(inputId, iconElement) {
    const passwordInput = document.getElementById(inputId);
    if (!passwordInput) return;

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        iconElement.classList.remove("fa-eye");
        iconElement.classList.add("fa-eye-slash");
    } else {
        passwordInput.type = "password";
        iconElement.classList.remove("fa-eye-slash");
        iconElement.classList.add("fa-eye");
    }
}

// ==========================================================================
// 4. QUẢN LÝ NHẬT KÝ DINH DƯỠNG (LOCALSTORAGE)
// ==========================================================================
const addFoodForm = document.getElementById('addFoodForm');
if (addFoodForm) {
    addFoodForm.onsubmit = function(e) {
        e.preventDefault();

        const foodName = document.getElementById('foodName').value.trim();
        const calo = parseInt(document.getElementById('foodCalo').value) || 0;
        const method = document.getElementById("foodMethod").value;
        
        if (foodName === "") {
            alert("Bạn ơi, nhập tên món ăn đã nhé! ✨");
            return;
        }

        const now = new Date();
        const time = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        const dateKey = now.toLocaleDateString('en-CA'); 

        const newEntry = {
            id: Date.now(),
            time: time,
            name: foodName,
            calo: calo,
            method: method
        };

        try {
            let dailyData = JSON.parse(localStorage.getItem(`logs_${dateKey}`)) || [];
            dailyData.push(newEntry);
            localStorage.setItem(`logs_${dateKey}`, JSON.stringify(dailyData));

            renderDailyTable(dateKey);
            toggleModal('modal-add');
            this.reset();
            
            // Vẽ lại biểu đồ nếu đang mở tab Dashboard
            drawChart();
        } catch (error) {
            console.error("Lỗi lưu dữ liệu:", error);
        }
    };
}

function renderDailyTable(date) {
    const tableBody = document.getElementById('daily-menu-body');
    const totalDisplay = document.getElementById('total-calo-value');
    if (!tableBody) return;

    const data = JSON.parse(localStorage.getItem(`logs_${date}`)) || [];
    let html = "";
    let totalCalo = 0;

    data.forEach((item, index) => {
        totalCalo += item.calo;
        html += `
            <tr>
                <td>${item.time}</td>
                <td><strong>${item.name}</strong></td>
                <td>${item.method || "-"}</td>
                <td class="item-calo">${item.calo}</td>
                <td>
                    <button class="btn-delete" style="background:none; border:none; color:#e53935; cursor:pointer;" onclick="deleteLog('${date}', ${index})">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    tableBody.innerHTML = html;
    if (totalDisplay) totalDisplay.innerText = totalCalo;
    updateCalorieUI(totalCalo); 
}

function deleteLog(date, index) {
    let data = JSON.parse(localStorage.getItem(`logs_${date}`)) || [];
    data.splice(index, 1); 
    localStorage.setItem(`logs_${date}`, JSON.stringify(data));
    renderDailyTable(date); 
    drawChart(); // Tự động cập nhật lại cột đồ thị năng lượng khi xóa món
}

function updateCalorieUI(totalCalo) {
    const statusElement = document.getElementById('calorie-status');
    const valueElement = document.getElementById('total-calo-value');
    
    if (valueElement) valueElement.innerText = totalCalo;
    if (!statusElement) return;

    statusElement.classList.remove('status-green', 'status-yellow', 'status-red');

    if (totalCalo >= 4000) {
        statusElement.className = 'calorie-badge status-red';
    } else if (totalCalo >= 2000) {
        statusElement.className = 'calorie-badge status-yellow';
    } else {
        statusElement.className = 'calorie-badge status-green';
    }
}

function loadDailyMenu() {
    const selectedDate = document.getElementById('history-date').value;
    if (selectedDate) {
        renderDailyTable(selectedDate);
    }
}

// ==========================================================================
// 5. HIỂN THỊ MÓN ĂN THAM KHẢO & GỢI Ý THỰC ĐƠN (FRONT-END DUMP)
// ==========================================================================
function showDishes() {
    const data = [
        { 
            TenMonAn: "Phở bò", 
            Calo: 500, 
            PhuongPhap: "Luộc/Nấu nước", 
            MoTa: "Phở bò truyền thống thơm ngon", 
            // Thay bằng link ảnh thật từ internet
            HinhAnh: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600" 
        },
        { 
            TenMonAn: "Cơm tấm", 
            Calo: 650, 
            PhuongPhap: "Nướng", 
            MoTa: "Cơm tấm sườn nướng chất lượng", 
            // Thay bằng link ảnh thật từ internet
            HinhAnh: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=600" 
        },
        { 
            TenMonAn: "Ức gà Luộc", 
            Calo: 250, 
            PhuongPhap: "Luộc", 
            MoTa: "Thực đơn hỗ trợ giảm cân, tăng cơ tốt", 
            // Thay bằng link ảnh thật từ internet
            HinhAnh: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=600" 
        }
    ];

    const grid = document.getElementById('dishGrid');
    if (!grid) return;

    grid.innerHTML = data.map(f => `
        <div class="food-card">
            <img src="${f.HinhAnh}" alt="${f.TenMonAn}">
            <div class="card-content">
                <h3>${f.TenMonAn}</h3>
                <p>🔥 ${f.Calo} kcal</p>
                <p>👨‍🍳 ${f.PhuongPhap}</p>
                <p style="color:#7f8c8d; font-size:0.9rem;">${f.MoTa}</p>
            </div>
        </div>
    `).join('');
}
function loadSuggestedFoods() {
    const container = document.getElementById("suggested-dishes");
    if (!container) return;

    const foods = [
        { name: "🥗 Salad Ức Gà", calo: 250 },
        { name: "🍚 Cơm Gà Luộc", calo: 450 },
        { name: "🐟 Cá Hồi Áp Chảo", calo: 350 },
        { name: "🥣 Yến Mạch Sữa Chua", calo: 200 }
    ];

    container.innerHTML = foods.map(food => `
        <div class="food-card">
            <div class="card-content">
                <h3>${food.name}</h3>
                <p>🔥 ${food.calo} kcal</p>
            </div>
        </div>
    `).join("");
}

function searchFood() {
    const keyword = document.getElementById("searchInput").value.toLowerCase().trim();
    const cards = document.querySelectorAll("#dishGrid .food-card");

    cards.forEach(card => {
        const titleNode = card.querySelector("h3");
        if (!titleNode) return;
        const name = titleNode.innerText.toLowerCase();
        card.style.display = name.includes(keyword) ? "block" : "none";
    });
}

// ==========================================================================
// 6. SỨC KHỎE: CHIẾN LƯỢC TÍNH BMI & BIỂU ĐỒ CHART.JS
// ==========================================================================
function calculateBMI() {
    let height = parseFloat(document.getElementById("height").value);
    const weight = parseFloat(document.getElementById("weight").value);

    if (!height || !weight) {
        alert("Vui lòng điền đủ thông tin chiều cao và cân nặng!");
        return;
    }

    // Cơ chế tự động sửa sai: Nếu nhập cm (ví dụ 170) -> Tự động chuyển về mét (1.70)
    if (height > 3) {
        height = height / 100;
    }

    const bmi = weight / (height * height);
    let status = "";
    let bgColor = "";

    if (bmi < 18.5) {
        status = "Thiếu cân";
        bgColor = "#ffe082";
    } else if (bmi < 25) {
        status = "Bình thường";
        bgColor = "#a5d6a7";
    } else if (bmi < 30) {
        status = "Thừa cân";
        bgColor = "#ffcc80";
    } else {
        status = "Béo phì";
        bgColor = "#ef9a9a";
    }

    const statusElement = document.getElementById("bmi-status");
    if (statusElement) {
        statusElement.style.background = bgColor;
        statusElement.innerHTML = status;
    }

    const numberElement = document.getElementById("bmi-number");
    if (numberElement) {
        numberElement.innerHTML = bmi.toFixed(2);
    }
}

// Khai báo biến global giữ instance biểu đồ để huỷ khi render lại dữ liệu mới
let myCalorieChartInstance = null;

function drawChart() {
    const ctx = document.getElementById("calorieChart");
    if (!ctx) return;

    if (typeof Chart === 'undefined') {
        console.error("Thư viện Chart.js chưa được tải thành công!");
        return;
    }

    const days = [];
    const calories = [];

    // Chạy vòng lặp lấy dữ liệu từ 7 ngày gần nhất ngược về trước
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const key = date.toLocaleDateString("en-CA");
        const logs = JSON.parse(localStorage.getItem(`logs_${key}`)) || [];

        let total = 0;
        logs.forEach(item => {
            total += item.calo;
        });

        days.push(date.toLocaleDateString("vi-VN", { day: 'numeric', month: 'numeric' }));
        calories.push(total);
    }

    // Reset biểu đồ cũ tránh lỗi chồng lấn canvas khi hover chuột
    if (myCalorieChartInstance) {
        myCalorieChartInstance.destroy();
    }

    myCalorieChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: days,
            datasets: [{
                label: 'Tổng năng lượng tiêu thụ (kcal)',
                data: calories,
                backgroundColor: '#4db6ac',
                borderColor: '#00796b',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// ==========================================================================
// 7. QUẢN LÝ ĐÓNG MỞ CÁC KHỐI MODAL & KHỞI ĐỘNG TRANG
// ==========================================================================
function toggleModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = modal.style.display === "block" ? "none" : "block";
}

function switchAuth(type) {
    const loginModal = document.getElementById('modal-login');
    const registerModal = document.getElementById('modal-register');
    if (type === 'register') {
        if (loginModal) loginModal.style.display = 'none';
        if (registerModal) registerModal.style.display = 'block';
    } else if (type === 'login') {
        if (registerModal) registerModal.style.display = 'none';
        if (loginModal) loginModal.style.display = 'block';
    }
}

// Bấm ra ngoài rìa để đóng modal nhanh
window.addEventListener('click', (e) => {
    const modalLogin = document.getElementById('modal-login');
    const modalRegister = document.getElementById('modal-register');
    const modalAdd = document.getElementById('modal-add');
    if (e.target === modalLogin) modalLogin.style.display = 'none';
    if (e.target === modalRegister) modalRegister.style.display = 'none';
    if (e.target === modalAdd) modalAdd.style.display = 'none';
});

// Chạy khởi tạo ứng dụng khi trang tải xong dữ liệu tĩnh
window.addEventListener('load', function() {
    const dateInput = document.getElementById('history-date');
    const todayStr = new Date().toLocaleDateString('en-CA');
    if (dateInput) {
        dateInput.value = todayStr;
    }
    
    updateGreeting();
    showDishes();
    renderDailyTable(todayStr);
    loadSuggestedFoods();
});
