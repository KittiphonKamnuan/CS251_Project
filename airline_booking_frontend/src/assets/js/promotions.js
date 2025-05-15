import { apiService } from './api-service.js';

document.addEventListener('DOMContentLoaded', function() {
    // Initialize page components
    initPageComponents();
    setupCopyButtons();
    setupFilters();
    setupPagination();
    setupNewsletterForm();
    setupDetailLinks();
    setupAuthModals();
    
    /**
     * Initialize page components
     */
    function initPageComponents() {
        // Check login status and update UI
        updateAuthUI();
        
        // Setup mobile menu
        setupMobileMenu();
        
        // Fetch promotions data
        fetchPromotions();
    }
    
    /**
     * Update UI based on authentication status
     */
    function updateAuthUI() {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        
        const userActionsContainer = document.getElementById('userActionsContainer');
        const mobileUserActions = document.getElementById('mobileUserActions');
        
        if (token && userData) {
            try {
                const user = JSON.parse(userData);
                
                // Update UI for logged-in users
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
                    
                    // Setup user dropdown
                    setupUserDropdown();
                }
                
                // Update mobile menu
                if (mobileUserActions) {
                    mobileUserActions.innerHTML = `
                        <div class="user-welcome-mobile">ยินดีต้อนรับ, ${user.firstName || user.username || 'คุณ'}</div>
                        <a href="profile.html" class="btn btn-outline">โปรไฟล์</a>
                        <a href="booking-status.html" class="btn btn-outline">การจองของฉัน</a>
                        <a href="#" id="mobileLogoutBtn" class="btn btn-primary">ออกจากระบบ</a>
                    `;
                    
                    // Add event listener for mobile logout button
                    const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
                    if (mobileLogoutBtn) {
                        mobileLogoutBtn.addEventListener('click', handleLogout);
                    }
                }
                
                // Add event listener for logout button
                const logoutBtn = document.getElementById('logoutBtn');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', handleLogout);
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
                // If user data is invalid, clear data and reload
                localStorage.removeItem('authToken');
                localStorage.removeItem('userData');
                window.location.reload();
            }
        }
    }
    
    /**
     * Setup user dropdown menu
     */
    function setupUserDropdown() {
        const dropdownBtn = document.querySelector('.user-dropdown-btn');
        const dropdownContent = document.querySelector('.user-dropdown-content');
        
        if (dropdownBtn && dropdownContent) {
            dropdownBtn.addEventListener('click', function() {
                dropdownContent.classList.toggle('show');
            });
            
            // Close dropdown when clicking elsewhere
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
     * Handle logout
     */
    function handleLogout(e) {
        e.preventDefault();
        
        // Clear login data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        
        // Clear API service token
        apiService.clearToken();
        
        // Reload page
        window.location.reload();
    }
    
    /**
     * Setup mobile menu
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
     * Fetch promotions from API
     */
    async function fetchPromotions() {
        try {
            // In the future, when the API endpoint for promotions is available
            // const promotions = await apiService.getPromotions();
            
            // For now, we'll use the existing data in the HTML
            // No loading state needed since we're using existing data
        } catch (error) {
            console.error('Error fetching promotions:', error);
            showErrorMessage('ไม่สามารถโหลดข้อมูลโปรโมชันได้ในขณะนี้ กรุณาลองใหม่อีกครั้งภายหลัง');
        }
    }
    
    /**
     * Setup copy buttons for promotion codes
     */
    function setupCopyButtons() {
        const copyButtons = document.querySelectorAll('.btn-copy');
        
        copyButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const code = this.getAttribute('data-code');
                
                // Create temporary input element
                const tempInput = document.createElement('input');
                tempInput.value = code;
                document.body.appendChild(tempInput);
                
                // Select and copy
                tempInput.select();
                document.execCommand('copy');
                
                // Remove temporary element
                document.body.removeChild(tempInput);
                
                // Show response
                const originalHTML = this.innerHTML;
                this.innerHTML = '<i class="fas fa-check"></i>';
                this.style.color = 'var(--success)';
                
                // Reset after 2 seconds
                setTimeout(() => {
                    this.innerHTML = originalHTML;
                    this.style.color = '';
                }, 2000);
                
                // Show message
                alert(`รหัสโปรโมชั่น ${code} ถูกคัดลอกแล้ว`);
            });
        });
    }
    
    /**
     * Setup promotion filters
     */
    function setupFilters() {
        const typeFilter = document.getElementById('promotion-type');
        const destinationFilter = document.getElementById('promotion-destination');
        const sortFilter = document.getElementById('promotion-sort');
        
        const filters = [typeFilter, destinationFilter, sortFilter];
        
        filters.forEach(filter => {
            if (filter) {
                filter.addEventListener('change', applyFilters);
            }
        });
    }
    
    /**
     * Apply filters to promotions
     */
    function applyFilters() {
        const typeFilter = document.getElementById('promotion-type');
        const destinationFilter = document.getElementById('promotion-destination');
        const sortFilter = document.getElementById('promotion-sort');
        
        const typeValue = typeFilter?.value || 'all';
        const destinationValue = destinationFilter?.value || 'all';
        const sortValue = sortFilter?.value || 'latest';
        
        // In the future, when the API endpoint for promotions is available
        // const promotions = await apiService.getPromotions(typeValue, destinationValue, sortValue);
        
        // For now, we'll simulate filtering
        const promotionCards = document.querySelectorAll('.promotion-card');
        
        // Show loading effect
        promotionCards.forEach(card => {
            card.style.opacity = '0.5';
            setTimeout(() => {
                card.style.opacity = '1';
            }, 300);
        });
        
        // Filter logic for existing cards
        if (typeValue !== 'all') {
            promotionCards.forEach(card => {
                const cardTag = card.querySelector('.card-tag');
                const cardType = cardTag ? cardTag.className.replace('card-tag', '').trim() : '';
                
                if (cardType && !cardType.includes(typeValue)) {
                    card.style.display = 'none';
                } else {
                    card.style.display = 'flex';
                }
            });
        } else {
            // Show all cards if filter is 'all'
            promotionCards.forEach(card => {
                card.style.display = 'flex';
            });
        }
        
        // Create filter summary
        const filterSummary = `กรอง: ${getFilterText(typeFilter, typeValue)} | ${getFilterText(destinationFilter, destinationValue)} | ${getFilterText(sortFilter, sortValue)}`;
        console.log(filterSummary);
    }
    
    /**
     * Get filter text for display
     */
    function getFilterText(filter, value) {
        if (!filter) return 'ทั้งหมด';
        
        const selectedOption = filter.querySelector(`option[value="${value}"]`);
        return selectedOption ? selectedOption.textContent : 'ทั้งหมด';
    }
    
    /**
     * Setup pagination
     */
    function setupPagination() {
        const pageLinks = document.querySelectorAll('.page-link');
        
        pageLinks.forEach(link => {
            if (!link.classList.contains('active') && !link.classList.contains('next')) {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Remove active class from all links
                    pageLinks.forEach(l => l.classList.remove('active'));
                    
                    // Add active class to clicked link
                    this.classList.add('active');
                    
                    // Scroll to top of promotion list
                    document.querySelector('.promotion-list').scrollIntoView({ behavior: 'smooth' });
                    
                    // Show loading effect
                    const promotionsGrid = document.querySelector('.promotions-grid');
                    if (promotionsGrid) {
                        promotionsGrid.style.opacity = '0.5';
                        setTimeout(() => {
                            promotionsGrid.style.opacity = '1';
                        }, 500);
                    }
                });
            } else if (link.classList.contains('next')) {
                // Setup next button
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Find active link
                    const activeLink = document.querySelector('.page-link.active');
                    if (activeLink && activeLink.nextElementSibling) {
                        // Click next link
                        activeLink.nextElementSibling.click();
                    }
                });
            }
        });
    }
    
    /**
     * Setup newsletter form
     */
    function setupNewsletterForm() {
        const newsletterForm = document.querySelector('.newsletter-form.special-form');
        
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const email = this.querySelector('input[type="email"]').value;
                
                if (!email) {
                    alert('กรุณากรอกอีเมล');
                    return;
                }
                
                // In the future, when the API endpoint for newsletter subscription is available
                // await apiService.subscribeToNewsletter(email);
                
                // Show success message
                alert('ขอบคุณสำหรับการลงทะเบียน! เราจะส่งข้อเสนอพิเศษให้คุณเร็ว ๆ นี้');
                
                // Reset form
                this.reset();
            });
        }
    }
    
    /**
     * Setup event listeners for detail links
     */
    function setupDetailLinks() {
        const detailLinks = document.querySelectorAll('.btn-outline.btn-sm');
        
        detailLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Get promotion name from card
                const card = this.closest('.promotion-card');
                const promoName = card.querySelector('h3').textContent;
                
                // Create and display details modal
                showPromoDetailsModal(promoName);
            });
        });
    }
    
    /**
     * Create and display promotion details modal
     */
    function showPromoDetailsModal(promoName) {
        // Create elements for modal
        const modal = document.createElement('div');
        modal.className = 'modal promo-details-modal';
        modal.style.display = 'block';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        
        const closeSpan = document.createElement('span');
        closeSpan.className = 'close';
        closeSpan.innerHTML = '&times;';
        
        const title = document.createElement('h2');
        title.textContent = promoName;
        
        const details = document.createElement('div');
        details.className = 'promo-full-details';
        details.innerHTML = `
            <p>รายละเอียดเพิ่มเติมเกี่ยวกับโปรโมชั่น "${promoName}"</p>
            <h3>เงื่อนไขและข้อกำหนด</h3>
            <ul>
                <li>ใช้ได้กับเที่ยวบินที่เข้าร่วมรายการเท่านั้น</li>
                <li>ราคาอาจมีการเปลี่ยนแปลงตามความพร้อมของที่นั่ง</li>
                <li>ไม่สามารถใช้ร่วมกับโปรโมชั่นอื่นได้</li>
                <li>ไม่สามารถโอนหรือแลกเปลี่ยนเป็นเงินสดได้</li>
                <li>บริษัทขอสงวนสิทธิ์ในการเปลี่ยนแปลงเงื่อนไขโดยไม่แจ้งให้ทราบล่วงหน้า</li>
            </ul>
            <h3>วิธีการใช้รหัสโปรโมชั่น</h3>
            <ol>
                <li>เลือกเที่ยวบินที่ต้องการ</li>
                <li>กรอกข้อมูลผู้โดยสาร</li>
                <li>ใส่รหัสโปรโมชั่นในช่องรหัสส่วนลด</li>
                <li>ดำเนินการจองและชำระเงิน</li>
            </ol>
        `;
        
        const bookBtn = document.createElement('a');
        bookBtn.href = 'index.html';
        bookBtn.className = 'btn btn-primary';
        bookBtn.textContent = 'จองตั๋วทันที';
        
        // Assemble modal
        modalContent.appendChild(closeSpan);
        modalContent.appendChild(title);
        modalContent.appendChild(details);
        modalContent.appendChild(bookBtn);
        modal.appendChild(modalContent);
        
        // Add to document
        document.body.appendChild(modal);
        
        // Close modal
        closeSpan.addEventListener('click', function() {
            document.body.removeChild(modal);
        });
        
        // Close when clicking background
        window.addEventListener('click', function(e) {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
        
        // Add styles for modal
        const style = document.createElement('style');
        style.textContent = `
            .promo-details-modal .modal-content {
                max-width: 600px;
            }
            
            .promo-full-details {
                margin: 2rem 0;
            }
            
            .promo-full-details h3 {
                margin-top: 1.5rem;
                margin-bottom: 1rem;
                color: var(--primary-color);
            }
            
            .promo-full-details ul, .promo-full-details ol {
                padding-left: 1.5rem;
                margin-bottom: 1.5rem;
            }
            
            .promo-full-details li {
                margin-bottom: 0.5rem;
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Setup login/register modals
     */
    function setupAuthModals() {
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const loginModal = document.getElementById('login-modal');
        const registerModal = document.getElementById('register-modal');
        const closeBtns = document.querySelectorAll('.close');
        const switchToRegister = document.getElementById('switch-to-register');
        const switchToLogin = document.getElementById('switch-to-login');
        
        // Open login modal
        if (loginBtn && loginModal) {
            loginBtn.addEventListener('click', function(e) {
                e.preventDefault();
                loginModal.style.display = 'block';
            });
        }
        
        // Open register modal
        if (registerBtn && registerModal) {
            registerBtn.addEventListener('click', function(e) {
                e.preventDefault();
                registerModal.style.display = 'block';
            });
        }
        
        // Close modals
        closeBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                if (loginModal) loginModal.style.display = 'none';
                if (registerModal) registerModal.style.display = 'none';
            });
        });
        
        // Switch between login and register
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
        
        // Close modal when clicking background
        window.addEventListener('click', function(e) {
            if (e.target === loginModal) {
                loginModal.style.display = 'none';
            }
            if (e.target === registerModal) {
                registerModal.style.display = 'none';
            }
        });
        
        // Handle login form submission
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
                    // Show loading state
                    const submitBtn = loginForm.querySelector('button[type="submit"]');
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังเข้าสู่ระบบ...';
                    
                    // Call API
                    const response = await apiService.login(email, password);
                    
                    // Save token
                    apiService.setToken(response.token);
                    
                    // Save user data
                    localStorage.setItem('userData', JSON.stringify(response.user));
                    
                    // Reload page to use new user data
                    window.location.reload();
                } catch (error) {
                    console.error('Login error:', error);
                    alert('เข้าสู่ระบบไม่สำเร็จ: ' + (error.message || 'กรุณาตรวจสอบอีเมลและรหัสผ่าน'));
                    
                    // Reset button state
                    const submitBtn = loginForm.querySelector('button[type="submit"]');
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'เข้าสู่ระบบ';
                }
            });
        }
        
        // Handle register form submission
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
                
                // Validate input
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
                    // Show loading state
                    const submitBtn = registerForm.querySelector('button[type="submit"]');
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังสมัครสมาชิก...';
                    
                    // Call API
                    const userData = {
                        firstName,
                        lastName,
                        email,
                        phone,
                        password
                    };
                    
                    await apiService.register(userData);
                    
                    // Show success message
                    alert('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
                    
                    // Close register modal and open login modal
                    registerModal.style.display = 'none';
                    loginModal.style.display = 'block';
                    
                    // Reset form
                    registerForm.reset();
                } catch (error) {
                    console.error('Registration error:', error);
                    alert('สมัครสมาชิกไม่สำเร็จ: ' + (error.message || 'กรุณาลองใหม่อีกครั้ง'));
                    
                    // Reset button state
                    const submitBtn = registerForm.querySelector('button[type="submit"]');
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'สมัครสมาชิก';
                }
            });
        }
    }
    
    /**
     * Show error message
     */
    function showErrorMessage(message) {
        // Remove existing error
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Create new error message
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        
        // Add styles
        errorElement.style.backgroundColor = '#f8d7da';
        errorElement.style.color = '#721c24';
        errorElement.style.padding = '1rem';
        errorElement.style.borderRadius = '4px';
        errorElement.style.margin = '1rem 0';
        errorElement.style.textAlign = 'center';
        
        // Add to page
        const container = document.querySelector('.container');
        if (container) {
            container.insertBefore(errorElement, container.firstChild);
        }
    }
});