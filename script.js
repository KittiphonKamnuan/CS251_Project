document.addEventListener('DOMContentLoaded', function() {
    // Navigation Mobile Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            
            // Change hamburger to X
            const spans = hamburger.querySelectorAll('span');
            spans[0].classList.toggle('rotateDown');
            spans[1].classList.toggle('fadeOut');
            spans[2].classList.toggle('rotateUp');
        });
    }
    
    // Tab Switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    const returnDateField = document.querySelector('.return-date');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            tabBtns.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Show/hide return date field based on tab
            if (this.dataset.tab === 'round-trip') {
                returnDateField.style.display = 'flex';
            } else {
                returnDateField.style.display = 'none';
            }
        });
    });
    
    // Modal Functionality
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const closeBtns = document.querySelectorAll('.close');
    const switchToRegister = document.getElementById('switch-to-register');
    const switchToLogin = document.getElementById('switch-to-login');
    
    // Open login modal
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            loginModal.style.display = 'block';
        });
    }
    
    // Open register modal
    if (registerBtn) {
        registerBtn.addEventListener('click', function(e) {
            e.preventDefault();
            registerModal.style.display = 'block';
        });
    }
    
    // Close modals
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            loginModal.style.display = 'none';
            registerModal.style.display = 'none';
        });
    });
    
    // Switch between login and register modals
    if (switchToRegister) {
        switchToRegister.addEventListener('click', function(e) {
            e.preventDefault();
            loginModal.style.display = 'none';
            registerModal.style.display = 'block';
        });
    }
    
    if (switchToLogin) {
        switchToLogin.addEventListener('click', function(e) {
            e.preventDefault();
            registerModal.style.display = 'none';
            loginModal.style.display = 'block';
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === loginModal) {
            loginModal.style.display = 'none';
        }
        if (e.target === registerModal) {
            registerModal.style.display = 'none';
        }
    });
    
    // Form validation
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            // Basic validation
            if (!email || !password) {
                alert('กรุณากรอกข้อมูลให้ครบถ้วน');
                return;
            }
            
            // Here you would normally send the data to your backend
            console.log('Login attempt:', { email, password });
            
            // Simulate successful login
            alert('เข้าสู่ระบบสำเร็จ!');
            loginModal.style.display = 'none';
            
            // Update UI to show logged in state
            document.querySelector('.user-actions').innerHTML = `
                <div class="user-welcome">ยินดีต้อนรับ, ${email.split('@')[0]}</div>
                <a href="#" class="btn btn-outline" id="logoutBtn">ออกจากระบบ</a>
            `;
            
            // Add logout functionality
            document.getElementById('logoutBtn').addEventListener('click', function(e) {
                e.preventDefault();
                // Reset UI
                document.querySelector('.user-actions').innerHTML = `
                    <a href="#" class="btn btn-outline" id="loginBtn">เข้าสู่ระบบ</a>
                    <a href="#" class="btn btn-primary" id="registerBtn">สมัครสมาชิก</a>
                `;
                // Reattach event listeners
                document.getElementById('loginBtn').addEventListener('click', function(e) {
                    e.preventDefault();
                    loginModal.style.display = 'block';
                });
                document.getElementById('registerBtn').addEventListener('click', function(e) {
                    e.preventDefault();
                    registerModal.style.display = 'block';
                });
            });
        });
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const firstName = document.getElementById('first-name').value;
            const lastName = document.getElementById('last-name').value;
            const email = document.getElementById('register-email').value;
            const phone = document.getElementById('phone').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const terms = document.getElementById('terms').checked;
            
            // Basic validation
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
            
            // Here you would normally send the data to your backend
            console.log('Registration:', { firstName, lastName, email, phone, password });
            
            // Simulate successful registration
            alert('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
            registerModal.style.display = 'none';
            loginModal.style.display = 'block';
        });
    }
    
    // Flight Search Form
    const flightSearchForm = document.getElementById('flight-search-form');
    const flightResults = document.getElementById('flight-results');
    const resultsContainer = document.querySelector('.results-container');
    
    if (flightSearchForm) {
        flightSearchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const departure = document.getElementById('departure').value;
            const arrival = document.getElementById('arrival').value;
            const departureDate = document.getElementById('departure-date').value;
            const returnDate = document.getElementById('return-date')?.value;
            const passengers = document.getElementById('passengers').value;
            const seatClass = document.getElementById('seat-class').value;
            
            // Basic validation
            if (!departure || !arrival || !departureDate) {
                alert('กรุณากรอกข้อมูลต้นทาง ปลายทาง และวันที่เดินทาง');
                return;
            }
            
            // Show loading state
            flightResults.style.display = 'block';
            resultsContainer.innerHTML = '<div class="loading">กำลังค้นหาเที่ยวบิน...</div>';
            
            // Scroll to results
            flightResults.scrollIntoView({ behavior: 'smooth' });
            
            // Simulate API call with setTimeout
            setTimeout(() => {
                // Sample flight data
                const flights = [
                    {
                        airline: 'Thai Airways',
                        flightNumber: 'TG123',
                        departureTime: '08:30',
                        arrivalTime: '10:00',
                        duration: '1h 30m',
                        price: 1590,
                        departureAirport: 'BKK',
                        arrivalAirport: 'CNX'
                    },
                    {
                        airline: 'Bangkok Airways',
                        flightNumber: 'PG234',
                        departureTime: '10:45',
                        arrivalTime: '12:10',
                        duration: '1h 25m',
                        price: 1890,
                        departureAirport: 'BKK',
                        arrivalAirport: 'CNX'
                    },
                    {
                        airline: 'AirAsia',
                        flightNumber: 'FD567',
                        departureTime: '13:20',
                        arrivalTime: '14:40',
                        duration: '1h 20m',
                        price: 1290,
                        departureAirport: 'BKK',
                        arrivalAirport: 'CNX'
                    },
                    {
                        airline: 'Nok Air',
                        flightNumber: 'DD789',
                        departureTime: '16:45',
                        arrivalTime: '18:10',
                        duration: '1h 25m',
                        price: 1350,
                        departureAirport: 'BKK',
                        arrivalAirport: 'CNX'
                    }
                ];
                
                // Generate flight cards
                let flightCardsHTML = '';
                flights.forEach(flight => {
                    flightCardsHTML += `
                        <div class="flight-card">
                            <div class="flight-info">
                                <div class="flight-header">
                                    <img src="https://via.placeholder.com/40" alt="${flight.airline}" class="airline-logo">
                                    <div>
                                        <div class="airline-name">${flight.airline}</div>
                                        <div class="flight-number">${flight.flightNumber}</div>
                                    </div>
                                </div>
                                <div class="flight-times">
                                    <div class="departure">
                                        <div class="time">${flight.departureTime}</div>
                                        <div class="airport">${flight.departureAirport}</div>
                                    </div>
                                    <div class="flight-duration">
                                        <div class="flight-path"></div>
                                        <div class="duration">${flight.duration}</div>
                                    </div>
                                    <div class="arrival">
                                        <div class="time">${flight.arrivalTime}</div>
                                        <div class="airport">${flight.arrivalAirport}</div>
                                    </div>
                                </div>
                            </div>
                            <div class="flight-price">
                                <div>
                                    <div class="price">฿${flight.price}</div>
                                    <div class="price-info">ต่อท่าน รวมภาษี</div>
                                </div>
                                <a href="flight-details.html" class="btn btn-primary book-btn">เลือกเที่ยวบิน</a>
                            </div>
                        </div>
                    `;
                });
                
                // Update results container
                resultsContainer.innerHTML = flightCardsHTML;
                
                // Add event listeners to book buttons
                document.querySelectorAll('.book-btn').forEach(btn => {
                    btn.addEventListener('click', function(e) {
                        // Check if user is logged in
                        const userWelcome = document.querySelector('.user-welcome');
                        
                        if (!userWelcome) {
                            e.preventDefault();
                            alert('กรุณาเข้าสู่ระบบก่อนทำการจอง');
                            loginModal.style.display = 'block';
                        }
                    });
                });
            }, 1500); // Simulate loading time
        });
    }
    
    // Filter buttons functionality
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterBtns.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Here would be code to filter results
            // This is just a UI demo so no actual filtering is implemented
        });
    });
    
    // Set minimum date for departure and return date inputs
    const today = new Date().toISOString().split('T')[0];
    
    if (document.getElementById('departure-date')) {
        document.getElementById('departure-date').min = today;
    }
    
    if (document.getElementById('return-date')) {
        document.getElementById('return-date').min = today;
    }
    
    // Update return date min value when departure date changes
    if (document.getElementById('departure-date') && document.getElementById('return-date')) {
        document.getElementById('departure-date').addEventListener('change', function() {
            document.getElementById('return-date').min = this.value;
            
            // If return date is less than departure date, update it
            if (document.getElementById('return-date').value < this.value) {
                document.getElementById('return-date').value = this.value;
            }
        });
    }
    
    // Newsletter form
    const newsletterForm = document.querySelector('.newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            
            if (!email) {
                alert('กรุณากรอกอีเมล');
                return;
            }
            
            // Here would be code to submit to backend
            console.log('Newsletter signup:', email);
            
            alert('ขอบคุณสำหรับการลงทะเบียน! เราจะส่งข้อเสนอพิเศษให้คุณเร็ว ๆ นี้');
            this.reset();
        });
    }
    
    // Reviews slider functionality
    const reviewsSlider = document.querySelector('.reviews-slider');
    const reviewCards = document.querySelectorAll('.review-card');
    const prevBtn = document.querySelector('.review-nav.prev');
    const nextBtn = document.querySelector('.review-nav.next');
    const dots = document.querySelectorAll('.dot');
    
    if (reviewsSlider && reviewCards.length > 0) {
        let currentIndex = 0;
        const cardWidth = reviewCards[0].offsetWidth + 32; // Card width + gap
        
        // Function to update slider position
        function updateSlider() {
            reviewsSlider.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
            
            // Update active dot
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });
        }
        
        // Add click handlers for navigation
        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                if (currentIndex > 0) {
                    currentIndex--;
                    updateSlider();
                }
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                if (currentIndex < reviewCards.length - 1) {
                    currentIndex++;
                    updateSlider();
                }
            });
        }
        
        // Add click handlers for dots
        dots.forEach((dot, index) => {
            dot.addEventListener('click', function() {
                currentIndex = index;
                updateSlider();
            });
        });
        
        // Initialize slider styles
        reviewsSlider.style.transition = 'transform 0.3s ease';
    }
    
    // Special offers functionality
    const offerCards = document.querySelectorAll('.offer-card .btn');
    
    offerCards.forEach(btn => {
        btn.addEventListener('click', function() {
            // Scroll to search form
            document.querySelector('.search-container').scrollIntoView({ behavior: 'smooth' });
            
            // If promo code is available, copy it to clipboard
            const offerCode = this.closest('.offer-content').querySelector('.offer-code strong');
            if (offerCode) {
                // Create a temporary input element
                const tempInput = document.createElement('input');
                tempInput.value = offerCode.textContent;
                document.body.appendChild(tempInput);
                
                // Select and copy the text
                tempInput.select();
                document.execCommand('copy');
                
                // Remove the temporary element
                document.body.removeChild(tempInput);
                
                // Show notification
                alert(`รหัสโปรโมชั่น ${offerCode.textContent} ถูกคัดลอกแล้ว`);
            }
        });
    });
    
    // Flight status update functionality
    const statusCells = document.querySelectorAll('.status');
    
    // Simulate real-time updates for flight statuses
    if (statusCells.length > 0) {
        setInterval(() => {
            // Randomly select a status cell to update
            const randomIndex = Math.floor(Math.random() * statusCells.length);
            const randomStatus = statusCells[randomIndex];
            
            // Simulate status changes
            const currentClass = randomStatus.classList[1];
            let newClass, newText;
            
            switch (currentClass) {
                case 'on-time':
                    if (Math.random() > 0.8) {
                        newClass = 'delayed';
                        newText = 'ล่าช้า';
                    }
                    break;
                case 'delayed':
                    if (Math.random() > 0.7) {
                        newClass = 'boarding';
                        newText = 'กำลังขึ้นเครื่อง';
                    }
                    break;
                case 'boarding':
                    if (Math.random() > 0.9) {
                        newClass = 'on-time';
                        newText = 'ตรงเวลา';
                    }
                    break;
            }
            
            // Apply updates if there's a change
            if (newClass && newText) {
                randomStatus.classList.remove(currentClass);
                randomStatus.classList.add(newClass);
                randomStatus.textContent = newText;
                
                // Highlight the change
                randomStatus.style.transition = 'none';
                randomStatus.style.transform = 'scale(1.1)';
                randomStatus.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
                
                setTimeout(() => {
                    randomStatus.style.transition = 'all 0.5s ease';
                    randomStatus.style.transform = 'scale(1)';
                    randomStatus.style.boxShadow = 'none';
                }, 100);
            }
        }, 10000); // Update every 10 seconds
    }
});