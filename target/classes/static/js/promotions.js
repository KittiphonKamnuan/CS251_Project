document.addEventListener('DOMContentLoaded', function() {
    // Promotion Code Copy Functionality
    const copyButtons = document.querySelectorAll('.btn-copy');
    
    copyButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const code = this.getAttribute('data-code');
            
            // Create temp input element
            const tempInput = document.createElement('input');
            tempInput.value = code;
            document.body.appendChild(tempInput);
            
            // Select and copy
            tempInput.select();
            document.execCommand('copy');
            
            // Remove temp element
            document.body.removeChild(tempInput);
            
            // Show feedback
            const originalHTML = this.innerHTML;
            this.innerHTML = '<i class="fas fa-check"></i>';
            this.style.color = 'var(--success)';
            
            // Reset after 2 seconds
            setTimeout(() => {
                this.innerHTML = originalHTML;
                this.style.color = '';
            }, 2000);
            
            // Optional alert
            alert(`รหัสโปรโมชั่น ${code} ถูกคัดลอกแล้ว`);
        });
    });
    
    // Filter Functionality
    const typeFilter = document.getElementById('promotion-type');
    const destinationFilter = document.getElementById('promotion-destination');
    const sortFilter = document.getElementById('promotion-sort');
    const promotionCards = document.querySelectorAll('.promotion-card');
    
    function applyFilters() {
        const typeValue = typeFilter.value;
        const destinationValue = destinationFilter.value;
        const sortValue = sortFilter.value;
        
        // In a real application, you would send these values to the backend
        // and get filtered results. For this demo, we'll just log the values.
        console.log('Filters applied:', {
            type: typeValue,
            destination: destinationValue,
            sort: sortValue
        });
        
        // Simulate filter effect by adding a subtle animation
        promotionCards.forEach(card => {
            card.style.opacity = '0.5';
            setTimeout(() => {
                card.style.opacity = '1';
            }, 300);
        });
    }
    
    // Apply filters when any filter is changed
    if (typeFilter) typeFilter.addEventListener('change', applyFilters);
    if (destinationFilter) destinationFilter.addEventListener('change', applyFilters);
    if (sortFilter) sortFilter.addEventListener('change', applyFilters);
    
    // Pagination Functionality
    const pageLinks = document.querySelectorAll('.page-link');
    
    pageLinks.forEach(link => {
        if (!link.classList.contains('active')) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Remove active class from all links
                pageLinks.forEach(l => l.classList.remove('active'));
                
                // Add active class to clicked link
                this.classList.add('active');
                
                // Scroll to top of promotion list
                document.querySelector('.promotion-list').scrollIntoView({ behavior: 'smooth' });
                
                // Simulate page change with loading effect
                const promotionsGrid = document.querySelector('.promotions-grid');
                if (promotionsGrid) {
                    promotionsGrid.style.opacity = '0.5';
                    setTimeout(() => {
                        promotionsGrid.style.opacity = '1';
                    }, 500);
                }
            });
        }
    });
    
    // Newsletter Signup
    const newsletterForm = document.querySelector('.newsletter-form.special-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = this.querySelector('input[type="email"]').value;
            
            if (!email) {
                alert('กรุณากรอกอีเมล');
                return;
            }
            
            // Here you would normally send the data to your backend
            console.log('Newsletter signup:', email);
            
            // Show success message
            alert('ขอบคุณสำหรับการลงทะเบียน! เราจะส่งข้อเสนอพิเศษให้คุณเร็ว ๆ นี้');
            
            // Reset form
            this.reset();
        });
    }
    
    // Detail Links Functionality
    const detailLinks = document.querySelectorAll('.btn-outline.btn-sm');
    
    detailLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get promotion name from the card
            const card = this.closest('.promotion-card');
            const promoName = card.querySelector('h3').textContent;
            
            // Create and show modal with details
            showPromoDetailsModal(promoName);
        });
    });
    
    // Function to create and show promotion details modal
    function showPromoDetailsModal(promoName) {
        // Create modal elements
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
        
        // Close modal functionality
        closeSpan.addEventListener('click', function() {
            document.body.removeChild(modal);
        });
        
        // Close when clicking outside
        window.addEventListener('click', function(e) {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
        
        // Add modal styles
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
});