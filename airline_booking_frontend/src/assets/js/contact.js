import { apiService } from './api-service.js';

document.addEventListener('DOMContentLoaded', function() {
    // แบบฟอร์มติดต่อ
    const contactForm = document.getElementById('contact-form');
    const confirmationModal = document.getElementById('confirmation-modal');
    const closeConfirmationBtn = document.getElementById('close-confirmation');
    
    // ตรวจสอบการเข้าสู่ระบบและกรอกข้อมูลอัตโนมัติ
    populateUserDataIfLoggedIn();
    
    // จัดการการส่งแบบฟอร์ม
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // ตรวจสอบข้อมูลแบบฟอร์ม
            if (!validateContactForm()) {
                return;
            }
            
            // รวบรวมข้อมูลแบบฟอร์ม
            const formData = collectFormData();
            
            // ส่งข้อมูลไปยัง API
            await submitContactForm(formData);
        });
    }
    
    // ปิดโมดัลยืนยัน
    if (closeConfirmationBtn) {
        closeConfirmationBtn.addEventListener('click', function() {
            if (confirmationModal) {
                confirmationModal.style.display = 'none';
            }
        });
    }
    
    // ปิดโมดัลเมื่อคลิกพื้นหลัง
    window.addEventListener('click', function(e) {
        if (e.target === confirmationModal) {
            confirmationModal.style.display = 'none';
        }
    });
    
    // เปิด/ปิด FAQ items
    setupFaqAccordion();
    
    // ตั้งค่าการแสดงผลเมื่อเลือกหัวข้อติดต่อ
    setupSubjectDependencies();
    
    // เพิ่ม effect ให้ฟอร์ม
    enhanceFormFields();
    
    // ตั้งค่า login และ register modals
    setupAuthModals();
});

// กรอกข้อมูลผู้ใช้อัตโนมัติหากเข้าสู่ระบบแล้ว
async function populateUserDataIfLoggedIn() {
    const userData = localStorage.getItem('userData');
    
    if (userData) {
        try {
            const user = JSON.parse(userData);
            
            // ดึงข้อมูลผู้ใช้ที่สมบูรณ์จาก API
            const userDetails = await apiService.getUserById(user.userId);
            
            // กรอกข้อมูลในฟอร์ม
            const nameField = document.getElementById('name');
            const emailField = document.getElementById('email');
            const phoneField = document.getElementById('phone');
            
            if (nameField && userDetails.firstName && userDetails.lastName) {
                nameField.value = `${userDetails.firstName} ${userDetails.lastName}`;
            }
            
            if (emailField && userDetails.email) {
                emailField.value = userDetails.email;
            }
            
            if (phoneField && userDetails.phone) {
                phoneField.value = userDetails.phone;
            }
            
            // เพิ่ม class filled ให้กับ fields ที่มีค่า
            document.querySelectorAll('.contact-form input, .contact-form textarea, .contact-form select').forEach(input => {
                if (input.value) {
                    input.parentElement.classList.add('filled');
                }
            });
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    }
}

// ตรวจสอบข้อมูลแบบฟอร์ม
function validateContactForm() {
    // ข้อมูลที่จำเป็น
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    const privacyPolicy = document.getElementById('privacy-policy').checked;
    
    // ตรวจสอบว่ากรอกข้อมูลครบหรือไม่
    if (!name || !email || !subject || !message || !privacyPolicy) {
        showFormError('กรุณากรอกข้อมูลให้ครบถ้วนและยอมรับนโยบายความเป็นส่วนตัว');
        return false;
    }
    
    // ตรวจสอบรูปแบบอีเมล
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        showFormError('กรุณากรอกอีเมลให้ถูกต้อง');
        document.getElementById('email').focus();
        return false;
    }
    
    // ตรวจสอบรหัสการจอง (ถ้าจำเป็น)
    const bookingRef = document.getElementById('booking-ref');
    const bookingRelatedSubjects = ['booking', 'flight-status', 'cancellation', 'refund'];
    
    if (bookingRef && bookingRelatedSubjects.includes(subject) && !bookingRef.value) {
        showFormError('กรุณากรอกรหัสการจองสำหรับหัวข้อนี้');
        bookingRef.focus();
        return false;
    }
    
    return true;
}

// แสดงข้อความผิดพลาดใต้ฟอร์ม
function showFormError(message) {
    // ลบข้อความผิดพลาดเดิม
    const existingError = document.querySelector('.form-error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // สร้างข้อความผิดพลาดใหม่
    const errorElement = document.createElement('div');
    errorElement.className = 'form-error-message';
    errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    
    // เพิ่มสไตล์
    errorElement.style.color = '#d32f2f';
    errorElement.style.padding = '0.5rem 0';
    errorElement.style.marginBottom = '1rem';
    errorElement.style.fontSize = '0.9rem';
    
    // เพิ่มลงในฟอร์ม
    const submitButton = document.querySelector('.contact-form button[type="submit"]');
    submitButton.parentNode.insertBefore(errorElement, submitButton);
    
    // ลบข้อความผิดพลาดหลังจาก 5 วินาที
    setTimeout(() => {
        errorElement.remove();
    }, 5000);
}

// รวบรวมข้อมูลจากฟอร์ม
function collectFormData() {
    return {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value || null,
        subject: document.getElementById('subject').value,
        bookingReference: document.getElementById('booking-ref').value || null,
        message: document.getElementById('message').value,
        privacyAccepted: document.getElementById('privacy-policy').checked
    };
}

// ส่งแบบฟอร์มติดต่อไปยัง API
async function submitContactForm(formData) {
    // แสดงสถานะการโหลด
    const submitBtn = document.querySelector('.contact-form button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังส่ง...';
    
    try {
        // ในกรณีที่มี API สำหรับส่งข้อความติดต่อ (ยังไม่มีใน api-service)
        // สามารถเพิ่ม method ใน api-service และเรียกใช้ได้
        // const response = await apiService.submitContactMessage(formData);
        
        // จำลองการเรียก API
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // แสดงโมดัลยืนยัน
        const confirmationModal = document.getElementById('confirmation-modal');
        if (confirmationModal) {
            confirmationModal.style.display = 'block';
        }
        
        // รีเซ็ตฟอร์ม
        document.getElementById('contact-form').reset();
        
        // ลบ class filled จาก form fields
        document.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('filled');
        });
    } catch (error) {
        console.error('Error submitting contact form:', error);
        showFormError('ไม่สามารถส่งข้อความได้ในขณะนี้ กรุณาลองใหม่อีกครั้งภายหลัง');
    } finally {
        // คืนค่าสถานะปุ่ม
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
}

// ตั้งค่า accordion สำหรับ FAQ
function setupFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        if (question) {
            question.addEventListener('click', function() {
                // ตรวจสอบว่า item นี้เปิดอยู่หรือไม่
                const isActive = item.classList.contains('active');
                
                // ปิดทุก item
                faqItems.forEach(faq => {
                    faq.classList.remove('active');
                    
                    // ซ่อน answer
                    const answer = faq.querySelector('.faq-answer');
                    if (answer) {
                        answer.style.maxHeight = '0';
                    }
                });
                
                // ถ้า item นี้ไม่ได้เปิดอยู่ก่อน ให้เปิด
                if (!isActive) {
                    item.classList.add('active');
                    
                    // แสดง answer
                    const answer = item.querySelector('.faq-answer');
                    if (answer) {
                        answer.style.maxHeight = answer.scrollHeight + 'px';
                    }
                    
                    // หมุนไอคอน
                    const icon = question.querySelector('.faq-toggle i');
                    if (icon) {
                        icon.style.transform = 'rotate(180deg)';
                    }
                } else {
                    // หมุนไอคอนกลับ
                    const icon = question.querySelector('.faq-toggle i');
                    if (icon) {
                        icon.style.transform = 'rotate(0deg)';
                    }
                }
            });
        }
    });
    
    // เปิด FAQ แรกโดยค่าเริ่มต้น
    if (faqItems.length > 0) {
        faqItems[0].classList.add('active');
        
        const firstAnswer = faqItems[0].querySelector('.faq-answer');
        if (firstAnswer) {
            firstAnswer.style.maxHeight = firstAnswer.scrollHeight + 'px';
        }
        
        const firstIcon = faqItems[0].querySelector('.faq-toggle i');
        if (firstIcon) {
            firstIcon.style.transform = 'rotate(180deg)';
        }
    }
    
    // เพิ่ม CSS สำหรับ animation
    const style = document.createElement('style');
    style.textContent = `
        .faq-answer {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease;
        }
        
        .faq-toggle i {
            transition: transform 0.3s ease;
        }
    `;
    document.head.appendChild(style);
}

// ตั้งค่าการแสดงผลตามหัวข้อที่เลือก
function setupSubjectDependencies() {
    const subjectField = document.getElementById('subject');
    const bookingRefField = document.getElementById('booking-ref');
    const bookingRefLabel = bookingRefField ? bookingRefField.previousElementSibling : null;
    
    if (subjectField && bookingRefField && bookingRefLabel) {
        // เพิ่ม event listener สำหรับการเปลี่ยนหัวข้อ
        subjectField.addEventListener('change', function() {
            const value = this.value;
            const bookingRelatedSubjects = ['booking', 'flight-status', 'cancellation', 'refund'];
            
            // ถ้าหัวข้อเกี่ยวกับการจอง ให้ต้องกรอกรหัสการจอง
            if (bookingRelatedSubjects.includes(value)) {
                bookingRefField.setAttribute('required', 'required');
                bookingRefLabel.innerHTML = 'รหัสการจอง <span class="required">*</span>';
                bookingRefField.parentElement.classList.add('required-field');
            } else {
                bookingRefField.removeAttribute('required');
                bookingRefLabel.textContent = 'รหัสการจอง (ถ้ามี)';
                bookingRefField.parentElement.classList.remove('required-field');
            }
        });
    }
}

// เพิ่ม effects ให้ form fields
function enhanceFormFields() {
    const formInputs = document.querySelectorAll('.contact-form input, .contact-form textarea, .contact-form select');
    
    formInputs.forEach(input => {
        // เพิ่ม effect เมื่อ focus
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        // ลบ effect เมื่อ blur และเพิ่ม class filled ถ้ามีข้อมูล
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
            
            if (this.value) {
                this.parentElement.classList.add('filled');
            } else {
                this.parentElement.classList.remove('filled');
            }
        });
        
        // ตรวจสอบสถานะเริ่มต้น (กรณีมีการ auto-fill ของเบราว์เซอร์)
        if (input.value) {
            input.parentElement.classList.add('filled');
        }
    });
    
    // เพิ่ม CSS สำหรับ effects
    const style = document.createElement('style');
    style.textContent = `
        .form-group.focused label {
            color: var(--primary-color);
            transform: translateY(-1.5rem) scale(0.9);
            background-color: white;
            padding: 0 0.5rem;
        }
        
        .form-group.filled label {
            transform: translateY(-1.5rem) scale(0.9);
            background-color: white;
            padding: 0 0.5rem;
        }
        
        .form-group.focused input,
        .form-group.focused select,
        .form-group.focused textarea {
            border-color: var(--primary-color);
            box-shadow: 0 0 0 1px var(--primary-color);
        }
        
        .form-group label {
            position: absolute;
            left: 1rem;
            top: 1rem;
            transition: all 0.2s ease;
            pointer-events: none;
            background-color: transparent;
        }
        
        .form-group input,
        .form-group select,
        .form-group textarea {
            padding: 1rem;
        }
        
        .required-field label:after {
            content: " *";
            color: #d32f2f;
        }
    `;
    document.head.appendChild(style);
}

// ตั้งค่า Login และ Register Modals
function setupAuthModals() {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const closeBtns = document.querySelectorAll('.close');
    const switchToRegister = document.getElementById('switch-to-register');
    const switchToLogin = document.getElementById('switch-to-login');
    
    // เปิด login modal
    if (loginBtn && loginModal) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            loginModal.style.display = 'block';
        });
    }
    
    // เปิด register modal
    if (registerBtn && registerModal) {
        registerBtn.addEventListener('click', function(e) {
            e.preventDefault();
            registerModal.style.display = 'block';
        });
    }
    
    // ปิด modals
    if (closeBtns) {
        closeBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                if (loginModal) loginModal.style.display = 'none';
                if (registerModal) registerModal.style.display = 'none';
            });
        });
    }
    
    // สลับระหว่าง login และ register
    if (switchToRegister) {
        switchToRegister.addEventListener('click', function(e) {
            e.preventDefault();
            if (loginModal) loginModal.style.display = 'none';
            if (registerModal) registerModal.style.display = 'block';
        });
    }
    
    if (switchToLogin) {
        switchToLogin.addEventListener('click', function(e) {
            e.preventDefault();
            if (registerModal) registerModal.style.display = 'none';
            if (loginModal) loginModal.style.display = 'block';
        });
    }
    
    // ปิด modal เมื่อคลิกพื้นหลัง
    window.addEventListener('click', function(e) {
        if (e.target === loginModal) {
            loginModal.style.display = 'none';
        }
        if (e.target === registerModal) {
            registerModal.style.display = 'none';
        }
    });
    
    // จัดการการส่งฟอร์ม login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            if (!email || !password) {
                alert('กรุณากรอกอีเมลและรหัสผ่าน');
                return;
            }
            
            try {
                // แสดงสถานะการโหลด
                const submitBtn = loginForm.querySelector('button[type="submit"]');
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังเข้าสู่ระบบ...';
                
                // เรียกใช้ API
                const response = await apiService.login(email, password);
                
                // บันทึก token
                apiService.setToken(response.token);
                
                // บันทึกข้อมูลผู้ใช้
                localStorage.setItem('userData', JSON.stringify(response.user));
                
                // รีโหลดหน้าเพื่อใช้ข้อมูลผู้ใช้ใหม่
                window.location.reload();
            } catch (error) {
                console.error('Login error:', error);
                alert('เข้าสู่ระบบไม่สำเร็จ: ' + (error.message || 'กรุณาตรวจสอบอีเมลและรหัสผ่าน'));
                
                // คืนค่าสถานะปุ่ม
                const submitBtn = loginForm.querySelector('button[type="submit"]');
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'เข้าสู่ระบบ';
            }
        });
    }
    
    // จัดการการส่งฟอร์ม register
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const firstName = document.getElementById('first-name').value;
            const lastName = document.getElementById('last-name').value;
            const email = document.getElementById('register-email').value;
            const phone = document.getElementById('phone').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const terms = document.getElementById('terms').checked;
            
            // ตรวจสอบข้อมูล
            if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
                alert('กรุณากรอกข้อมูลให้ครบถ้วน');
                return;
            }
            
            if (password !== confirmPassword) {
                alert('รหัสผ่านไม่ตรงกัน');
                return;
            }
            
            if (!terms) {
                alert('กรุณายอมรับข้อกำหนดและเงื่อนไข');
                return;
            }
            
            try {
                // แสดงสถานะการโหลด
                const submitBtn = registerForm.querySelector('button[type="submit"]');
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังสมัครสมาชิก...';
                
                // เรียกใช้ API
                const userData = {
                    firstName,
                    lastName,
                    email,
                    phone,
                    password
                };
                
                await apiService.register(userData);
                
                // แสดงข้อความสำเร็จ
                alert('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
                
                // ปิด register modal และเปิด login modal
                registerModal.style.display = 'none';
                loginModal.style.display = 'block';
                
                // รีเซ็ตฟอร์ม
                registerForm.reset();
            } catch (error) {
                console.error('Registration error:', error);
                alert('สมัครสมาชิกไม่สำเร็จ: ' + (error.message || 'กรุณาลองใหม่อีกครั้ง'));
                
                // คืนค่าสถานะปุ่ม
                const submitBtn = registerForm.querySelector('button[type="submit"]');
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'สมัครสมาชิก';
            }
        });
    }
}

// สร้างข้อความผิดพลาดสำหรับฟอร์ม login/register
function createLoginError(message, formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    // ลบข้อความผิดพลาดเดิม
    const existingError = form.querySelector('.form-error');
    if (existingError) {
        existingError.remove();
    }
    
    // สร้างข้อความผิดพลาดใหม่
    const errorElement = document.createElement('div');
    errorElement.className = 'form-error';
    errorElement.textContent = message;
    
    // เพิ่มสไตล์
    errorElement.style.color = '#d32f2f';
    errorElement.style.marginBottom = '1rem';
    errorElement.style.fontSize = '0.9rem';
    
    // เพิ่มลงในฟอร์ม
    const submitButton = form.querySelector('button[type="submit"]');
    form.insertBefore(errorElement, submitButton);
}