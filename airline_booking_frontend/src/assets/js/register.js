import { apiService } from './api-service.js';

document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const firstNameField = document.getElementById('firstName');
    const lastNameField = document.getElementById('lastName');
    const emailField = document.getElementById('email');
    const phoneField = document.getElementById('phone');
    const usernameField = document.getElementById('username'); // เพิ่มการดึง element username
    const passwordField = document.getElementById('password');
    const confirmPasswordField = document.getElementById('confirmPassword');
    const termsCheckbox = document.getElementById('terms');
    
    const firstNameError = document.getElementById('firstName-error');
    const lastNameError = document.getElementById('lastName-error');
    const emailError = document.getElementById('email-error');
    const phoneError = document.getElementById('phone-error');
    const usernameError = document.getElementById('username-error'); // เพิ่มการดึง element แสดง error
    const passwordError = document.getElementById('password-error');
    const confirmPasswordError = document.getElementById('confirmPassword-error');
    const termsError = document.getElementById('terms-error');
    
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');

    // Toggle password visibility
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const showText = this.querySelector('.show-password');
            const hideText = this.querySelector('.hide-password');

            if (input.type === 'password') {
                input.type = 'text';
                showText.style.display = 'none';
                hideText.style.display = 'inline';
            } else {
                input.type = 'password';
                showText.style.display = 'inline';
                hideText.style.display = 'none';
            }
        });
    });

    // Form validation
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        let isValid = true;
        
        // Reset all error messages
        const errorElements = [firstNameError, lastNameError, emailError, phoneError, 
                              usernameError, passwordError, confirmPasswordError, termsError]; // เพิ่ม usernameError
        errorElements.forEach(element => {
            if (element) element.style.display = 'none';
        });
        
        // Validate first name
        if (!firstNameField.value.trim()) {
            firstNameError.textContent = 'กรุณากรอกชื่อ';
            firstNameError.style.display = 'block';
            isValid = false;
        }
        
        // Validate last name
        if (!lastNameField.value.trim()) {
            lastNameError.textContent = 'กรุณากรอกนามสกุล';
            lastNameError.style.display = 'block';
            isValid = false;
        }
        
        // Validate email
        if (!emailField.value.trim()) {
            emailError.textContent = 'กรุณากรอกอีเมล';
            emailError.style.display = 'block';
            isValid = false;
        } else if (!isValidEmail(emailField.value.trim())) {
            emailError.textContent = 'กรุณากรอกอีเมลให้ถูกต้อง';
            emailError.style.display = 'block';
            isValid = false;
        }
        
        // Validate username - เพิ่มการตรวจสอบ username
        if (!usernameField.value.trim()) {
            usernameError.textContent = 'กรุณากรอกชื่อผู้ใช้';
            usernameError.style.display = 'block';
            isValid = false;
        }
        
        // Validate phone
        if (!phoneField.value.trim()) {
            phoneError.textContent = 'กรุณากรอกเบอร์โทรศัพท์';
            phoneError.style.display = 'block';
            isValid = false;
        } else if (!isValidPhone(phoneField.value.trim())) {
            phoneError.textContent = 'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง';
            phoneError.style.display = 'block';
            isValid = false;
        }
        
        // Validate password
        if (!passwordField.value) {
            passwordError.textContent = 'กรุณากรอกรหัสผ่าน';
            passwordError.style.display = 'block';
            isValid = false;
        } else if (passwordField.value.length < 6) {
            passwordError.textContent = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
            passwordError.style.display = 'block';
            isValid = false;
        }
        
        // Validate confirm password
        if (!confirmPasswordField.value) {
            confirmPasswordError.textContent = 'กรุณายืนยันรหัสผ่าน';
            confirmPasswordError.style.display = 'block';
            isValid = false;
        } else if (confirmPasswordField.value !== passwordField.value) {
            confirmPasswordError.textContent = 'รหัสผ่านไม่ตรงกัน';
            confirmPasswordError.style.display = 'block';
            isValid = false;
        }
        
        // Validate terms agreement
        if (!termsCheckbox.checked) {
            termsError.textContent = 'กรุณายอมรับข้อกำหนดและเงื่อนไข';
            termsError.style.display = 'block';
            isValid = false;
        }
        
        // Submit form if valid
        if (isValid) {
            registerUser();
        }
    });

    // Email validation function
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Phone validation function
    function isValidPhone(phone) {
        // Simple Thai phone validation (allows for some formatting variations)
        const phoneRegex = /^(\+66|0)[0-9]{8,9}$/;
        return phoneRegex.test(phone.replace(/[- ]/g, ''));
    }

    // Register user function - แก้ไขให้ใช้ username จากฟอร์ม
    async function registerUser() {
        // Show loading state
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.innerHTML = '<span class="loading-spinner"></span> กำลังสมัครสมาชิก...';
        submitBtn.disabled = true;
        
        try {
            // สร้าง object สำหรับข้อมูลผู้ใช้
            const userData = {
                firstName: firstNameField.value.trim(),
                lastName: lastNameField.value.trim(),
                username: usernameField.value.trim(), // ใช้ username ที่ผู้ใช้กรอก
                email: emailField.value.trim(),
                phone: phoneField.value.trim(),
                password: passwordField.value,
                role: "Customer" // เพิ่ม role เพื่อแก้ปัญหา constraint
            };
            
            // แสดงข้อมูลที่จะส่งในคอนโซล
            console.log('User data being sent:', userData);
            
            // เรียกใช้ API เพื่อลงทะเบียน
            const response = await apiService.register(userData);
            console.log('Registration response:', response);
            
            // แสดงข้อความสำเร็จ
            alert('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
            
            // ล้างฟอร์ม
            registerForm.reset();
            
            // นำผู้ใช้ไปยังหน้าเข้าสู่ระบบ
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Registration error:', error);
            
            // แสดงข้อความผิดพลาดที่เฉพาะเจาะจง
            if (error.message && error.message.includes('constraint')) {
                if (error.message.includes('Username')) {
                    usernameError.textContent = 'ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว กรุณาใช้ชื่อผู้ใช้อื่น';
                    usernameError.style.display = 'block';
                } else if (error.message.includes('Email')) {
                    emailError.textContent = 'อีเมลนี้มีอยู่ในระบบแล้ว กรุณาใช้อีเมลอื่น';
                    emailError.style.display = 'block';
                } else {
                    // แสดงข้อความผิดพลาดทั่วไปเกี่ยวกับ constraint
                    alert('ไม่สามารถสมัครสมาชิกได้: ข้อมูลที่ส่งไม่ถูกต้องหรือมีอยู่แล้วในระบบ');
                }
            } else {
                // แสดงข้อความผิดพลาดทั่วไป
                alert('ไม่สามารถสมัครสมาชิกได้: ' + error.message);
            }
        } finally {
            // Reset button state
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    }
});