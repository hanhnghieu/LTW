const APP_ID = '6e447c8e'; 
const APP_KEY = 'ecff04668de1e5b3e2e610b54eb0b914s';

// ==========================================
// 1. ĐIỀU HƯỚNG TAB GIAO DIỆN
// ==========================================
function showSection(sectionId) {
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

    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    if (sectionId === 'food-manager') {
        const dateInput = document.getElementById('history-date');
        if (dateInput && dateInput.value) {
            renderDailyTable(dateInput.value);
        }
    }
}

// ==========================================
// 2. CẬP NHẬT LỜI CHÀO VÀ ĐỒNG BỘ THANH MENU
// ==========================================
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

// ==========================================
// 3. XỬ LÝ HỆ THỐNG THÀNH VIÊN (AUTH) VÀ ĐĂNG XUẤT
// ==========================================
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.onsubmit = function(e) {
        e.preventDefault();
        const fullName = document.getElementById('regFullName').value;
        const user = document.getElementById('regUser').value;
        const pass = document.getElementById('regPass').value;
        const passConfirm = document.getElementById('regPassConfirm').value;

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
        const inputUser = document.getElementById('loginUser').value;
        const inputPass = document.getElementById('loginPass').value;

        const savedUser = localStorage.getItem('db_user');
        const savedPass = localStorage.getItem('db_pass');

        if (inputUser === savedUser && inputPass === savedPass) {
            alert("🔓 Đăng nhập thành công!");
            localStorage.setItem('isLoggedIn', 'true');
            toggleModal('modal-login');
            updateGreeting(); 
        } else {
            alert("❌ Sai tài khoản hoặc mật khẩu rồi bé ơi!");
        }
    };
}

function handleLogout() {
    if (confirm("Bé muốn đăng xuất thật hả? 🥺")) {
        localStorage.removeItem('isLoggedIn');
        alert("👋 Đã đăng xuất thành công!");
        window.location.reload();
    }
}

// ==========================================
// 4. HIỂN THỊ DANH SÁCH MÓN ĂN THAM KHẢO (API)
// ==========================================
async function showDishes() {
    try {
        const res = await fetch('/api/foods');
        const data = await res.json();
        const grid = document.getElementById('dishGrid');
        if (!grid) return;

        if (!data || data.length === 0) {
            grid.innerHTML = "<p style='text-align:center; grid-column: 1/-1;'>Sổ tay đang trống. Thêm món ngay đi bé!</p>";
            return;
        }

        grid.innerHTML = data.map(f => {
            const id = f.MaMonAn || f.mamonan;
            return `
                <div class="food-card">
                    <div class="card-content">
                        <h3>${f.TenMonAn || 'Chưa có tên'}</h3>
                        <p><strong>🔥 Năng lượng:</strong> ${f.Calo || 0} kcal</p>
                        <p><strong>👥 Khẩu phần:</strong> ${f.KhauPhan || 1} người</p>
                        <p class="desc">${f.MoTa || ''}</p>
                        <div class="card-actions">
                            <button class="btn-edit" onclick="editFood(${id}, '${f.TenMonAn}', ${f.KhauPhan})">Sửa</button>
                            <button class="btn-delete" onclick="deleteFood(${id})">Xóa</button>
                        </div>
                    </div>
                </div>`;
        }).join('');
    } catch (err) { console.error("Lỗi lấy dữ liệu:", err); }
}

// ==========================================
// 5. QUẢN LÝ NHẬT KÝ DINH DƯỠNG VÀ PHÂN TÍCH HÔM QUA
// ==========================================
const addFoodForm = document.getElementById('addFoodForm');
if (addFoodForm) {
    addFoodForm.onsubmit = function(e) {
        e.preventDefault();

        const foodName = document.getElementById('foodName').value.trim();
        const calo = parseInt(document.getElementById('foodCalo').value) || 0;
        
        const now = new Date();
        const time = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        const dateKey = now.toLocaleDateString('en-CA'); 

        if (foodName === "") {
            alert("Bé ơi, nhập tên món ăn đã nhé! ✨");
            return;
        }

        const newEntry = { 
            id: Date.now(), 
            time: time, 
            name: foodName, 
            calo: calo 
        };

        try {
            let dailyData = JSON.parse(localStorage.getItem(`logs_${dateKey}`)) || [];
            dailyData.push(newEntry);
            localStorage.setItem(`logs_${dateKey}`, JSON.stringify(dailyData));

            renderDailyTable(dateKey);
            toggleModal('modal-add');
            this.reset();
            
            // Cập nhật lại mục phân tích nếu người dùng đang xem trang chủ
            analyzeYesterdayNutrition();
        } catch (error) {
            console.error("Lỗi lưu trữ:", error);
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
    analyzeYesterdayNutrition();
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

// HÀM TỰ ĐỘNG PHÂN TÍCH VÀ HIỂN THỊ THỰC ĐƠN NGÀY HÔM QUA
function analyzeYesterdayNutrition() {
    const suggestionText = document.getElementById('suggestion-text');
    const suggestionGrid = document.getElementById('suggested-dishes');
    if (!suggestionText || !suggestionGrid) return;

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayKey = yesterday.toLocaleDateString('en-CA'); 

    const yesterdayData = JSON.parse(localStorage.getItem(`logs_${yesterdayKey}`)) || [];

    if (yesterdayData.length > 0) {
        const totalCalo = yesterdayData.reduce((sum, item) => sum + item.calo, 0);
        suggestionText.innerHTML = `Hôm qua (${yesterday.toLocaleDateString('vi-VN')}), bạn đã nạp tổng cộng <strong>${totalCalo} kcal</strong>. Dưới đây là thực đơn chi tiết chiết xuất từ hệ thống:`;

        suggestionGrid.innerHTML = yesterdayData.map(item => `
            <div class="food-card" style="background: rgba(255, 255, 255, 0.9); border: 1px dashed #43a047; padding: 12px; min-height: auto; border-radius: 8px;">
                <div class="card-content">
                    <span style="font-size: 0.75rem; background: #e8f5e9; padding: 2px 6px; border-radius: 4px; color: #43a047; font-weight: 600;">${item.time}</span>
                    <h4 style="margin: 6px 0 4px 0; font-size: 0.95rem; color: #2e7d32;">${item.name}</h4>
                    <p style="margin: 0; font-size: 0.9rem; color: #555;">🔥 <strong>${item.calo}</strong> kcal</p>
                </div>
            </div>
        `).join('');
    } else {
        suggestionText.innerText = "Hôm qua bạn không ghi chép dữ liệu dinh dưỡng nào trong hệ thống.";
        suggestionGrid.innerHTML = "";
    }
}

// ==========================================
// 6. SỬA / XÓA MÓN THAM KHẢO TRÊN API
// ==========================================
async function editFood(id, oldName, oldPortion) {
    const newName = prompt("Nhập tên món mới:", oldName);
    const newPortion = prompt("Nhập khẩu phần mới:", oldPortion);
    if (!newName || !newPortion) return;

    try {
        await fetch(`/api/foods/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newName, portion: parseInt(newPortion) })
        });
        showDishes();
    } catch (err) { console.error(err); }
}

async function deleteFood(id) {
    if (confirm("Xóa thật nhé?")) {
        await fetch(`/api/foods/${id}`, { method: 'DELETE' });
        showDishes();
    }
}

// ==========================================
// 7. QUẢN LÝ ĐÓNG MỞ MODAL VÀ HIỂN THỊ MẬT KHẨU
// ==========================================
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

window.onclick = (e) => { 
    const modalLogin = document.getElementById('modal-login');
    const modalRegister = document.getElementById('modal-register');
    const modalAdd = document.getElementById('modal-add');
    if (e.target === modalLogin) modalLogin.style.display = 'none';
    if (e.target === modalRegister) modalRegister.style.display = 'none';
    if (e.target === modalAdd) modalAdd.style.display = 'none';
};

// INITIALIZATION
window.onload = function() {
    const dateInput = document.getElementById('history-date');
    const todayStr = new Date().toLocaleDateString('en-CA');
    if (dateInput) {
        dateInput.value = todayStr;
    }

    updateGreeting();
    showDishes();
    renderDailyTable(todayStr);
    analyzeYesterdayNutrition(); 
};
