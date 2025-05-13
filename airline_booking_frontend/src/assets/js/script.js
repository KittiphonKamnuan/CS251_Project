import { apiService } from './api-service.js';

document.addEventListener('DOMContentLoaded', function() {
    // เช็คสถานะการเข้าสู่ระบบและอัปเดต UI
    updateAuthUI();
    
    // Navigation Mobile Toggle
    setupMobileMenu();
    
    // Modal Functionality
    setupAuthModals();
    
    // ตั้งค่าข้อมูล user ที่ทุกหน้าต้องใช้
    setupUserData();
    
    // Newsletter Form
    setupNewsletterForm();
    
    // Social Sharing Setup
    setupSocialSharing();
    
    // Flight Status Updates (for status page if exists)
    setupFlightStatusUpdates();
    
    // Special Offers Click Handlers
    setupSpecialOffersHandlers();
    
    // ตั้งค่า Smooth Scrolling สำหรับการคลิกลิงก์ภายในเว็บไซต์
    setupSmoothScrolling();
    
    /**
     * เช็คสถานะการเข้าสู่ระบบและอัปเดต UI
     */
    function updateAuthUI() {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        const userActionsContainer = document.querySelector('.user-actions');
        
        if (token && userData && userActionsContainer) {
            try {
                const user = JSON.parse(userData);
                
                // เปลี่ยน UI เป็นสถานะเข้าสู่ระบบแล้ว
                userActionsContainer.innerHTML = `
                    <div class="user-welcome">ยินดีต้อนรับ, ${user.firstName || user.email || 'คุณ'}</div>
                    <div class="user-dropdown">
                        <button class="user-dropdown-btn">
                            <i class="fas fa-user-circle"></i>
                            <i class="fas fa-caret-down"></i>
                        </button>
                        <div class="user-dropdown-content">
                            <a href="profile.html">
                                <i class="fas fa-user"></i> โปรไฟล์
                            </a>
                            <a href="booking-status.html">
                                <i class="fas fa-ticket-alt"></i> การจองของฉัน
                            </a>
                            <a href="#" id="logoutBtn">
                                <i class="fas fa-sign-out-alt"></i> ออกจากระบบ
                            </a>
                        </div>
                    </div>
                `;
                
                // ตั้งค่า dropdown สำหรับเมนูผู้ใช้
                setupUserDropdown();
                
                // เพิ่ม event listener สำหรับปุ่มออกจากระบบ
                const logoutBtn = document.getElementById('logoutBtn');
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
     * ตั้งค่า dropdown สำหรับเมนูผู้ใช้
     */
    function setupUserDropdown() {
        const dropdownBtn = document.querySelector('.user-dropdown-btn');
        const dropdownContent = document.querySelector('.user-dropdown-content');
        
        if (dropdownBtn && dropdownContent) {
            dropdownBtn.addEventListener('click', function() {
                dropdownContent.classList.toggle('show');
            });
            
            // ปิด dropdown เมื่อคลิกที่อื่น
            document.addEventListener('click', function(e) {
                if (!e.target.matches('.user-dropdown-btn') && 
                    !e.target.closest('.user-dropdown-btn') &&
                    !e.target.closest('.user-dropdown-content')) {
                    if (dropdownContent.classList.contains('show')) {
                        dropdownContent.classList.remove('show');
                    }
                }
            });
        }
    }
    
    /**
     * จัดการการออกจากระบบ
     */
    function handleLogout(e) {
        e.preventDefault();
        
        // ล้างข้อมูลการเข้าสู่ระบบ
        apiService.clearToken();
        localStorage.removeItem('userData');
        
        // Redirect ไปยังหน้าหลัก
        window.location.href = 'index.html';
    }
    
    /**
     * ตั้งค่าเมนูมือถือ
     */
    function setupMobileMenu() {
        const hamburger = document.querySelector('.mobile-menu-toggle');
        const mobileMenu = document.querySelector('.mobile-menu');
        
        if (hamburger && mobileMenu) {
            hamburger.addEventListener('click', function() {
                const isVisible = mobileMenu.style.display === 'block';
                mobileMenu.style.display = isVisible ? 'none' : 'block';
                
                // Animation for hamburger icon
                this.classList.toggle('active');
            });
        }
    }
    
    /**
     * ตั้งค่า modals สำหรับเข้าสู่ระบบและสมัครสมาชิก
     */
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
        
        // สลับระหว่าง login และ register modals
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
                const terms = document.getElementById('terms')?.checked;
                
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
    
    /**
     * ตั้งค่าข้อมูล user ที่ทุกหน้าต้องใช้
     */
    async function setupUserData() {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        
        if (token && userData) {
            try {
                // อาจจะมีการดึงข้อมูลผู้ใช้เพิ่มเติมถ้าจำเป็น
                const user = JSON.parse(userData);
                
                // ถ้าต้องการข้อมูลเพิ่มเติมของผู้ใช้ที่ไม่ได้เก็บไว้ใน localStorage
                // สามารถดึงข้อมูลเพิ่มเติมจาก API ได้
                // const userDetails = await apiService.getUserById(user.userId);
                
                // สามารถนำข้อมูลผู้ใช้ไปใช้ในส่วนต่างๆ ของเว็บไซต์ตรงนี้ได้
                
                // ตัวอย่าง: แสดงชื่อผู้ใช้ในส่วน header
                const userWelcomeElement = document.querySelector('.user-welcome');
                if (userWelcomeElement) {
                    userWelcomeElement.textContent = `ยินดีต้อนรับ, ${user.firstName || user.email || 'คุณ'}`;
                }
            } catch (error) {
                console.error('Error setting up user data:', error);
            }
        }
    }
    
    /**
     * ตั้งค่าฟอร์ม Newsletter
     */
    function setupNewsletterForm() {
        const newsletterForm = document.querySelector('.newsletter-form');
        
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const emailInput = this.querySelector('input[type="email"]');
                const email = emailInput.value;
                
                if (!email) {
                    alert('กรุณากรอกอีเมล');
                    return;
                }
                
                // แสดงสถานะการโหลด
                const submitBtn = this.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.textContent;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังลงทะเบียน...';
                
                try {
                    // ในกรณีที่มี API สำหรับ newsletter (ยังไม่มีใน api-service)
                    // สามารถเพิ่ม method ใน api-service และเรียกใช้ได้
                    // await apiService.subscribeNewsletter(email);
                    
                    // จำลองการส่งข้อมูล
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    // แสดงข้อความสำเร็จ
                    alert('ขอบคุณสำหรับการลงทะเบียน! เราจะส่งข้อเสนอพิเศษให้คุณเร็วๆ นี้');
                    
                    // รีเซ็ตฟอร์ม
                    emailInput.value = '';
                } catch (error) {
                    console.error('Newsletter subscription error:', error);
                    alert('ไม่สามารถลงทะเบียนได้ในขณะนี้ กรุณาลองใหม่อีกครั้งภายหลัง');
                } finally {
                    // คืนค่าสถานะปุ่ม
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                }
            });
        }
    }
    
    /**
     * ตั้งค่าการแชร์ลงโซเชียลมีเดีย
     */
    function setupSocialSharing() {
        const shareButtons = document.querySelectorAll('.share-btn');
        
        if (shareButtons.length > 0) {
            shareButtons.forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    const platform = this.dataset.platform;
                    const url = encodeURIComponent(window.location.href);
                    const title = encodeURIComponent(document.title);
                    
                    let shareUrl = '';
                    
                    switch (platform) {
                        case 'facebook':
                            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                            break;
                        case 'twitter':
                            shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
                            break;
                        case 'line':
                            shareUrl = `https://social-plugins.line.me/lineit/share?url=${url}`;
                            break;
                        default:
                            alert('ไม่สามารถแชร์ไปยังแพลตฟอร์มนี้ได้');
                            return;
                    }
                    
                    // เปิดหน้าต่างใหม่สำหรับแชร์
                    window.open(shareUrl, 'share-window', 'width=600,height=400');
                });
            });
        }
    }
    
    /**
     * ตั้งค่าการอัปเดตสถานะเที่ยวบิน (สำหรับหน้าสถานะเที่ยวบินถ้ามี)
     */
    function setupFlightStatusUpdates() {
        const flightStatusTable = document.querySelector('.flight-status-table');
        
        if (flightStatusTable) {
            // ดึงข้อมูลสถานะเที่ยวบินครั้งแรก
            fetchFlightStatuses();
            
            // อัปเดตข้อมูลทุก 1 นาที
            setInterval(fetchFlightStatuses, 60000);
        }
        
        async function fetchFlightStatuses() {
            try {
                // ดึงข้อมูลสถานะเที่ยวบินจาก API
                // สามารถใช้ apiService.getFlightsByStatus('Scheduled') เพื่อดึงเที่ยวบินตามสถานะ
                // หรือการเรียกใช้ API อื่นๆ ที่เหมาะสม
                
                // ตัวอย่าง: จำลองการดึงข้อมูล
                const flights = [
                    { flightNumber: 'TG123', status: 'On Time' },
                    { flightNumber: 'TG456', status: 'Delayed' },
                    { flightNumber: 'TG789', status: 'Boarding' }
                ];
                
                // อัปเดตสถานะในตาราง
                updateFlightStatusTable(flights);
            } catch (error) {
                console.error('Error fetching flight statuses:', error);
            }
        }
        
        function updateFlightStatusTable(flights) {
            const statusCells = flightStatusTable.querySelectorAll('.status');
            
            // อัปเดตสถานะ
            flights.forEach((flight, index) => {
                if (statusCells[index]) {
                    // ลบคลาสเดิม
                    statusCells[index].className = 'status';
                    
                    // เพิ่มคลาสใหม่ตามสถานะ
                    let className = '';
                    
                    switch (flight.status) {
                        case 'On Time':
                            className = 'on-time';
                            break;
                        case 'Delayed':
                            className = 'delayed';
                            break;
                        case 'Boarding':
                            className = 'boarding';
                            break;
                        case 'Departed':
                            className = 'departed';
                            break;
                        case 'Arrived':
                            className = 'arrived';
                            break;
                        case 'Cancelled':
                            className = 'cancelled';
                            break;
                        default:
                            className = '';
                    }
                    
                    statusCells[index].classList.add(className);
                    statusCells[index].textContent = flight.status;
                }
            });
        }
    }
    
    /**
     * ตั้งค่าการคลิกบนโปรโมชั่นพิเศษ
     */
    function setupSpecialOffersHandlers() {
        const offerCards = document.querySelectorAll('.offer-card .btn');
        
        offerCards.forEach(btn => {
            btn.addEventListener('click', function() {
                // Scroll ไปที่ฟอร์มค้นหา
                const searchContainer = document.querySelector('.search-container') || 
                                        document.querySelector('.search-form-section');
                if (searchContainer) {
                    searchContainer.scrollIntoView({ behavior: 'smooth' });
                }
                
                // ถ้ามีรหัสโปรโมชั่น ให้คัดลอกลงคลิปบอร์ด
                const offerContent = this.closest('.offer-content');
                const offerCode = offerContent?.querySelector('.offer-code strong');
                
                if (offerCode) {
                    // สร้าง input element ชั่วคราว
                    const tempInput = document.createElement('input');
                    tempInput.value = offerCode.textContent;
                    document.body.appendChild(tempInput);
                    
                    // เลือกและคัดลอกข้อความ
                    tempInput.select();
                    document.execCommand('copy');
                    
                    // ลบ element ชั่วคราว
                    document.body.removeChild(tempInput);
                    
                    // แสดงข้อความยืนยัน
                    alert(`รหัสโปรโมชั่น ${offerCode.textContent} ถูกคัดลอกแล้ว`);
                }
            });
        });
    }
    
    /**
     * ตั้งค่า Smooth Scrolling สำหรับการคลิกลิงก์ภายใน
     */
    function setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
    
    // เพิ่ม CSS สำหรับ dropdown และ spinner
    const style = document.createElement('style');
    style.textContent = `
        .user-dropdown {
            position: relative;
            display: inline-block;
        }
        
        .user-dropdown-btn {
            background-color: transparent;
            border: none;
            color: var(--primary-color);
            font-size: 1rem;
            cursor: pointer;
            padding: 0.5rem;
        }
        
        .user-dropdown-content {
            display: none;
            position: absolute;
            right: 0;
            background-color: white;
            min-width: 200px;
            box-shadow: 0 8px 16px rgba(0,0,0,0.1);
            z-index: 1000;
            border-radius: 4px;
            overflow: hidden;
        }
        
        .user-dropdown-content a {
            color: #333;
            padding: 12px 16px;
            text-decoration: none;
            display: block;
            transition: background-color 0.3s;
        }
        
        .user-dropdown-content a:hover {
            background-color: #f5f5f5;
        }
        
        .user-dropdown-content.show {
            display: block;
            animation: fadeIn 0.3s;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .mobile-menu-toggle.active span:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }
        
        .mobile-menu-toggle.active span:nth-child(2) {
            opacity: 0;
        }
        
        .mobile-menu-toggle.active span:nth-child(3) {
            transform: rotate(-45deg) translate(5px, -5px);
        }
        
        .loading-spinner {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 1s linear infinite;
            margin-right: 6px;
            vertical-align: middle;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
});