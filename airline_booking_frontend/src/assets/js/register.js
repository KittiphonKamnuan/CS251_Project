/**
 * Register Page JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const firstNameField = document.getElementById('firstName');
    const lastNameField = document.getElementById('lastName');
    const emailField = document.getElementById('email');
    const phoneField = document.getElementById('phone');
    const passwordField = document.getElementById('password');
    const confirmPasswordField = document.getElementById('confirmPassword');
    const termsCheckbox = document.getElementById('terms');
    
    const firstNameError = document.getElementById('firstName-error');
    const lastNameError = document.getElementById('lastName-error');
    const emailError = document.getElementById('email-error');
    const phoneError = document.getElementById('phone-error');
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
                              passwordError, confirmPasswordError, termsError];
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
            // For demo purposes, we'll simulate a registration
            simulateRegistration(emailField.value);
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

    // Simulate registration for demo purposes
    function simulateRegistration(email) {
        // Show loading state
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.innerHTML = '<span class="loading-spinner"></span> กำลังสมัครสมาชิก...';
        submitBtn.disabled = true;
        
        // Simulate API call delay
        setTimeout(() => {
            // In a real app, this would be an API call
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userEmail', email);
            
            // Redirect to index page
            window.location.href = 'index.html';
        }, 1500);
    }
});