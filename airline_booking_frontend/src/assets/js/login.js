import { apiService } from './api-service.js';

document.addEventListener('DOMContentLoaded', function() {
    // เลือก elements ที่เกี่ยวข้อง
    const loginForm = document.getElementById('loginForm');
    const emailField = document.getElementById('email');
    const passwordField = document.getElementById('password');
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');
    const togglePasswordButton = document.querySelector('.toggle-password');
    const loginMessage = document.getElementById('login-message');
    
    // ตรวจสอบว่าผู้ใช้เข้าสู่ระบบแล้วหรือไม่
    checkLoginStatus();
    
    // ตรวจสอบ URL parameters เช่น session_expired
    checkUrlParameters();
    
    // จัดการการเปิด/ปิดการแสดงรหัสผ่าน
    setupPasswordToggle();
    
    // จัดการการส่งฟอร์มเข้าสู่ระบบ
    setupLoginForm();
    
    // เพิ่ม event listener สำหรับการเปลี่ยนข้อมูลใน input field
    setupInputValidation();
    
    /**
     * ตรวจสอบ URL parameters และแสดงข้อความตามความเหมาะสม
     */
    function checkUrlParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        
        // ตรวจสอบ session_expired
        if (urlParams.get('session_expired') === 'true') {
            showMessage('การเข้าสู่ระบบหมดอายุ กรุณาเข้าสู่ระบบใหม่', 'warning');
        }
        
        // ตรวจสอบ logout
        if (urlParams.get('logout') === 'success') {
            showMessage('คุณได้ออกจากระบบเรียบร้อยแล้ว', 'success');
        }
        
        // ตรวจสอบ register
        if (urlParams.get('registered') === 'success') {
            showMessage('สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ', 'success');
        }
    }
    
    /**
     * ตรวจสอบสถานะการเข้าสู่ระบบ
     */
    function checkLoginStatus() {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        
        if (token && userData) {
            try {
                // ผู้ใช้เข้าสู่ระบบแล้ว
                const user = JSON.parse(userData);
                
                // ตรวจสอบ Role และนำทางไปหน้าที่เหมาะสมถ้าจำเป็น
                if (user.role === 'Admin' || user.role === 'Staff') {
                    // ถ้าผู้ใช้เป็น Admin หรือ Staff และไม่ได้อยู่ในหน้า admin แล้ว
                    if (!window.location.pathname.includes('admin.html')) {
                        // อาจจะให้ผู้ใช้เลือกว่าจะไปหน้า admin หรือไม่
                        if (loginForm) {
                            loginForm.innerHTML = `
                                <div class="already-logged-in">
                                    <h2>คุณเข้าสู่ระบบแล้ว</h2>
                                    <p>ยินดีต้อนรับ, ${user.firstName || user.username || user.email}</p>
                                    <p>คุณมีสิทธิ์เข้าถึงหน้าจัดการระบบ</p>
                                    <div class="action-buttons">
                                        <a href="admin.html" class="btn btn-primary">ไปยังหน้าจัดการระบบ</a>
                                        <a href="index.html" class="btn btn-outline">ไปยังหน้าหลัก</a>
                                        <button type="button" class="btn btn-outline logout-btn">ออกจากระบบ</button>
                                    </div>
                                </div>
                            `;
                        }
                    }
                } else {
                    // หรือเปลี่ยนฟอร์มเป็นข้อความแจ้งว่าเข้าสู่ระบบแล้ว (สำหรับ Customer)
                    if (loginForm) {
                        loginForm.innerHTML = `
                            <div class="already-logged-in">
                                <h2>คุณเข้าสู่ระบบแล้ว</h2>
                                <p>ยินดีต้อนรับ, ${user.firstName || user.username || user.email}</p>
                                <div class="action-buttons">
                                    <a href="index.html" class="btn btn-primary">กลับไปยังหน้าหลัก</a>
                                    <button type="button" class="btn btn-outline logout-btn">ออกจากระบบ</button>
                                </div>
                            </div>
                        `;
                    }
                }
                
                // เพิ่ม event listener สำหรับปุ่มออกจากระบบ
                const logoutBtn = document.querySelector('.logout-btn');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', handleLogout);
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
                // ถ้าข้อมูลผู้ใช้ไม่ถูกต้อง ให้ล้างข้อมูลและโหลดหน้าใหม่
                localStorage.removeItem('authToken');
                localStorage.removeItem('userData');
                window.location.reload();
            }
        }
    }
    
    /**
     * ตั้งค่าการเปิด/ปิดการแสดงรหัสผ่าน
     */
    function setupPasswordToggle() {
        if (togglePasswordButton && passwordField) {
            togglePasswordButton.addEventListener('click', function() {
                const showText = this.querySelector('.show-password');
                const hideText = this.querySelector('.hide-password');
                
                if (passwordField.type === 'password') {
                    passwordField.type = 'text';
                    showText.style.display = 'none';
                    hideText.style.display = 'inline';
                } else {
                    passwordField.type = 'password';
                    showText.style.display = 'inline';
                    hideText.style.display = 'none';
                }
            });
        }
    }
    
    /**
     * ตั้งค่าการส่งฟอร์มเข้าสู่ระบบ
     */
    function setupLoginForm() {
        if (loginForm) {
            loginForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                // ล้างข้อความแจ้งเตือนเดิม
                if (loginMessage) loginMessage.style.display = 'none';
                
                // ตรวจสอบความถูกต้องของข้อมูล
                if (!validateLoginForm()) {
                    return;
                }
                
                // แสดงสถานะการโหลด
                const submitBtn = this.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.textContent;
                submitBtn.innerHTML = '<span class="loading-spinner"></span> กำลังเข้าสู่ระบบ...';
                submitBtn.disabled = true;
                
                try {
                    // เรียกใช้ API เพื่อเข้าสู่ระบบ
                    const response = await apiService.login(
                        emailField.value,
                        passwordField.value
                    );
                    
                    // บันทึก token และข้อมูลผู้ใช้
                    apiService.setToken(response.token);
                    localStorage.setItem('userData', JSON.stringify(response.user));
                    
                    // ตรวจสอบ Role ของผู้ใช้และนำทางไปหน้าที่เหมาะสม
                    const redirectUrl = (response.user.role === 'Admin' || response.user.role === 'Staff') 
                        ? 'admin.html' 
                        : 'index.html';
                    
                    // แสดงข้อความสำเร็จ
                    showMessage(`เข้าสู่ระบบสำเร็จ! กำลังนำคุณไปยัง${redirectUrl === 'admin.html' ? 'หน้าจัดการระบบ' : 'หน้าหลัก'}...`, 'success');
                    
                    // Redirect ไปยังหน้าที่เหมาะสมหลังจากเข้าสู่ระบบสำเร็จ
                    setTimeout(() => {
                        window.location.href = redirectUrl;
                    }, 1500);
                } catch (error) {
                    console.error('Login error:', error);
                    
                    // แสดงข้อความผิดพลาด
                    showMessage(error.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง', 'danger');
                    
                    if (emailError) {
                        emailError.textContent = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
                        emailError.style.display = 'block';
                    }
                    
                    // คืนค่าสถานะปุ่ม
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                }
            });
        }
    }
    
    /**
     * ตรวจสอบความถูกต้องของข้อมูลในฟอร์ม
     */
    function validateLoginForm() {
        let isValid = true;
        
        // รีเซ็ตข้อความผิดพลาด
        if (emailError) emailError.style.display = 'none';
        if (passwordError) passwordError.style.display = 'none';
        
        // ตรวจสอบอีเมล
        if (!emailField.value.trim()) {
            if (emailError) {
                emailError.textContent = 'กรุณากรอกอีเมล';
                emailError.style.display = 'block';
            }
            isValid = false;
        } else if (!isValidEmail(emailField.value.trim())) {
            if (emailError) {
                emailError.textContent = 'กรุณากรอกอีเมลให้ถูกต้อง';
                emailError.style.display = 'block';
            }
            isValid = false;
        }
        
        // ตรวจสอบรหัสผ่าน
        if (!passwordField.value) {
            if (passwordError) {
                passwordError.textContent = 'กรุณากรอกรหัสผ่าน';
                passwordError.style.display = 'block';
            }
            isValid = false;
        }
        
        return isValid;
    }
    
    /**
     * ตั้งค่า event listeners สำหรับการตรวจสอบข้อมูลในขณะที่ผู้ใช้กรอก
     */
    function setupInputValidation() {
        if (emailField) {
            emailField.addEventListener('input', function() {
                if (emailError) emailError.style.display = 'none';
            });
        }
        
        if (passwordField) {
            passwordField.addEventListener('input', function() {
                if (passwordError) passwordError.style.display = 'none';
            });
        }
    }
    
    /**
     * จัดการการออกจากระบบ
     */
    function handleLogout() {
        // ล้างข้อมูลการเข้าสู่ระบบ
        apiService.clearToken();
        localStorage.removeItem('userData');
        
        // โหลดหน้าใหม่พร้อมพารามิเตอร์ logout=success
        window.location.href = 'login.html?logout=success';
    }
    
    /**
     * แสดงข้อความแจ้งเตือน
     * @param {string} message - ข้อความที่ต้องการแสดง
     * @param {string} type - ประเภทของข้อความ (success, danger, warning, info)
     */
    function showMessage(message, type = 'info') {
        if (loginMessage) {
            loginMessage.textContent = message;
            loginMessage.className = `alert alert-${type}`;
            loginMessage.style.display = 'block';
            
            // เลื่อนไปยังข้อความ
            loginMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            // ถ้าไม่มี element สำหรับแสดงข้อความ ให้สร้างใหม่
            showSuccessMessage(message, type);
        }
    }
    
    /**
     * แสดงข้อความสำเร็จ (สำหรับการใช้งานถ้าไม่มี loginMessage element)
     * @param {string} message - ข้อความที่ต้องการแสดง
     * @param {string} type - ประเภทของข้อความ (success, danger, warning, info)
     */
    function showSuccessMessage(message, type = 'success') {
        // ลบข้อความเดิม
        const existingMessage = document.querySelector('.message-alert');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // สร้างข้อความใหม่
        const messageElement = document.createElement('div');
        messageElement.className = `message-alert message-${type}`;
        
        // เลือกไอคอนตามประเภทข้อความ
        let icon = 'fa-info-circle';
        if (type === 'success') icon = 'fa-check-circle';
        if (type === 'danger') icon = 'fa-exclamation-circle';
        if (type === 'warning') icon = 'fa-exclamation-triangle';
        
        messageElement.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
        
        // เพิ่มสไตล์
        const backgroundColor = {
            success: '#d4edda',
            danger: '#f8d7da',
            warning: '#fff3cd',
            info: '#d1ecf1'
        };
        
        const textColor = {
            success: '#155724',
            danger: '#721c24',
            warning: '#856404',
            info: '#0c5460'
        };
        
        messageElement.style.backgroundColor = backgroundColor[type] || backgroundColor.info;
        messageElement.style.color = textColor[type] || textColor.info;
        messageElement.style.padding = '1rem';
        messageElement.style.borderRadius = '4px';
        messageElement.style.marginBottom = '1rem';
        messageElement.style.textAlign = 'center';
        
        // เพิ่มลงในฟอร์ม
        if (loginForm) {
            loginForm.prepend(messageElement);
        }
    }
    
    /**
     * ตรวจสอบรูปแบบอีเมล
     */
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // เพิ่ม CSS สำหรับ UI components
    addStyles();
    
    /**
     * เพิ่ม CSS สำหรับ UI components
     */
    function addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .loading-spinner {
                display: inline-block;
                width: 18px;
                height: 18px;
                border: 2px solid rgba(255,255,255,0.3);
                border-radius: 50%;
                border-top-color: white;
                animation: spinner-rotate 0.8s linear infinite;
                vertical-align: text-bottom;
                margin-right: 8px;
            }
            
            @keyframes spinner-rotate {
                to { transform: rotate(360deg); }
            }
            
            .already-logged-in {
                text-align: center;
                padding: 2rem;
            }
            
            .already-logged-in h2 {
                margin-bottom: 1rem;
                color: var(--primary-color);
            }
            
            .already-logged-in p {
                margin-bottom: 1rem;
            }
            
            .action-buttons {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                gap: 10px;
                margin-top: 1.5rem;
            }
            
            .alert {
                padding: 12px 15px;
                margin-bottom: 20px;
                border-radius: 4px;
                font-size: 14px;
            }
            
            .alert-success {
                background-color: #d4edda;
                color: #155724;
                border: 1px solid #c3e6cb;
            }
            
            .alert-danger {
                background-color: #f8d7da;
                color: #721c24;
                border: 1px solid #f5c6cb;
            }
            
            .alert-warning {
                background-color: #fff3cd;
                color: #856404;
                border: 1px solid #ffeeba;
            }
            
            .alert-info {
                background-color: #d1ecf1;
                color: #0c5460;
                border: 1px solid #bee5eb;
            }
            
            @media (max-width: 768px) {
                .action-buttons {
                    flex-direction: column;
                }
                
                .action-buttons .btn {
                    width: 100%;
                    margin-bottom: 8px;
                }
            }
        `;
        document.head.appendChild(style);
    }
});