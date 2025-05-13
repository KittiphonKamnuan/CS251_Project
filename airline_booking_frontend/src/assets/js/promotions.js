import { apiService } from './api-service.js';

document.addEventListener('DOMContentLoaded', function() {
    // ดึงข้อมูลโปรโมชันทั้งหมด
    fetchPromotions();
    
    // ตั้งค่าปุ่มก๊อปปี้รหัสโปรโมชัน
    setupCopyButtons();
    
    // ตั้งค่าการกรองโปรโมชัน
    setupFilters();
    
    // ตั้งค่าการกดปุ่มเลือกหน้า
    setupPagination();
    
    // ตั้งค่าแบบฟอร์มรับข่าวสาร
    setupNewsletterForm();
    
    // เพิ่ม event listeners สำหรับปุ่มรายละเอียด
    setupDetailLinks();
    
    // ตั้งค่าโมดัล login/register
    setupAuthModals();
    
    /**
     * ดึงข้อมูลโปรโมชันทั้งหมดจาก API
     */
    async function fetchPromotions() {
        try {
            // ในอนาคตเมื่อมี API สำหรับโปรโมชัน
            // สามารถเรียกใช้ได้โดย: const promotions = await apiService.getPromotions();
            
            // สำหรับตอนนี้ใช้ข้อมูลจำลอง
            // จะไม่มีการแสดง loading state เพราะใช้ข้อมูลที่มีอยู่แล้วในหน้า
        } catch (error) {
            console.error('Error fetching promotions:', error);
            showErrorMessage('ไม่สามารถโหลดข้อมูลโปรโมชันได้ในขณะนี้ กรุณาลองใหม่อีกครั้งภายหลัง');
        }
    }
    
    /**
     * ตั้งค่าปุ่มก๊อปปี้รหัสโปรโมชัน
     */
    function setupCopyButtons() {
        const copyButtons = document.querySelectorAll('.btn-copy');
        
        copyButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const code = this.getAttribute('data-code');
                
                // สร้าง input element ชั่วคราว
                const tempInput = document.createElement('input');
                tempInput.value = code;
                document.body.appendChild(tempInput);
                
                // เลือกและคัดลอก
                tempInput.select();
                document.execCommand('copy');
                
                // ลบ element ชั่วคราว
                document.body.removeChild(tempInput);
                
                // แสดงการตอบสนอง
                const originalHTML = this.innerHTML;
                this.innerHTML = '<i class="fas fa-check"></i>';
                this.style.color = 'var(--success)';
                
                // รีเซ็ตหลังจาก 2 วินาที
                setTimeout(() => {
                    this.innerHTML = originalHTML;
                    this.style.color = '';
                }, 2000);
                
                // แสดงข้อความ
                alert(`รหัสโปรโมชั่น ${code} ถูกคัดลอกแล้ว`);
            });
        });
    }
    
    /**
     * ตั้งค่าการกรองโปรโมชัน
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
     * นำการกรองมาใช้
     */
    function applyFilters() {
        const typeFilter = document.getElementById('promotion-type');
        const destinationFilter = document.getElementById('promotion-destination');
        const sortFilter = document.getElementById('promotion-sort');
        
        const typeValue = typeFilter?.value || 'all';
        const destinationValue = destinationFilter?.value || 'all';
        const sortValue = sortFilter?.value || 'latest';
        
        // ในอนาคตเมื่อมี API สำหรับโปรโมชัน
        // สามารถเรียกใช้ได้โดย: const promotions = await apiService.getPromotions(typeValue, destinationValue, sortValue);
        
        // สำหรับตอนนี้แสดงการจำลองการกรอง
        const promotionCards = document.querySelectorAll('.promotion-card');
        
        // แสดง loading effect
        promotionCards.forEach(card => {
            card.style.opacity = '0.5';
            setTimeout(() => {
                card.style.opacity = '1';
            }, 300);
        });
        
        // สร้างข้อความสรุปการกรอง
        const filterSummary = `กรอง: ${getFilterText(typeFilter, typeValue)} | ${getFilterText(destinationFilter, destinationValue)} | ${getFilterText(sortFilter, sortValue)}`;
        console.log(filterSummary);
    }
    
    /**
     * ดึงข้อความของตัวกรอง
     */
    function getFilterText(filter, value) {
        if (!filter) return 'ทั้งหมด';
        
        const selectedOption = filter.querySelector(`option[value="${value}"]`);
        return selectedOption ? selectedOption.textContent : 'ทั้งหมด';
    }
    
    /**
     * ตั้งค่าการกดปุ่มเลือกหน้า
     */
    function setupPagination() {
        const pageLinks = document.querySelectorAll('.page-link');
        
        pageLinks.forEach(link => {
            if (!link.classList.contains('active') && !link.classList.contains('next')) {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // ลบ class active จากทุกลิงก์
                    pageLinks.forEach(l => l.classList.remove('active'));
                    
                    // เพิ่ม class active ให้กับลิงก์ที่คลิก
                    this.classList.add('active');
                    
                    // เลื่อนไปยังด้านบนของรายการโปรโมชัน
                    document.querySelector('.promotion-list').scrollIntoView({ behavior: 'smooth' });
                    
                    // แสดง loading effect
                    const promotionsGrid = document.querySelector('.promotions-grid');
                    if (promotionsGrid) {
                        promotionsGrid.style.opacity = '0.5';
                        setTimeout(() => {
                            promotionsGrid.style.opacity = '1';
                        }, 500);
                    }
                });
            } else if (link.classList.contains('next')) {
                // ตั้งค่าปุ่ม next
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // หาลิงก์ที่ active อยู่
                    const activeLink = document.querySelector('.page-link.active');
                    if (activeLink && activeLink.nextElementSibling) {
                        // คลิกลิงก์ถัดไป
                        activeLink.nextElementSibling.click();
                    }
                });
            }
        });
    }
    
    /**
     * ตั้งค่าแบบฟอร์มรับข่าวสาร
     */
    function setupNewsletterForm() {
        const newsletterForm = document.querySelector('.newsletter-form.special-form');
        
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const email = this.querySelector('input[type="email"]').value;
                
                if (!email) {
                    alert('กรุณากรอกอีเมล');
                    return;
                }
                
                // ในอนาคตเมื่อมี API สำหรับการสมัครรับข่าวสาร
                // สามารถเรียกใช้ได้โดย: await apiService.subscribeNewsletter(email);
                
                // แสดงข้อความสำเร็จ
                alert('ขอบคุณสำหรับการลงทะเบียน! เราจะส่งข้อเสนอพิเศษให้คุณเร็ว ๆ นี้');
                
                // รีเซ็ตฟอร์ม
                this.reset();
            });
        }
    }
    
    /**
     * ตั้งค่า event listeners สำหรับปุ่มรายละเอียด
     */
    function setupDetailLinks() {
        const detailLinks = document.querySelectorAll('.btn-outline.btn-sm');
        
        detailLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // ดึงชื่อโปรโมชันจากการ์ด
                const card = this.closest('.promotion-card');
                const promoName = card.querySelector('h3').textContent;
                
                // สร้างและแสดงโมดัลรายละเอียด
                showPromoDetailsModal(promoName);
            });
        });
    }
    
    /**
     * สร้างและแสดงโมดัลรายละเอียดโปรโมชัน
     */
    function showPromoDetailsModal(promoName) {
        // สร้าง elements สำหรับโมดัล
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
        
        // ประกอบโมดัล
        modalContent.appendChild(closeSpan);
        modalContent.appendChild(title);
        modalContent.appendChild(details);
        modalContent.appendChild(bookBtn);
        modal.appendChild(modalContent);
        
        // เพิ่มลงใน document
        document.body.appendChild(modal);
        
        // ปิดโมดัล
        closeSpan.addEventListener('click', function() {
            document.body.removeChild(modal);
        });
        
        // ปิดเมื่อคลิกพื้นหลัง
        window.addEventListener('click', function(e) {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
        
        // เพิ่มสไตล์สำหรับโมดัล
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
     * ตั้งค่าโมดัล login/register
     */
    function setupAuthModals() {
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const loginModal = document.getElementById('login-modal');
        const registerModal = document.getElementById('register-modal');
        const closeBtns = document.querySelectorAll('.close');
        const switchToRegister = document.getElementById('switch-to-register');
        const switchToLogin = document.getElementById('switch-to-login');
        
        // เปิดโมดัล login
        if (loginBtn && loginModal) {
            loginBtn.addEventListener('click', function(e) {
                e.preventDefault();
                loginModal.style.display = 'block';
            });
        }
        
        // เปิดโมดัล register
        if (registerBtn && registerModal) {
            registerBtn.addEventListener('click', function(e) {
                e.preventDefault();
                registerModal.style.display = 'block';
            });
        }
        
        // ปิดโมดัล
        closeBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                if (loginModal) loginModal.style.display = 'none';
                if (registerModal) registerModal.style.display = 'none';
            });
        });
        
        // สลับระหว่างโมดัล
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
        
        // ปิดโมดัลเมื่อคลิกพื้นหลัง
        window.addEventListener('click', function(e) {
            if (e.target === loginModal) {
                loginModal.style.display = 'none';
            }
            if (e.target === registerModal) {
                registerModal.style.display = 'none';
            }
        });
    }
    
    /**
     * แสดงข้อความผิดพลาด
     */
    function showErrorMessage(message) {
        // ลบข้อความผิดพลาดเดิม
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // สร้างข้อความผิดพลาดใหม่
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        
        // เพิ่มสไตล์
        errorElement.style.backgroundColor = '#f8d7da';
        errorElement.style.color = '#721c24';
        errorElement.style.padding = '1rem';
        errorElement.style.borderRadius = '4px';
        errorElement.style.margin = '1rem 0';
        errorElement.style.textAlign = 'center';
        
        // เพิ่มลงในหน้า
        const container = document.querySelector('.container');
        if (container) {
            container.insertBefore(errorElement, container.firstChild);
        }
    }
});