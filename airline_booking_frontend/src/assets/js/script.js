// Import API service if using ES modules
import { apiService } from './api-service.js';

document.addEventListener('DOMContentLoaded', function() {
    // Initialize page components
    initUserInterface();
    loadPopularDestinations();
    loadSpecialOffers();
    setupNewsletterForm();
    
    /**
     * เริ่มต้นองค์ประกอบ UI ของหน้า
     */
    function initUserInterface() {
        // ตรวจสอบสถานะการเข้าสู่ระบบและอัปเดต UI
        updateAuthUI();
        
        // ตั้งค่าเมนูมือถือ
        setupMobileMenu();
        
        // ตั้งค่าแท็บการค้นหา
        setupSearchTabs();
        
        // ตั้งค่าค่าเริ่มต้นสำหรับฟิลด์วันที่
        setupDateInputs();
    }
    
    /**
     * อัปเดต UI ตามสถานะการเข้าสู่ระบบ
     */
    function updateAuthUI() {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        
        const userActionsContainer = document.getElementById('userActionsContainer');
        const mobileUserActions = document.getElementById('mobileUserActions');
        
        if (token && userData) {
            try {
                const user = JSON.parse(userData);
                
                // อัปเดต UI สำหรับผู้ใช้ที่เข้าสู่ระบบแล้ว
                if (userActionsContainer) {
                    userActionsContainer.innerHTML = `
                        <div class="user-welcome">ยินดีต้อนรับ, ${user.firstName || user.username || 'คุณ'}</div>
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
                    
                    // ตั้งค่า dropdown ผู้ใช้
                    setupUserDropdown();
                }
                
                // อัปเดตเมนูมือถือ
                if (mobileUserActions) {
                    mobileUserActions.innerHTML = `
                        <div class="user-welcome-mobile">ยินดีต้อนรับ, ${user.firstName || user.username || 'คุณ'}</div>
                        <a href="profile.html" class="btn btn-outline">โปรไฟล์</a>
                        <a href="booking-status.html" class="btn btn-outline">การจองของฉัน</a>
                        <a href="#" id="mobileLogoutBtn" class="btn btn-primary">ออกจากระบบ</a>
                    `;
                    
                    // เพิ่ม event listener สำหรับปุ่มออกจากระบบบนมือถือ
                    const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
                    if (mobileLogoutBtn) {
                        mobileLogoutBtn.addEventListener('click', handleLogout);
                    }
                }
                
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
     * จัดการ dropdown ของเมนูผู้ใช้
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
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        
        // ล้างข้อมูล API service
        apiService.clearToken();
        
        // โหลดหน้าใหม่
        window.location.reload();
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
     * ตั้งค่าแท็บการค้นหา
     */
    function setupSearchTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const returnDateGroup = document.querySelector('.return-date');
        
        if (tabButtons && returnDateGroup) {
            tabButtons.forEach(button => {
                button.addEventListener('click', function() {
                    // ลบ class active จากทุกปุ่ม
                    tabButtons.forEach(btn => btn.classList.remove('active'));
                    
                    // เพิ่ม class active ให้กับปุ่มที่คลิก
                    this.classList.add('active');
                    
                    // Toggle return date visibility based on selected tab
                    if (this.dataset.tab === 'one-way') {
                        returnDateGroup.style.display = 'none';
                        document.getElementById('return-date').removeAttribute('required');
                    } else if (this.dataset.tab === 'round-trip') {
                        returnDateGroup.style.display = 'block';
                        document.getElementById('return-date').setAttribute('required', '');
                    } else if (this.dataset.tab === 'multi-city') {
                        // In a real app, we would show additional inputs for multi-city
                        returnDateGroup.style.display = 'none';
                        document.getElementById('return-date').removeAttribute('required');
                        alert('การค้นหาแบบหลายเมืองจะเพิ่มในอนาคต');
                    }
                });
            });
        }
    }
    
    /**
     * ตั้งค่าฟิลด์วันที่
     */
    function setupDateInputs() {
        const departureDate = document.getElementById('departure-date');
        const returnDate = document.getElementById('return-date');
        
        if (departureDate && returnDate) {
            // Set min dates to today
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            // Format date as YYYY-MM-DD
            const formatDate = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };
            
            // Set min and default values
            departureDate.min = formatDate(today);
            departureDate.value = formatDate(tomorrow);
            
            const nextWeek = new Date(today);
            nextWeek.setDate(nextWeek.getDate() + 7);
            
            returnDate.min = formatDate(tomorrow);
            returnDate.value = formatDate(nextWeek);
            
            // Event handlers for date changes
            departureDate.addEventListener('change', function() {
                // Ensure return date is after departure date
                const depDate = new Date(this.value);
                const retDate = new Date(returnDate.value);
                
                if (retDate <= depDate) {
                    // Set return date to day after departure
                    const nextDay = new Date(depDate);
                    nextDay.setDate(nextDay.getDate() + 1);
                    returnDate.value = formatDate(nextDay);
                }
                
                returnDate.min = formatDate(depDate);
            });
        }
    }
    
    /**
     * โหลดข้อมูลจุดหมายปลายทางยอดนิยมจาก API
     */
    async function loadPopularDestinations() {
        const destinationsGrid = document.getElementById('popular-destinations-grid');
        if (!destinationsGrid) return;
        
        try {
            // แสดงตัวแสดงการโหลด
            destinationsGrid.innerHTML = `
                <div class="loading-spinner-container">
                    <div class="loading-spinner"></div>
                    <p>กำลังโหลดข้อมูล...</p>
                </div>
            `;
            
            // ดึงข้อมูลจุดหมายปลายทางยอดนิยมจาก API จริง
            const destinations = await apiService.request('/destinations/popular');
            
            // ล้างข้อมูลเดิมและแสดงข้อมูลใหม่
            destinationsGrid.innerHTML = '';
            
            if (destinations && destinations.length > 0) {
                destinations.forEach(destination => {
                    const card = document.createElement('div');
                    card.className = 'destination-card';
                    card.dataset.destination = `${destination.name} (${destination.code})`;
                    
                    card.innerHTML = `
                        <div class="destination-img">
                            <img src="${destination.imageUrl}" alt="${destination.name}">
                        </div>
                        <div class="destination-info">
                            <h3 class="destination-name">${destination.name}</h3>
                            <p class="destination-price">เริ่มต้นที่ ฿${destination.price.toLocaleString()}</p>
                        </div>
                    `;
                    
                    destinationsGrid.appendChild(card);
                });
            } else {
                // กรณีไม่มีข้อมูล
                destinationsGrid.innerHTML = `
                    <div class="no-data-message">
                        <p>ไม่มีข้อมูลจุดหมายปลายทางยอดนิยมในขณะนี้</p>
                    </div>
                `;
            }
            
            // เพิ่ม event listener สำหรับการคลิกการ์ดจุดหมายปลายทาง
            setupDestinationCardEvents();
        } catch (error) {
            console.error('Error loading popular destinations:', error);
            destinationsGrid.innerHTML = `
                <div class="error-message">
                    <p>ไม่สามารถโหลดข้อมูลจุดหมายปลายทางได้ในขณะนี้</p>
                    <button class="btn btn-outline retry-btn">ลองใหม่</button>
                </div>
            `;
            
            // เพิ่ม event listener สำหรับปุ่มลองใหม่
            const retryBtn = destinationsGrid.querySelector('.retry-btn');
            if (retryBtn) {
                retryBtn.addEventListener('click', loadPopularDestinations);
            }
        }
    }
    
    /**
     * ตั้งค่า event listeners สำหรับการคลิกการ์ดจุดหมายปลายทาง
     */
    function setupDestinationCardEvents() {
        const destinationCards = document.querySelectorAll('.destination-card');
        
        destinationCards.forEach(card => {
            card.addEventListener('click', function() {
                const destination = this.dataset.destination;
                if (!destination) return;
                
                // กรอกข้อมูลในฟอร์มค้นหา
                const departureInput = document.getElementById('departure');
                const arrivalInput = document.getElementById('arrival');
                
                if (departureInput && arrivalInput) {
                    departureInput.value = 'กรุงเทพฯ (BKK)';
                    arrivalInput.value = destination;
                    
                    // เลื่อนไปที่ฟอร์มค้นหา
                    document.querySelector('.search-form-container').scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }
    
    /**
     * โหลดข้อมูลโปรโมชั่นพิเศษจาก API
     */
    async function loadSpecialOffers() {
        const offersGrid = document.getElementById('special-offers-grid');
        if (!offersGrid) return;
        
        try {
            // แสดงตัวแสดงการโหลด
            offersGrid.innerHTML = `
                <div class="loading-spinner-container">
                    <div class="loading-spinner"></div>
                    <p>กำลังโหลดข้อมูล...</p>
                </div>
            `;
            
            // ดึงข้อมูลโปรโมชั่นพิเศษจาก API จริง
            const offers = await apiService.request('/promotions/featured');
            
            // ล้างข้อมูลเดิมและแสดงข้อมูลใหม่
            offersGrid.innerHTML = '';
            
            if (offers && offers.length > 0) {
                offers.forEach(offer => {
                    const card = document.createElement('div');
                    card.className = 'offer-card';
                    
                    card.innerHTML = `
                        <div class="offer-img">
                            <img src="${offer.imageUrl}" alt="${offer.title}">
                        </div>
                        <div class="offer-content">
                            <h3 class="offer-title">${offer.title}</h3>
                            <p class="offer-details">${offer.details}</p>
                            <div class="offer-price">เริ่มต้น ฿${offer.price.toLocaleString()}</div>
                            <a href="promotions.html?id=${offer.id}" class="btn btn-outline">ดูรายละเอียด</a>
                        </div>
                    `;
                    
                    offersGrid.appendChild(card);
                });
            } else {
                // กรณีไม่มีข้อมูล
                offersGrid.innerHTML = `
                    <div class="no-data-message">
                        <p>ไม่มีข้อมูลโปรโมชั่นพิเศษในขณะนี้</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading special offers:', error);
            offersGrid.innerHTML = `
                <div class="error-message">
                    <p>ไม่สามารถโหลดข้อมูลโปรโมชั่นได้ในขณะนี้</p>
                    <button class="btn btn-outline retry-btn">ลองใหม่</button>
                </div>
            `;
            
            // เพิ่ม event listener สำหรับปุ่มลองใหม่
            const retryBtn = offersGrid.querySelector('.retry-btn');
            if (retryBtn) {
                retryBtn.addEventListener('click', loadSpecialOffers);
            }
        }
    }
    
    /**
     * ตั้งค่าฟอร์มรับข่าวสาร
     */
    function setupNewsletterForm() {
        const newsletterForm = document.querySelector('.newsletter-form');
        const newsletterMessage = document.getElementById('newsletter-message');
        
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const emailInput = this.querySelector('input[type="email"]');
                const email = emailInput.value;
                
                if (!email) {
                    showNewsletterMessage('กรุณากรอกอีเมล', 'error');
                    return;
                }
                
                // แสดงสถานะการโหลด
                const submitBtn = this.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.textContent;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="loading-spinner-btn"></span> กำลังลงทะเบียน...';
                
                try {
                    // ส่งข้อมูลการสมัครรับข่าวสารไปยัง API จริง
                    const response = await apiService.request('/newsletter/subscribe', 'POST', { email });
                    
                    // แสดงข้อความสำเร็จ
                    showNewsletterMessage('ขอบคุณสำหรับการลงทะเบียน! เราจะส่งข้อเสนอพิเศษให้คุณเร็วๆ นี้', 'success');
                    
                    // ล้างฟอร์ม
                    emailInput.value = '';
                } catch (error) {
                    console.error('Newsletter subscription error:', error);
                    showNewsletterMessage('ไม่สามารถลงทะเบียนได้ในขณะนี้ กรุณาลองใหม่อีกครั้งภายหลัง', 'error');
                } finally {
                    // คืนค่าสถานะปุ่ม
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                }
            });
        }
        
        // แสดงข้อความ
        function showNewsletterMessage(message, type) {
            if (newsletterMessage) {
                newsletterMessage.textContent = message;
                newsletterMessage.className = `newsletter-message ${type}`;
                newsletterMessage.style.display = 'block';
                
                // ซ่อนข้อความหลังจาก 5 วินาที
                setTimeout(() => {
                    newsletterMessage.style.display = 'none';
                }, 5000);
            }
        }
    }
    
    // เพิ่ม style สำหรับ loading spinner และข้อความแจ้งเตือน
    addStyles();
    
    /**
     * เพิ่ม styles ที่จำเป็นสำหรับองค์ประกอบ UI เพิ่มเติม
     */
    function addStyles() {
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
                display: flex;
                align-items: center;
            }
            
            .user-dropdown-btn i {
                margin-right: 5px;
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
                display: flex;
                align-items: center;
                transition: background-color 0.3s;
            }
            
            .user-dropdown-content a i {
                margin-right: 10px;
                width: 16px;
                text-align: center;
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
            
            .loading-spinner-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                width: 100%;
                padding: 3rem 0;
            }
            
            .loading-spinner {
                border: 4px solid #f3f3f3;
                border-top: 4px solid var(--primary-color);
                border-radius: 50%;
                width: 40px;
                height: 40px;
                animation: spin 1s linear infinite;
                margin-bottom: 1rem;
            }
            
            .loading-spinner-btn {
                display: inline-block;
                width: 16px;
                height: 16px;
                border: 2px solid rgba(255,255,255,0.3);
                border-radius: 50%;
                border-top-color: white;
                animation: spin 1s linear infinite;
                vertical-align: middle;
                margin-right: 8px;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            
            .error-message {
                text-align: center;
                padding: 2rem;
                background-color: #f8f8f8;
                border-radius: 8px;
                margin: 2rem 0;
            }
            
            .error-message p {
                margin-bottom: 1rem;
                color: #d32f2f;
            }
            
            .no-data-message {
                text-align: center;
                padding: 2rem;
                background-color: #f8f8f8;
                border-radius: 8px;
                margin: 2rem 0;
                color: #666;
            }
            
            .newsletter-message {
                margin-top: 1rem;
                padding: 0.75rem 1rem;
                border-radius: 4px;
                text-align: center;
            }
            
            .newsletter-message.success {
                background-color: #e8f5e9;
                color: #2e7d32;
                border: 1px solid #c8e6c9;
            }
            
            .newsletter-message.error {
                background-color: #ffebee;
                color: #c62828;
                border: 1px solid #ffcdd2;
            }
            
            .user-welcome {
                margin-right: 15px;
                color: var(--primary-color);
                font-weight: 500;
            }
            
            .user-welcome-mobile {
                text-align: center;
                margin-bottom: 15px;
                font-weight: 500;
                color: var(--primary-color);
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
        `;
        document.head.appendChild(style);
    }
});