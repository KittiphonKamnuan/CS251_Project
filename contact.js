document.addEventListener('DOMContentLoaded', function() {
    // Contact Form Submission
    const contactForm = document.getElementById('contact-form');
    const confirmationModal = document.getElementById('confirmation-modal');
    const closeConfirmationBtn = document.getElementById('close-confirmation');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate form
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;
            const privacyPolicy = document.getElementById('privacy-policy').checked;
            
            // Basic validation
            if (!name || !email || !subject || !message || !privacyPolicy) {
                alert('กรุณากรอกข้อมูลให้ครบถ้วน');
                return;
            }
            
            // Email validation
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(email)) {
                alert('กรุณากรอกอีเมลให้ถูกต้อง');
                return;
            }
            
            // In a real application, you would send the form data to your backend here
            // For this demo, we'll just simulate a successful submission
            
            // Show loading state
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังส่ง...';
            
            // Simulate API call delay
            setTimeout(() => {
                // Reset form
                contactForm.reset();
                
                // Reset button state
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'ส่งข้อความ';
                
                // Show confirmation modal
                confirmationModal.style.display = 'block';
            }, 1500);
        });
    }
    
    // Close confirmation modal
    if (closeConfirmationBtn) {
        closeConfirmationBtn.addEventListener('click', function() {
            confirmationModal.style.display = 'none';
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === confirmationModal) {
            confirmationModal.style.display = 'none';
        }
    });
    
    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', function() {
            // Check if this item is already active
            const isActive = item.classList.contains('active');
            
            // Close all FAQ items
            faqItems.forEach(faq => {
                faq.classList.remove('active');
            });
            
            // If the clicked item wasn't active, open it
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
    
    // Open first FAQ item by default
    if (faqItems.length > 0) {
        faqItems[0].classList.add('active');
    }
    
    // Form field enhancements
    const inputs = document.querySelectorAll('.contact-form input, .contact-form textarea, .contact-form select');
    
    inputs.forEach(input => {
        // Add focus effect
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
            
            // Add filled class if the input has a value
            if (this.value) {
                this.parentElement.classList.add('filled');
            } else {
                this.parentElement.classList.remove('filled');
            }
        });
        
        // Check initial state (in case of browser auto-fill)
        if (input.value) {
            input.parentElement.classList.add('filled');
        }
    });
    
    // Add styles for focus and filled states
    const style = document.createElement('style');
    style.textContent = `
        .form-group.focused label {
            color: var(--primary-color);
        }
        
        .form-group.focused input,
        .form-group.focused select,
        .form-group.focused textarea {
            border-color: var(--primary-color);
            box-shadow: 0 0 0 2px var(--primary-light);
        }
        
        .form-group.filled label {
            color: var(--primary-color);
        }
    `;
    document.head.appendChild(style);
    
    // Subject field dependency
    const subjectField = document.getElementById('subject');
    const bookingRefField = document.getElementById('booking-ref');
    
    if (subjectField && bookingRefField) {
        subjectField.addEventListener('change', function() {
            const value = this.value;
            
            // Make booking reference required for certain subjects
            if (value === 'booking' || value === 'flight-status' || value === 'cancellation' || value === 'refund') {
                bookingRefField.setAttribute('required', 'required');
                bookingRefField.nextElementSibling.innerHTML = 'รหัสการจอง <span class="required">*</span>';
            } else {
                bookingRefField.removeAttribute('required');
                bookingRefField.nextElementSibling.textContent = 'รหัสการจอง (ถ้ามี)';
            }
        });
    }
});