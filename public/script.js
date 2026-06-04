// ==========================================================================
// THÔNG TIN CẤU HÌNH CỐ ĐỊNH (CONFIG)
// ==========================================================================
const APP_ID = '6e447c8e'; 
const APP_KEY = 'ecff04668de1e5b3e2e610b54eb0b914s';

// ==========================================================================
// MODULE 1: ĐIỀU HƯỚNG & QUẢN LÝ GIAO DIỆN (UI NAV)
// ==========================================================================

/**
 * Điều hướng giữa các Tab giao diện chính
 * @param {string} sectionId - ID của section cần hiển thị
 * @param {Event} [e] - Sự kiện click chuột truyền vào để xử lý active link an toàn
 */
function showSection(sectionId, e) {
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
    navLinks.forEach(link => link.classList.remove('active'));

    // Fix lỗi dùng biến event toàn cục cũ bằng cách nhận e tường minh hoặc fallback an toàn
    const currentEvent = e || window.event;
    if (currentEvent && currentEvent.currentTarget) {
        currentEvent.currentTarget.classList.add('active');
    } else if (currentEvent && currentEvent.target) {
        currentEvent.target.classList.add('active');
    }

    // Nếu chuyển sang tab quản lý món ăn thì tự động nạp lại bảng dữ liệu ngày hiện tại
    if (sectionId === 'food-manager') {
        const dateInput = document.getElementById('history-date');
        if (dateInput && dateInput.value) {
            renderDailyTable(dateInput.value);
        }
    }
}

/**
 * Cập nhật lời chào linh hoạt theo mốc thời gian thực trong ngày
 */
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

/**
 * Bật/tắt trạng thái ẩn hiển của một khối Modal bất kỳ
 */
function toggleModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = modal.style.display === "block" ? "none" : "block";
    }
}

// ==========================================================================
// MODULE 2: HỆ THỐNG THÀNH VIÊN VÀ BẢO MẬT (AUTH SYSTEM)
// ==========================================================================

const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.onsubmit = function(e) {
        e.preventDefault();
        const fullName = document.getElementById('regFullName').value.trim();
        const user = document.getElementById('regUser').value.trim();
        const pass = document.getElementById('regPass').value;
        const passConfirm = document.getElementById('regPassConfirm').value;

        if (!fullName || !user || !pass) {
            alert("❌ Vui lòng nhập đầy đủ các trường thông tin đăng ký!");
            return;
        }

        if (pass !== passConfirm) {
            alert("❌ Mật khẩu nhập lại không khớp!");
            return;
        }

        localStorage.setItem('db_fullname', fullName);
        localStorage.setItem('db_user', user);
        localStorage.setItem('db_pass', pass);

        alert("✨ Đăng ký thành công! Hãy dùng mật khẩu vừa tạo để đăng nhập.");
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
            alert("❌ Sai tài khoản hoặc mật khẩu rồi bạn ơi!");
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
// MODULE 3: NHẬT KÝ DINH DƯỠNG & QUẢN LÝ CALORIES
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
            drawChart(); // Cập nhật lại biểu đồ thống kê ngay khi thêm món mới
        } catch (error) {
            console.error("Lỗi lưu trữ dữ liệu:", error);
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
                    <button class="btn-delete" 
                            style="background:none; border:none; color:#e53935; cursor:pointer;" 
                            onclick="deleteLog('${date}', ${index})">
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
    drawChart(); // Vẽ lại biểu đồ khi bớt calo
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
// MODULE 4: SỨC KHỎE (TÍNH TOÁN BMI & VẼ BIỂU ĐỒ)
// ==========================================================================

function calculateBMI() {
    let height = parseFloat(document.getElementById("height").value);
    const weight = parseFloat(document.getElementById("weight").value);

    if (!height || !weight) {
        alert("Nhập đầy đủ dữ liệu chiều cao và cân nặng!");
        return;
    }

    // Tự động chuẩn hóa: Nếu user nhập chiều cao dạng cm (ví dụ: 170) -> chuyển về mét (1.7)
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

function drawChart() {
    const ctx = document.getElementById("calorieChart");
    if (!ctx) return;
    
    // Kiểm tra xem thư viện Chart.js đã được nhúng vào file HTML chưa
    if (typeof Chart === 'undefined') {
        console.warn("Thư viện Chart.js chưa được tải!");
        return;
    }

    const days = [];
    const calories = [];

    // Chạy vòng lặp lấy dữ liệu từ 7 ngày gần nhất
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

    // Xóa/Reset đối tượng Chart cũ nếu đã tồn tại tránh lỗi đè lấp dữ liệu khi render lại
    if (window.myCalorieChart) {
        window.myCalorieChart.destroy();
    }

    window.myCalorieChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: days,
            datasets: [{
                label: 'Năng lượng tiêu thụ (kcal)',
                data: calories,
                backgroundColor: '#4db6ac',
                borderColor: '#00796b',
                borderWidth: 1,
                borderRadius: 5
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
// MODULE 5: RENDER DANH SÁCH MÓN ĂN & TÌM KIẾM (DATA DUMP)
// ==========================================================================

async function showDishes() {
    // Giả lập mảng data nhận về từ API dữ liệu gốc
    const data = [
        { TenMonAn: "Phở bò", Calo: 500, PhuongPhap: "Luộc/Nấu nước", MoTa: "Phở bò truyền thống thơm ngon", HinhAnh: "images/pho.jpg" },
        { TenMonAn: "Cơm tấm", Calo: 650, PhuongPhap: "Nướng", MoTa: "Cơm tấm sườn nướng chả trứng", HinhAnh: "images/comtam.jpg" },
        { TenMonAn: "Ức gà Luộc", Calo: 250, PhuongPhap: "Luộc", MoTa: "Thực đơn vàng trong làng giảm cân", HinhAnh: "images/ucgaluoc.jpg" }
    ];

    const grid = document.getElementById('dishGrid');
    if (!grid) return;

    grid.innerHTML = data.map(f => `
        <div class="food-card">
            <img src="${f.HinhAnh}" alt="${f.TenMonAn}" onerror="this.src='https://placehold.co/600x400?text=${f.TenMonAn}'">
            <div class="card-content">
                <h3>${f.TenMonAn}</h3>
                <p>🔥 <strong>${f.Calo}</strong> kcal</p>
                <p>👨‍🍳 Phương pháp: ${f.PhuongPhap}</p>
                <p style="color: #7f8c8d; font-size: 0.9rem;">${f.MoTa}</p>
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
                <p>🔥 <strong>${food.calo}</strong> kcal</p>
            </div>
        </div>
    `).join("");
}

function searchFood() {
    const keyword = document.getElementById("searchInput").value.toLowerCase().trim();
    const cards = document.querySelectorAll(".food-card");

    cards.forEach(card => {
        const titleElement = card.querySelector("h3");
        if (!titleElement) return;

        const name = titleElement.innerText.toLowerCase();
        card.style.display = name.includes(keyword) ? "block" : "none";
    });
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

// Click ra ngoài vùng Modal để đóng tự động
window.addEventListener('click', function(e) {
    const modalLogin = document.getElementById('modal-login');
    const modalRegister = document.getElementById('modal-register');
    const modalAdd = document.getElementById('modal-add');
    
    if (e.target === modalLogin) modalLogin.style.display = 'none';
    if (e.target === modalRegister) modalRegister.style.display = 'none';
    if (e.target === modalAdd) modalAdd.style.display = 'none';
});

// ==========================================================================
// KÍCH HOẠT ĐỒNG BỘ KHI KHỞI CHẠY TRANG (APP INIT)
// ==========================================================================
window.addEventListener('load', function() {
    const dateInput = document.getElementById('history-date');
    const todayStr = new Date().toLocaleDateString('en-CA');
    
    if (dateInput) {
        dateInput.value = todayStr;
    }

    updateGreeting();
    showDishes();
    renderDailyTable(todayStr);
    drawChart();
    loadSuggestedFoods();
});