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
            loadSuggestedFoods();
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
            
            // Vẽ lại biểu đồ nếu đang mở hoặc cần cập nhật dữ liệu ngầm
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
            HinhAnh: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600" 
        },
        { 
            TenMonAn: "Cơm tấm", 
            Calo: 650, 
            PhuongPhap: "Nướng", 
            MoTa: "Cơm tấm sườn nướng chất lượng", 
            HinhAnh: "https://cdn.hstatic.net/files/200000626331/article/com-tam_9251d47b5b78450a9e09cbe8136fb181_1024x1024.png" 
        },
        { 
            TenMonAn: "Ức gà luộc", 
            Calo: 250, 
            PhuongPhap: "Luộc", 
            MoTa: "Thực đơn hỗ trợ giảm cân, tăng cơ tốt", 
            HinhAnh: "https://cdnv2.tgdd.vn/mwg-static/common/Common/Hinh%20thumb%20t01%201200676%20%2811%29.jpg" 
        },
        { 
            TenMonAn: "Cá hồi áp chảo", 
            Calo: 300, 
            PhuongPhap: "Áp chảo", 
            MoTa: "Giàu omega-3 và protein, tốt cho tim mạch và não bộ",
            HinhAnh: "https://storage.googleapis.com/onelife-public/blog.onelife.vn/2026/03/ac4ce79c-ca-hoi-ap-chao-3.jpg" 
        },
        { 
            TenMonAn: "Bông cải xanh hấp", 
            Calo: 50, 
            PhuongPhap: "Hấp", 
            MoTa: "Giữ trọn vẹn vitamin, khoáng chất và chất xơ, hỗ trợ tiêu hóa",
            HinhAnh: "https://img-global.cpcdn.com/recipes/6836c0e252fc1586/680x781cq80/bong-c%E1%BA%A3i-xanh-h%E1%BA%A5p-ch%E1%BA%A5m-s%E1%BB%91t-cay-recipe-main-photo.jpg" 
        },
        { 
            TenMonAn: "Bò xào bông thiên lý", 
            Calo: 220, 
            PhuongPhap: "Xào", 
            MoTa: "Cung cấp sắt và protein, giúp an thần và bổ máu",
            HinhAnh: "https://i-giadinh.vnecdn.net/2022/07/02/Thanh-pham-1-1-2768-1656750998.jpg" 
        },
        { 
            TenMonAn: "Thịt ba chỉ kho tiêu", 
            Calo: 350, 
            PhuongPhap: "Kho", 
            MoTa: "Món ăn truyền thống đậm vị, giàu năng lượng và chất béo",
            HinhAnh: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSs50Irk1GJRCcQXDJaWqN68-Rj8ehSia4FKw&s" 
        },
        { 
            TenMonAn: "Khoai lang nướng", 
            Calo: 150, 
            PhuongPhap: "Nướng", 
            MoTa: "Nguồn tinh bột hấp thu chậm, giàu chất xơ, hỗ trợ kiểm soát đường huyết",
            HinhAnh: "https://file.hstatic.net/200000610729/article/khoai-lang-nuong_2ca1f44f98d54367a43cd3d02ba6015e_1024x1024.jpg" 
        },
        { 
           TenMonAn: "Nấm đùi gà xào húng quế", 
            Calo: 95, 
            PhuongPhap: "Xào", 
            MoTa: "Món chay thanh đạm, giàu chất xơ và các hợp chất kháng viêm tự nhiên",
            HinhAnh: "https://img-global.cpcdn.com/recipes/1b3fea9aad393733/1200x630cq80/photo.jpg" 
        },
        { 
            TenMonAn: "Cá chẽm hấp Hong Kong", 
            Calo: 190, 
            PhuongPhap: "Hấp", 
            MoTa: "Thịt cá trắng giàu đạm, dễ tiêu hóa, phù hợp cho cả gia đình phục hồi sức khỏe",
            HinhAnh: "https://cdn.tgdd.vn/Files/2021/11/02/1395156/huong-dan-lam-ca-chem-hap-hong-kong-ngon-nhu-nha-hang-202111020105243466.jpg" 
        },
         { 
           TenMonAn: "Filet heo nướng mật ong", 
            Calo: 240, 
            PhuongPhap: "Nướng", 
            MoTa: "Phần thịt heo ít mỡ, kết hợp mật ong tạo vị ngọt tự nhiên, giàu năng lượng",
            HinhAnh: "https://cdn.tgdd.vn/Files/2017/03/23/964110/cach-lam-thit-nuong-mat-ong-thom-ngon-4_760x450.jpg" 
        },
         { 
           TenMonAn: "Bí ngòi xào tôm tươi", 
            Calo: 140, 
            PhuongPhap: "Xào", 
            MoTa: "Món ăn thanh nhẹ, giàu kẽm từ tôm và các chất chống oxy hóa từ bí ngòi",
            HinhAnh: "https://i.ytimg.com/vi/WcxHUIeuJ6k/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLCCc7DMS2122Q04w9WVZDfEtkR7Sg" 
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
    const textTarget = document.getElementById("analysis-text");
    const smartSuggestionBlock = document.getElementById("smart-suggestion"); // Khối bọc lớn của gợi ý
    
    if (!container) return;

    // 1. KIỂM TRA TRẠNG THÁI ĐĂNG NHẬP QUA LOCALSTORAGE
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    if (!isLoggedIn) {
        // Nếu CHƯA đăng nhập, ẩn toàn bộ khối gợi ý thông minh và dừng xử lý luôn
        if (smartSuggestionBlock) {
            smartSuggestionBlock.style.display = 'none';
        }
        return; 
    }

    // 2. NẾU ĐÃ ĐĂNG NHẬP, CHO HIỆN KHỐI GỢI Ý VÀ TIẾN HÀNH PHÂN TÍCH DỮ LIỆU
    if (smartSuggestionBlock) {
        smartSuggestionBlock.style.display = 'block'; 
    }

    // Lấy ngày hôm qua định dạng YYYY-MM-DD
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayKey = yesterday.toLocaleDateString('en-CA');

    // Tính tổng Calo đã ăn ngày hôm qua từ LocalStorage
    const yesterdayLogs = JSON.parse(localStorage.getItem(`logs_${yesterdayKey}`)) || [];
    let yesterdayTotalCalo = 0;
    yesterdayLogs.forEach(item => {
        yesterdayTotalCalo += (parseInt(item.calo) || 0);
    });

    let suggestedFoods = [];
    let analysisMessage = "";

    if (yesterdayTotalCalo === 0) {
        analysisMessage = "Do hôm qua bạn chưa lưu nhật ký, Minty Diet gợi ý thực đơn cân bằng, lành mạnh cho ngày mới nhé! ✨";
        suggestedFoods = [
            { name: "🥗 Salad Ức Gà Mè Rang", calo: 250 },
            { name: "🍚 Cơm Gà Luộc Tiêu Chanh", calo: 450 },
            { name: "🐟 Cá Hồi Áp Chảo Măng Tây", calo: 350 },
            { name: "🥣 Yến Mạch Sữa Chua Trái Cây", calo: 200 }
        ];
    } else if (yesterdayTotalCalo > 2500) {
        analysisMessage = `Hôm qua bạn đã nạp khá nhiều năng lượng (${yesterdayTotalCalo} kcal). Hôm nay chúng ta nên chọn các món thanh đạm, ít calo để cân bằng lại cơ thể nhé! 🌿`;
        suggestedFoods = [
            { name: "🥗 Salad Rau Củ Trộn Ức Gà", calo: 220 },
            { name: "🥣 Yến Mạch Ngâm Sữa Tươi Không Đường", calo: 180 },
            { name: "🥦 Canh Bông Cải Xanh Nấu Thịt Bằm", calo: 150 },
            { name: "🍎 Một quả Táo Tây & Trà Xanh", calo: 80 }
        ];
    } else {
        analysisMessage = `Phân tích thấy hôm qua bạn duy trì năng lượng rất tốt (${yesterdayTotalCalo} kcal). Hôm nay hãy tiếp tục bổ sung các món giàu protein và chất béo tốt này nhé! 💪`;
        suggestedFoods = [
            { name: "🥩 Bò Né Bông Thiên Lý & Khoai Tây", calo: 520 },
            { name: "🐟 Cá Hồi Áp Chảo Sốt Bơ Chanh", calo: 380 },
            { name: "🍚 Cơm Gạo Lứt Lườn Gà Áp Chảo", calo: 420 },
            { name: "🥚 2 Quả Trứng Gà Luộc & Chuối Tiêu", calo: 190 }
        ];
    }

    // Hiển thị thông điệp phân tích
    if (textTarget) {
        textTarget.innerText = analysisMessage;
    }

    // Đổ danh sách card món ăn đề xuất ra màn hình
    container.innerHTML = suggestedFoods.map(food => `
        <div class="food-card">
            <div class="card-content">
                <h3>${food.name}</h3>
                <p style="color: #e67e22; font-weight: bold;">🔥 ${food.calo} kcal</p>
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

    // Cơ chế tự động sửa sai: Nếu nhập cm -> Tự động chuyển về mét
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
    if (!ctx) return; // Nếu phần tử canvas không tồn tại ở tab hiện tại, tránh lỗi

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
            total += (parseInt(item.calo) || 0);
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
    if (modal) modal.style.background = "rgba(0,0,0,0.5)"; // Đảm bảo có backdrop mờ nếu chưa chỉnh css
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
    drawChart(); // Khởi tạo đồ thị ngầm trước
});
