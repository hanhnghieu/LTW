const APP_ID = '6e447c8e'; 
const APP_KEY = 'ecff04668de1e5b3e2e610b54eb0b914s';

// ==========================================================================
// 1. ĐIỀU HƯỚNG TAB GIAO DIỆN
// ==========================================================================
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

// ==========================================================================
// 2. CẬP NHẬT GIAO DIỆN & TRẠNG THÁI ĐĂNG NHẬP THEO TÀI KHOẢN
// ==========================================================================
function updateGreeting() {
    const greetingElement = document.getElementById('greeting');
    const heroSection = document.getElementById('hero-bg');
    
    const loginBtn = document.getElementById('nav-login-btn');
    const registerBtn = document.getElementById('nav-register-btn');
    const logoutBtn = document.getElementById('nav-logout-btn');
    
    // Khối gợi ý thực đơn thông minh
    const smartSuggestion = document.getElementById('smart-suggestion');

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
        
        // Đã đăng nhập: Ẩn Đăng nhập/Đăng ký, Hiện Đăng xuất
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'block';

        // ĐỒNG BỘ: Hiện khối gợi ý thực đơn & chạy phân tích dữ liệu hôm qua
        if (smartSuggestion) smartSuggestion.style.display = 'block';
        loadSuggestedFoods();
    } else {
        greetingElement.innerText = `${message}!`;
        
        // Chưa đăng nhập: Hiện Đăng nhập/Đăng ký, Ẩn Đăng xuất
        if (loginBtn) loginBtn.style.display = 'block';
        if (registerBtn) registerBtn.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'none';

        // ĐỒNG BỘ: Ẩn hoàn toàn khối gợi ý thực đơn khi chưa đăng nhập
        if (smartSuggestion) smartSuggestion.style.display = 'none';
    }

    if (heroSection) heroSection.style.background = bgColor;
}

// ==========================================================================
// 3. XỬ LÝ HỆ THỐNG THÀNH VIÊN (AUTH)
// ==========================================================================
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
            
            // Cập nhật lại toàn bộ giao diện sau khi đăng nhập thành công
            updateGreeting(); 
            loadUserBMI(); 
        } else {
            alert("❌ Sai tài khoản hoặc mật khẩu rồi bé ơi!");
        }
    };
}

function handleLogout() {
    if (confirm("Bạn muốn đăng xuất thật hả? 🥺")) {
        localStorage.removeItem('isLoggedIn');
        alert("👋 Đã đăng xuất thành công!");
        window.location.reload(); // Tải lại trang để reset toàn bộ giao diện và BMI về trống
    }
}

// ==========================================================================
// 4. QUẢN LÝ CHỈ SỐ BMI (LƯU THEO TÀI KHOẢN ĐỘNG)
// ==========================================================================
function calculateBMI(){
    const height = parseFloat(document.getElementById("height").value);
    const weight = parseFloat(document.getElementById("weight").value);

    if(!height || !weight){
        alert("Nhập đầy đủ dữ liệu chiều cao và cân nặng để tính nhé!");
        return;
    }

    const bmi = weight / (height * height);
    let status = "";
    let bgColor = "";

    if(bmi < 18.5){
        status = "Thiếu cân";
        bgColor = "#ffe082";
    } else if(bmi < 25){
        status = "Bình thường";
        bgColor = "#a5d6a7";
    } else if(bmi < 30){
        status = "Thừa cân";
        bgColor = "#ffcc80";
    } else {
        status = "Béo phì";
        bgColor = "#ef9a9a";
    }

    // Hiển thị kết quả lên giao diện
    const statusElement = document.getElementById("bmi-status");
    if(statusElement) statusElement.style.background = bgColor;
    
    document.getElementById("bmi-number").innerHTML = bmi.toFixed(2);
    document.getElementById("bmi-status").innerHTML = status;

    // TIẾN HÀNH LƯU TRỮ TRỰC TIẾP VÀO TÀI KHOẢN ĐANG ĐĂNG NHẬP
    const currentUsername = localStorage.getItem('db_user');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    if (isLoggedIn && currentUsername) {
        const bmiData = {
            height: height,
            weight: weight,
            score: bmi.toFixed(2),
            status: status,
            bg: bgColor
        };
        localStorage.setItem(`bmi_data_${currentUsername}`, JSON.stringify(bmiData));
        alert("💾 Đã lưu số đo chỉ số BMI của riêng tài khoản bạn!");
    } else {
        alert("💡 Mẹo: Bạn nên đăng nhập để hệ thống tự lưu chỉ số BMI này vĩnh viễn nhé!");
    }
}

function loadUserBMI() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const currentUsername = localStorage.getItem('db_user');
    
    const heightInput = document.getElementById("height");
    const weightInput = document.getElementById("weight");
    const numberElement = document.getElementById("bmi-number");
    const statusElement = document.getElementById("bmi-status");

    if (!numberElement || !statusElement) return;

    // Nếu đã đăng nhập và tìm thấy dữ liệu BMI cũ của tài khoản này
    if (isLoggedIn && currentUsername) {
        const savedBMIData = JSON.parse(localStorage.getItem(`bmi_data_${currentUsername}`));
        
        if (savedBMIData) {
            if (heightInput) heightInput.value = savedBMIData.height;
            if (weightInput) weightInput.value = savedBMIData.weight;
            numberElement.innerHTML = savedBMIData.score;
            statusElement.innerHTML = savedBMIData.status;
            statusElement.style.background = savedBMIData.bg;
            return;
        }
    }

    // Trạng thái mặc định khi chưa có dữ liệu hoặc đã đăng xuất
    if (heightInput) heightInput.value = "";
    if (weightInput) weightInput.value = "";
    numberElement.innerHTML = "--";
    statusElement.innerHTML = "Chưa có dữ liệu";
    statusElement.style.background = "#f1f8e9";
}

// ==========================================================================
// 5. QUẢN LÝ NHẬT KÝ DINH DƯỠNG (LOCALSTORAGE)
// ==========================================================================
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
            alert("Bạn ơi, nhập tên món ăn đã nhé! ✨");
            return;
        }

        const method = document.getElementById("foodMethod").value;

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
            
            // Đăng nhập rồi ăn uống thì tính toán lại gợi ý ngay lập tức
            if(localStorage.getItem('isLoggedIn') === 'true') {
                loadSuggestedFoods();
            }
            
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
    
    if(localStorage.getItem('isLoggedIn') === 'true') {
        loadSuggestedFoods();
    }
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
// 6. PHÂN TÍCH DINH DƯỠNG HÔM QUA ĐỂ ĐƯA RA GỢI Ý THỰC ĐƠN HÔM NAY
// ==========================================================================
function loadSuggestedFoods() {
    const container = document.getElementById("suggested-dishes");
    const textTarget = document.getElementById("analysis-text");
    
    if (!container) return;

    // 1. Tính toán ngày hôm qua theo dạng YYYY-MM-DD
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayKey = yesterday.toLocaleDateString('en-CA');

    // 2. Lấy dữ liệu ăn uống hôm qua từ bộ nhớ máy
    const yesterdayLogs = JSON.parse(localStorage.getItem(`logs_${yesterdayKey}`)) || [];
    let yesterdayTotalCalo = 0;
    yesterdayLogs.forEach(item => {
        yesterdayTotalCalo += item.calo;
    });

    // 3. Chạy thuật toán điều kiện để đưa ra thông điệp và mảng món ăn tương thích
    let suggestedFoods = [];
    let analysisMessage = "";

    if (yesterdayTotalCalo === 0) {
        analysisMessage = "Do ngày hôm qua bạn chưa ghi nhật ký món ăn, Minty Diet gợi ý thực đơn cân bằng tiêu chuẩn cho ngày mới nhé! ✨";
        suggestedFoods = [
            { name: "🥗 Salad Ức Gà Mè Rang", calo: 250 },
            { name: "🍚 Cơm Gà Luộc Tiêu Chanh", calo: 450 },
            { name: "🐟 Cá Hồi Áp Chảo Măng Tây", calo: 350 },
            { name: "🥣 Yến Mạch Sữa Chua Trái Cây", calo: 200 }
        ];
    } else if (yesterdayTotalCalo > 2500) {
        analysisMessage = `Hôm qua bạn đã nạp lượng calo khá cao (${yesterdayTotalCalo} kcal). Hôm nay chúng ta nên chọn thực đơn thanh đạm, ít calo để cơ thể nhẹ nhàng hơn nhé! 🌿`;
        suggestedFoods = [
            { name: "🥗 Salad Thập Cẩm Ức Gà", calo: 220 },
            { name: "🥣 Yến Mạch Ngâm Sữa Tươi Không Đường", calo: 180 },
            { name: "🥦 Canh Bông Cải Xanh Nấu Thịt Bằm", calo: 150 },
            { name: "🍎 Một quả Táo Tây & Trà Xanh", calo: 80 }
        ];
    } else {
        analysisMessage = `Tuyệt vời! Hôm qua bạn duy trì năng lượng rất tốt (${yesterdayTotalCalo} kcal). Hôm nay hãy tiếp tục bổ sung các món ăn giàu dinh dưỡng và protein tốt sau: 💪`;
        suggestedFoods = [
            { name: "🥩 Bò Né Bông Thiên Lý Khoai Tây", calo: 520 },
            { name: "🐟 Cá Hồi Áp Chảo Sốt Bơ Chanh", calo: 380 },
            { name: "🍚 Cơm Gạo Lứt Lườn Gà Áp Chảo", calo: 420 },
            { name: "🥚 2 Quả Trứng Gà Luộc & Chuối Tiêu", calo: 190 }
        ];
    }

    // 4. Đổ nội dung phân tích chữ ra giao diện
    if (textTarget) {
        textTarget.innerText = analysisMessage;
    }

    // 5. In các khối Card món ăn gợi ý ra màn hình
    container.innerHTML = suggestedFoods.map(food => `
        <div class="food-card">
            <div class="card-content">
                <h3>${food.name}</h3>
                <p>🔥 ${food.calo} kcal</p>
            </div>
        </div>
    `).join("");
}

// ==========================================================================
// 7. DANH SÁCH MÓN ĂN THAM KHẢO
// ==========================================================================
async function showDishes() {
    const data = [
        { TenMonAn:"Phở bò", Calo:500, PhuongPhap:"Luộc", MoTa:"Phở bò truyền thống", HinhAnh:"images/pho.jpg" },
        { TenMonAn:"Cơm tấm", Calo:650, PhuongPhap:"Nướng", MoTa:"Cơm tấm sườn", HinhAnh:"images/comtam.jpg" },
        { TenMonAn:"Salad ức gà", Calo:250, PhuongPhap:"Luộc", MoTa:"Thực đơn giảm cân", HinhAnh:"images/salad.jpg" }
    ];

    const grid = document.getElementById('dishGrid');
    if (!grid) return;

    grid.innerHTML = data.map(f => `
        <div class="food-card">
            <img src="/${f.HinhAnh}" alt="/${f.TenMonAn}">
            <div class="card-content">
                <h3>${f.TenMonAn}</h3>
                <p>🔥 ${f.Calo} kcal</p>
                <p>👨‍🍳 ${f.PhuongPhap}</p>
                <p>${f.MoTa}</p>
            </div>
        </div>
    `).join('');
}

// ==========================================================================
// 8. ĐÓNG MỞ MODAL VÀ TÌM KIẾM
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

function searchFood(){
    const keyword = document.getElementById("searchInput").value.toLowerCase();
    const cards = document.querySelectorAll(".food-card");

    cards.forEach(card=>{
        const name = card.querySelector("h3").innerText.toLowerCase();
        if(name.includes(keyword)){
            card.style.display="block";
        } else {
            card.style.display="none";
        }
    });
}

// ==========================================================================
// 9. KHỞI CHẠY ĐỒNG BỘ KHI TẢI TRANG
// ==========================================================================
window.onload = function() {
    const dateInput = document.getElementById('history-date');
    const todayStr = new Date().toLocaleDateString('en-CA');
    if (dateInput) {
        dateInput.value = todayStr;
    }
    
    updateGreeting();   // Hàm này sẽ tự động ẩn/hiện và chạy loadSuggestedFoods() nếu có acc
    loadUserBMI();       // Tự động kiểm tra và tải chỉ số BMI của nick đang lưu (nếu có)
    showDishes();
    renderDailyTable(todayStr);
    drawChart();
};
