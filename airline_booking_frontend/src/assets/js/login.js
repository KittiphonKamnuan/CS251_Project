import { apiService } from './api-service.js';

document.addEventListener('DOMContentLoaded', function() {
    // เลือก elements ที่เกี่ยวข้อง
    const loginForm = document.getElementById('loginForm');
    const emailField = document.getElementById('email');
    const passwordField = document.getElementById('password');
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');
    const togglePasswordButton = document.querySelector('.toggle-password');
    
    // ตรวจสอบว่าผู้ใช้เข้าสู่ระบบแล้วหรือไม่
    checkLoginStatus();
    
    // จัดการการเปิด/ปิดการแสดงรหัสผ่าน
    setupPasswordToggle();
    
    // จัดการการส่งฟอร์มเข้าสู่ระบบ
    setupLoginForm();
    
    // เพิ่ม event listener สำหรับการเปลี่ยนข้อมูลใน input field
    setupInputValidation();
    
    /**
     * ตรวจสอบสถานะการเข้าสู่ระบบ
     */
    function checkLoginStatus() {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        
        if (token && userData) {
            try {
                // ผู้ใช้เข้าสู่ระบบแล้ว redirect ไปหน้าหลัก
                const user = JSON.parse(userData);
                // เราอาจจะ redirect หรือจัดการอื่นๆ ตรงนี้
                // window.location.href = 'index.html';
                
                // หรือเปลี่ยนฟอร์มเป็นข้อความแจ้งว่าเข้าสู่ระบบแล้ว
                if (loginForm) {
                    loginForm.innerHTML = `
                        <div class="already-logged-in">
                            <h2>คุณเข้าสู่ระบบแล้ว</h2>
                            <p>ยินดีต้อนรับ, ${user.email || user.username}</p>
                            <button type="button" class="btn btn-primary logout-btn">ออกจากระบบ</button>
                            <a href="index.html" class="btn btn-outline">กลับไปยังหน้าหลัก</a>
                        </div>
                    `;
                    
                    // เพิ่ม event listener สำหรับปุ่มออกจากระบบ
                    const logoutBtn = document.querySelector('.logout-btn');
                    if (logoutBtn) {
                        logoutBtn.addEventListener('click', handleLogout);
                    }
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
                    
                    // แสดงข้อความสำเร็จ
                    showSuccessMessage('เข้าสู่ระบบสำเร็จ! กำลังนำคุณไปยังหน้าหลัก...');
                    
                    // Redirect ไปยังหน้าหลักหลังจากเข้าสู่ระบบสำเร็จ
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1500);
                } catch (error) {
                    console.error('Login error:', error);
                    
                    // แสดงข้อความผิดพลาด
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
        
        // โหลดหน้าใหม่
        window.location.reload();
    }
    
    /**
     * แสดงข้อความสำเร็จ
     */
    function showSuccessMessage(message) {
        // ลบข้อความสำเร็จเดิม
        const existingSuccess = document.querySelector('.success-message');
        if (existingSuccess) {
            existingSuccess.remove();
        }
        
        // สร้างข้อความสำเร็จใหม่
        const successElement = document.createElement('div');
        successElement.className = 'success-message';
        successElement.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
        
        // เพิ่มสไตล์
        successElement.style.backgroundColor = '#d4edda';
        successElement.style.color = '#155724';
        successElement.style.padding = '1rem';
        successElement.style.borderRadius = '4px';
        successElement.style.marginBottom = '1rem';
        successElement.style.textAlign = 'center';
        
        // เพิ่มลงในฟอร์ม
        if (loginForm) {
            loginForm.prepend(successElement);
        }
    }
    
    /**
     * ตรวจสอบรูปแบบอีเมล
     */
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // เพิ่ม CSS สำหรับ loading spinner
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
            margin-bottom: 2rem;
        }
        
        .already-logged-in .logout-btn {
            margin-right: 1rem;
        }
    `;
    document.head.appendChild(style);
});