document.addEventListener('DOMContentLoaded', function() {
    // Email Boarding Pass Button
    const emailBtn = document.getElementById('email-btn');
    
    if (emailBtn) {
        emailBtn.addEventListener('click', function() {
            // In a real application, this would send an API request to your backend
            // Here, we're just simulating with a confirmation alert
            
            // Show sending state
            emailBtn.disabled = true;
            emailBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังส่ง...';
            
            // Simulate API call delay
            setTimeout(() => {
                // Reset button state
                emailBtn.disabled = false;
                emailBtn.innerHTML = '<i class="fas fa-envelope"></i> ส่งอีเมล';
                
                // Show success message
                alert('ส่งบัตรโดยสารไปยังอีเมล user@example.com เรียบร้อยแล้ว กรุณาตรวจสอบกล่องข้อความของคุณ');
            }, 2000);
        });
    }
    
    // Create countdown to flight
    const departureDate = new Date('March 19, 2025 08:30:00').getTime();
    
    // Check if we need to add a countdown (only on confirmation page)
    if (document.querySelector('.confirmation-message')) {
        // Create countdown element
        const countdownEl = document.createElement('div');
        countdownEl.className = 'countdown';
        document.querySelector('.confirmation-message .container').appendChild(countdownEl);
        
        // Update countdown every second
        const countdownInterval = setInterval(updateCountdown, 1000);
        updateCountdown(); // Initial call
        
        function updateCountdown() {
            const now = new Date().getTime();
            const distance = departureDate - now;
            
            // If departure date has passed
            if (distance < 0) {
                clearInterval(countdownInterval);
                countdownEl.innerHTML = '<div class="countdown-expired">เที่ยวบินของคุณได้ออกเดินทางแล้ว</div>';
                return;
            }
            
            // Calculate days, hours, minutes, seconds
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            // Update countdown display
            countdownEl.innerHTML = `
                <div class="countdown-title">เวลาที่เหลือก่อนเที่ยวบิน</div>
                <div class="countdown-timer">
                    <div class="countdown-unit">
                        <div class="countdown-value">${days}</div>
                        <div class="countdown-label">วัน</div>
                    </div>
                    <div class="countdown-unit">
                        <div class="countdown-value">${hours}</div>
                        <div class="countdown-label">ชั่วโมง</div>
                    </div>
                    <div class="countdown-unit">
                        <div class="countdown-value">${minutes}</div>
                        <div class="countdown-label">นาที</div>
                    </div>
                    <div class="countdown-unit">
                        <div class="countdown-value">${seconds}</div>
                        <div class="countdown-label">วินาที</div>
                    </div>
                </div>
            `;
        }
        
        // Add countdown styles
        const countdownStyles = document.createElement('style');
        countdownStyles.textContent = `
            .countdown {
                margin-top: 2rem;
                animation: fadeIn 1s ease-in-out;
            }
            
            .countdown-title {
                font-size: 1.2rem;
                margin-bottom: 1rem;
            }
            
            .countdown-timer {
                display: flex;
                justify-content: center;
                gap: 1rem;
            }
            
            .countdown-unit {
                background-color: rgba(255, 255, 255, 0.2);
                padding: 0.8rem;
                border-radius: 8px;
                min-width: 80px;
            }
            
            .countdown-value {
                font-size: 2rem;
                font-weight: 700;
            }
            
            .countdown-label {
                font-size: 0.9rem;
                opacity: 0.8;
            }
            
            .countdown-expired {
                font-size: 1.2rem;
                padding: 1rem;
                background-color: rgba(255, 255, 255, 0.2);
                border-radius: 8px;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            @media screen and (max-width: 480px) {
                .countdown-timer {
                    flex-wrap: wrap;
                }
                
                .countdown-unit {
                    min-width: 60px;
                }
            }
        `;
        document.head.appendChild(countdownStyles);
    }
    
    // Add service to calendar option
    const addToCalendarBtn = document.createElement('button');
    addToCalendarBtn.className = 'btn btn-outline';
    addToCalendarBtn.innerHTML = '<i class="fas fa-calendar-plus"></i> เพิ่มลงในปฏิทิน';
    
    // Add button to booking actions
    const bookingActions = document.querySelector('.booking-actions');
    if (bookingActions) {
        bookingActions.prepend(addToCalendarBtn);
        
        // Add click handler
        addToCalendarBtn.addEventListener('click', function() {
            // Create dropdown menu for calendar options
            const dropdown = document.createElement('div');
            dropdown.className = 'calendar-dropdown';
            dropdown.innerHTML = `
                <a href="#" data-calendar="google">Google Calendar</a>
                <a href="#" data-calendar="apple">Apple Calendar</a>
                <a href="#" data-calendar="outlook">Outlook</a>
            `;
            
            // Position the dropdown
            const rect = addToCalendarBtn.getBoundingClientRect();
            dropdown.style.position = 'absolute';
            dropdown.style.top = (rect.bottom + window.scrollY) + 'px';
            dropdown.style.left = (rect.left + window.scrollX) + 'px';
            dropdown.style.zIndex = '1000';
            dropdown.style.backgroundColor = 'white';
            dropdown.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
            dropdown.style.borderRadius = '4px';
            dropdown.style.padding = '0.5rem 0';
            
            // Style the links
            const links = dropdown.querySelectorAll('a');
            links.forEach(link => {
                link.style.display = 'block';
                link.style.padding = '0.5rem 1rem';
                link.style.color = '#333';
                link.style.textDecoration = 'none';
                
                // Add hover effect
                link.addEventListener('mouseover', () => {
                    link.style.backgroundColor = '#f5f5f5';
                });
                link.addEventListener('mouseout', () => {
                    link.style.backgroundColor = 'transparent';
                });
                
                // Add click handler for each calendar option
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const calendarType = link.getAttribute('data-calendar');
                    
                    // In a real app, this would generate the correct calendar link
                    // For this demo, we'll just show an alert
                    alert(`เพิ่มเที่ยวบิน TG123 ลงใน ${calendarType} เรียบร้อยแล้ว!`);
                    
                    // Remove dropdown
                    document.body.removeChild(dropdown);
                });
            });
            
            // Add to document
            document.body.appendChild(dropdown);
            
            // Close dropdown when clicking outside
            const closeDropdown = (e) => {
                if (!dropdown.contains(e.target) && e.target !== addToCalendarBtn) {
                    document.body.removeChild(dropdown);
                    document.removeEventListener('click', closeDropdown);
                }
            };
            
            // Use setTimeout to avoid immediate trigger
            setTimeout(() => {
                document.addEventListener('click', closeDropdown);
            }, 0);
        });
    }
});