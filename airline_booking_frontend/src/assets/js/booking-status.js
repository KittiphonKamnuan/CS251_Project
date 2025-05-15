import { apiService } from './api-service.js';

document.addEventListener('DOMContentLoaded', function() {
    // Check login status and update UI accordingly
    checkLoginStatus();
    
    // Setup mobile menu
    setupMobileMenu();
    
    // Setup booking search form
    setupBookingSearchForm();
    
    // Setup sort dropdown
    setupSortDropdown();
    
    // Setup action buttons
    setupActionButtons();
    
    /**
     * Check login status and fetch user bookings if logged in
     */
    async function checkLoginStatus() {
        const userData = localStorage.getItem('userData');
        let userObj = null;
        
        if (userData) {
            try {
                userObj = JSON.parse(userData);
                
                // Update UI for logged-in user
                updateAuthUI(userObj);
                
                // Load user bookings
                await loadUserBookings(userObj.userId);
            } catch (error) {
                console.error('Error parsing user data:', error);
                // Clear invalid user data
                localStorage.removeItem('authToken');
                localStorage.removeItem('userData');
                
                // Show login required message
                showLoginRequiredMessage();
            }
        } else {
            // Show login required message
            showLoginRequiredMessage();
        }
    }
    
    /**
     * Update UI for authenticated user
     */
    function updateAuthUI(user) {
        const userActionsContainer = document.getElementById('userActionsContainer');
        const mobileUserActions = document.getElementById('mobileUserActions');
        
        // Update main navigation user actions
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
        
        // Update mobile menu user actions
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
     * Show message when user is not logged in
     */
    function showLoginRequiredMessage() {
        // Hide booking sections and show search form
        const upcomingBookings = document.getElementById('upcoming-bookings');
        const pastBookings = document.getElementById('past-bookings');
        
        if (upcomingBookings) upcomingBookings.style.display = 'none';
        if (pastBookings) pastBookings.style.display = 'none';
        
        // Show info message in search section
        const searchCard = document.querySelector('.search-card');
        if (searchCard) {
            const loginMessage = document.createElement('div');
            loginMessage.className = 'login-message';
            loginMessage.innerHTML = `
                <i class="fas fa-info-circle"></i>
                <div>
                    <h3>เข้าสู่ระบบเพื่อดูการจองของคุณโดยอัตโนมัติ</h3>
                    <p>หากคุณมีบัญชีผู้ใช้ <a href="login.html">เข้าสู่ระบบ</a> เพื่อดูประวัติการจองทั้งหมดของคุณโดยอัตโนมัติ หรือค้นหาการจองด้วยรหัสและนามสกุลของคุณด้านล่าง</p>
                </div>
            `;
            
            // Insert message before the search form
            const searchForm = searchCard.querySelector('.search-form');
            if (searchForm) {
                searchCard.insertBefore(loginMessage, searchForm);
            }
        }
    }
    
    /**
     * Setup booking search form
     */
    function setupBookingSearchForm() {
        const bookingSearchForm = document.getElementById('booking-search-form');
        
        if (bookingSearchForm) {
            bookingSearchForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const bookingReference = document.getElementById('booking-reference').value.trim();
                const lastName = document.getElementById('last-name').value.trim();
                
                if (!bookingReference || !lastName) {
                    alert('กรุณากรอกรหัสการจองและนามสกุลของคุณ');
                    return;
                }
                
                // Show loading state
                const submitBtn = this.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังค้นหา...';
                
                try {
                    // Call API to search booking
                    const booking = await apiService.getBookingById(bookingReference);
                    
                    // Check if booking exists and passenger's last name matches
                    const passengerFound = booking.passengers.some(
                        passenger => passenger.lastName.toLowerCase() === lastName.toLowerCase()
                    );
                    
                    if (passengerFound) {
                        // Display booking results
                        displayBookingResult(booking);
                    } else {
                        // No matching passenger found
                        showNoResults();
                    }
                } catch (error) {
                    console.error('Error fetching booking:', error);
                    showNoResults();
                } finally {
                    // Reset button state
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                }
            });
        }
    }
    JSON.parse(localStorage.getItem('userData'));

    /**
     * Load user bookings from API
     */
    async function loadUserBookings(userId) {
        console.log('loadUserBookings called with userId:', userId);
        try {
            // Show loading indicators
            const upcomingBookings = document.getElementById('upcoming-bookings');
            const pastBookings = document.getElementById('past-bookings');
            
            if (upcomingBookings) {
                upcomingBookings.querySelector('.booking-cards').innerHTML = `
                    <div class="loading-indicator">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>กำลังโหลดข้อมูลการจอง...</p>
                    </div>
                `;
            }
            
            if (pastBookings) {
                pastBookings.querySelector('.booking-cards').innerHTML = `
                    <div class="loading-indicator">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>กำลังโหลดข้อมูลการจอง...</p>
                    </div>
                `;
            }
            
            // Fetch bookings from API
            const bookings = await apiService.getUserBookings(userId);
            
            // Process bookings
            if (bookings && bookings.length > 0) {
                // Separate bookings into upcoming and past
                const now = new Date();
                const upcoming = [];
                const past = [];
                
                bookings.forEach(booking => {
                    if (booking.flight && booking.flight.departureTime) {
                        const departureTime = new Date(booking.flight.departureTime);
                        
                        if (departureTime > now) {
                            upcoming.push(booking);
                        } else {
                            past.push(booking);
                        }
                    }
                });
                
                // Display bookings
                if (upcoming.length > 0) {
                    displayBookingsList(upcoming, 'upcoming-bookings');
                } else if (upcomingBookings) {
                    upcomingBookings.querySelector('.booking-cards').innerHTML = `
                        <div class="no-bookings">
                            <i class="fas fa-info-circle"></i>
                            <p>คุณไม่มีการจองที่กำลังจะเดินทาง</p>
                            <a href="index.html" class="btn btn-primary">จองเที่ยวบินใหม่</a>
                        </div>
                    `;
                }
                
                if (past.length > 0) {
                    displayBookingsList(past, 'past-bookings');
                } else if (pastBookings) {
                    pastBookings.querySelector('.booking-cards').innerHTML = `
                        <div class="no-bookings">
                            <i class="fas fa-info-circle"></i>
                            <p>คุณไม่มีประวัติการเดินทาง</p>
                        </div>
                    `;
                }
            } else {
                // No bookings found
                if (upcomingBookings) {
                    upcomingBookings.querySelector('.booking-cards').innerHTML = `
                        <div class="no-bookings">
                            <i class="fas fa-info-circle"></i>
                            <p>คุณไม่มีการจองที่กำลังจะเดินทาง</p>
                            <a href="index.html" class="btn btn-primary">จองเที่ยวบินใหม่</a>
                        </div>
                    `;
                }
                
                if (pastBookings) {
                    pastBookings.querySelector('.booking-cards').innerHTML = `
                        <div class="no-bookings">
                            <i class="fas fa-info-circle"></i>
                            <p>คุณไม่มีประวัติการเดินทาง</p>
                        </div>
                    `;
                }
            }
        } catch (error) {
            console.error('Error loading user bookings:', error);
            
            // Show error message
            const errorMessage = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>เกิดข้อผิดพลาดในการโหลดข้อมูลการจอง กรุณาลองใหม่อีกครั้ง</p>
                    <button class="btn btn-primary retry-btn">ลองใหม่</button>
                </div>
            `;
            
            const upcomingBookings = document.getElementById('upcoming-bookings');
            const pastBookings = document.getElementById('past-bookings');
            
            if (upcomingBookings) {
                upcomingBookings.querySelector('.booking-cards').innerHTML = errorMessage;
                
                // Add retry button event listener
                const retryBtn = upcomingBookings.querySelector('.retry-btn');
                if (retryBtn) {
                    retryBtn.addEventListener('click', function() {
                        loadUserBookings(userId);
                    });
                }
            }
            
            if (pastBookings) {
                pastBookings.querySelector('.booking-cards').innerHTML = errorMessage;
            }
        }
    }
    
    /**
     * Display list of bookings
     */
    function displayBookingsList(bookings, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const bookingCardsContainer = container.querySelector('.booking-cards');
        if (!bookingCardsContainer) return;
        
        // Clear previous content
        bookingCardsContainer.innerHTML = '';
        
        // Add booking cards
        bookings.forEach(booking => {
            bookingCardsContainer.appendChild(createBookingCard(booking));
        });
        
        // Show container
        container.style.display = 'block';
        
        // Store bookings for sorting
        window[`${containerId}Data`] = [...bookings];
    }
    
    /**
     * Display single booking result from search
     */
    function displayBookingResult(booking) {
        const now = new Date();
        const departureTime = new Date(booking.flight.departureTime);
        const isPastBooking = departureTime < now;
        
        // Clear previous results
        const upcomingBookings = document.getElementById('upcoming-bookings');
        const pastBookings = document.getElementById('past-bookings');
        const noResults = document.getElementById('no-results');
        
        if (upcomingBookings) {
            upcomingBookings.querySelector('.booking-cards').innerHTML = '';
            upcomingBookings.style.display = isPastBooking ? 'none' : 'block';
        }
        
        if (pastBookings) {
            pastBookings.querySelector('.booking-cards').innerHTML = '';
            pastBookings.style.display = isPastBooking ? 'block' : 'none';
        }
        
        if (noResults) {
            noResults.style.display = 'none';
        }
        
        // Create booking card
        const bookingCard = createBookingCard(booking);
        
        // Add card to appropriate section
        if (isPastBooking) {
            if (pastBookings) {
                pastBookings.querySelector('.booking-cards').appendChild(bookingCard);
            }
        } else {
            if (upcomingBookings) {
                upcomingBookings.querySelector('.booking-cards').appendChild(bookingCard);
            }
        }
        
        // Highlight card
        highlightBookingCard(bookingCard);
    }
    
    /**
     * Show no results message
     */
    function showNoResults() {
        const upcomingBookings = document.getElementById('upcoming-bookings');
        const pastBookings = document.getElementById('past-bookings');
        const noResults = document.getElementById('no-results');
        
        if (upcomingBookings) upcomingBookings.style.display = 'none';
        if (pastBookings) pastBookings.style.display = 'none';
        if (noResults) noResults.style.display = 'block';
        
        // Scroll to no results section
        if (noResults) {
            noResults.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    /**
     * Create booking card element
     */
    function createBookingCard(booking) {
        const card = document.createElement('div');
        card.className = 'booking-card';
        if (booking.bookingStatus === 'Completed' || 
            new Date(booking.flight.departureTime) < new Date()) {
            card.classList.add('past');
        }
        
        // Format dates and times
        const bookingDate = new Date(booking.bookingDate);
        const departureTime = new Date(booking.flight.departureTime);
        const arrivalTime = new Date(booking.flight.arrivalTime);
        
        const formattedBookingDate = bookingDate.toLocaleDateString('th-TH', {
            day: 'numeric', 
            month: 'short', 
            year: 'numeric'
        });
        
        const formattedDepartureTime = departureTime.toLocaleTimeString('th-TH', {
            hour: '2-digit', 
            minute: '2-digit'
        });
        
        const formattedArrivalTime = arrivalTime.toLocaleTimeString('th-TH', {
            hour: '2-digit', 
            minute: '2-digit'
        });
        
        const formattedDepartureDate = departureTime.toLocaleDateString('th-TH', {
            day: 'numeric', 
            month: 'short', 
            year: 'numeric'
        });
        
        // Calculate duration
        const durationMs = arrivalTime - departureTime;
        const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
        const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        const duration = `${durationHours}h ${durationMinutes}m`;
        
        // Get status info
        const statusInfo = getBookingStatusInfo(booking.bookingStatus);
        
        // Build card HTML
        card.innerHTML = `
            <div class="booking-status ${statusInfo.className}">
                <span class="status-indicator"></span>
                <span class="status-text">${statusInfo.text}</span>
            </div>
            <div class="booking-header">
                <div class="reference">
                    <span class="label">รหัสการจอง:</span>
                    <span class="value">${booking.bookingId}</span>
                </div>
                <div class="booking-date">
                    <span class="label">วันที่จอง:</span>
                    <span class="value">${formattedBookingDate}</span>
                </div>
            </div>
            <div class="flight-info">
                <div class="airline">
                    <img src="../assets/images/icons/airplane.png" alt="${booking.flight.aircraft}" class="airline-logo">
                    <div>
                        <div class="airline-name">${booking.flight.aircraft}</div>
                        <div class="flight-number">${booking.flight.flightNumber}</div>
                    </div>
                </div>
                <div class="flight-route">
                    <div class="origin">
                        <div class="city-code">${booking.flight.departureCity.substring(0, 3).toUpperCase()}</div>
                        <div class="time">${formattedDepartureTime}</div>
                    </div>
                    <div class="flight-path">
                        <div class="route-line"></div>
                        <div class="duration">${duration}</div>
                    </div>
                    <div class="destination">
                        <div class="city-code">${booking.flight.arrivalCity.substring(0, 3).toUpperCase()}</div>
                        <div class="time">${formattedArrivalTime}</div>
                    </div>
                </div>
                <div class="travel-dates">
                    <div class="departure-date">${formattedDepartureDate}</div>
                </div>
            </div>
            <div class="passenger-info">
                <div class="passenger-count">
                    <i class="fas fa-user"></i> ${booking.passengers.length} ผู้โดยสาร
                </div>
                <div class="seat-info">
                    <i class="fas fa-chair"></i> ที่นั่ง: ${getPassengerSeats(booking.passengers)}
                </div>
            </div>
            <div class="booking-actions">
                ${booking.bookingStatus === 'Pending' ? `
                    <div class="payment-countdown">
                        <i class="fas fa-clock"></i> เหลือเวลาชำระเงิน: <span class="countdown-timer">23:59:59</span>
                    </div>
                ` : ''}
                <button class="btn btn-outline btn-sm view-details-btn" data-booking-id="${booking.bookingId}">
                    <i class="fas fa-eye"></i> ดูรายละเอียด
                </button>
                ${getActionButtons(booking)}
            </div>
        `;
        
        // Start countdown for pending bookings
        if (booking.bookingStatus === 'Pending') {
            const countdownElement = card.querySelector('.countdown-timer');
            if (countdownElement) {
                startPaymentCountdown(countdownElement);
            }
        }
        
        return card;
    }
    
    /**
     * Get seats information for passengers
     */
    function getPassengerSeats(passengers) {
        if (!passengers || passengers.length === 0) {
            return 'ยังไม่ได้เลือก';
        }
        
        const seatNumbers = passengers.map(p => p.seatNumber || 'ยังไม่ได้เลือก');
        const validSeats = seatNumbers.filter(seat => seat !== 'ยังไม่ได้เลือก');
        
        return validSeats.length > 0 ? validSeats.join(', ') : 'ยังไม่ได้เลือก';
    }
    
    /**
     * Get booking status information
     */
    function getBookingStatusInfo(status) {
        switch (status) {
            case 'Confirmed':
                return { className: 'active', text: 'การจองยืนยันแล้ว' };
            case 'Pending':
                return { className: 'waiting', text: 'รอการชำระเงิน' };
            case 'Cancelled':
                return { className: 'cancelled', text: 'การจองถูกยกเลิก' };
            case 'Completed':
                return { className: 'completed', text: 'เดินทางเสร็จสิ้น' };
            case 'Refunded':
                return { className: 'refunded', text: 'คืนเงินแล้ว' };
            default:
                return { className: '', text: status };
        }
    }
    
    /**
     * Get action buttons based on booking status
     */
    function getActionButtons(booking) {
        const now = new Date();
        const departureTime = new Date(booking.flight.departureTime);
        const isPastFlight = departureTime <= now;
        
        // Cannot perform actions on past flights except viewing details and printing
        if (isPastFlight) {
            return `
                <button class="btn btn-outline btn-sm print-btn" data-booking-id="${booking.bookingId}">
                    <i class="fas fa-print"></i> พิมพ์บัตรโดยสาร
                </button>
                <button class="btn btn-primary btn-sm share-btn" data-booking-id="${booking.bookingId}">
                    <i class="fas fa-share-alt"></i> แชร์การเดินทาง
                </button>
            `;
        }
        
        // Action buttons based on booking status
        switch (booking.bookingStatus) {
            case 'Pending':
                return `
                    <button class="btn btn-success btn-sm pay-btn" data-booking-id="${booking.bookingId}">
                        <i class="fas fa-credit-card"></i> ชำระเงิน
                    </button>
                    <button class="btn btn-danger btn-sm cancel-btn" data-booking-id="${booking.bookingId}">
                        <i class="fas fa-times"></i> ยกเลิกการจอง
                    </button>
                `;
            case 'Confirmed':
                return `
                    <button class="btn btn-outline btn-sm print-btn" data-booking-id="${booking.bookingId}">
                        <i class="fas fa-print"></i> พิมพ์บัตรโดยสาร
                    </button>
                    <button class="btn btn-primary btn-sm edit-btn" data-booking-id="${booking.bookingId}">
                        <i class="fas fa-pen"></i> แก้ไขการจอง
                    </button>
                    <button class="btn btn-danger btn-sm cancel-btn" data-booking-id="${booking.bookingId}">
                        <i class="fas fa-times"></i> ยกเลิกการจอง
                    </button>
                `;
            case 'Cancelled':
            case 'Refunded':
                return `
                    <button class="btn btn-primary btn-sm rebook-btn" data-booking-id="${booking.bookingId}">
                        <i class="fas fa-search"></i> ค้นหาเที่ยวบินใหม่
                    </button>
                `;
            default:
                return '';
        }
    }
    
    /**
     * Start payment countdown timer
     */
    function startPaymentCountdown(countdownElement) {
        // Simulate 24-hour countdown
        let hours = 23;
        let minutes = 59;
        let seconds = 59;
        
        const countdownInterval = setInterval(() => {
            seconds--;
            
            if (seconds < 0) {
                seconds = 59;
                minutes--;
                
                if (minutes < 0) {
                    minutes = 59;
                    hours--;
                    
                    if (hours < 0) {
                        // Time's up
                        clearInterval(countdownInterval);
                        countdownElement.parentElement.innerHTML = '<span style="color: var(--danger);">หมดเวลาชำระเงิน</span>';
                        return;
                    }
                }
            }
            
            // Update display
            countdownElement.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            
            // Change color when time is running low
            if (hours === 0 && minutes < 30) {
                countdownElement.style.color = 'var(--danger)';
            }
        }, 1000);
    }
    
    /**
     * Highlight booking card (for search results)
     */
    function highlightBookingCard(card) {
        card.classList.add('highlight');
        
        // Scroll to card
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Remove highlight after 3 seconds
        setTimeout(() => {
            card.classList.remove('highlight');
        }, 3000);
    }
    
    /**
     * Setup sort dropdown for bookings
     */
    function setupSortDropdown() {
        const sortSelect = document.getElementById('sort-by');
        
        if (sortSelect) {
            sortSelect.addEventListener('change', function() {
                const sortValue = this.value;
                
                // Sort upcoming bookings
                const upcomingBookingsData = window['upcoming-bookingsData'];
                if (upcomingBookingsData) {
                    const sortedUpcoming = sortBookings(upcomingBookingsData, sortValue);
                    displayBookingsList(sortedUpcoming, 'upcoming-bookings');
                }
                
                // Sort past bookings
                const pastBookingsData = window['past-bookingsData'];
                if (pastBookingsData) {
                    const sortedPast = sortBookings(pastBookingsData, sortValue);
                    displayBookingsList(sortedPast, 'past-bookings');
                }
            });
        }
    }
    
    /**
     * Sort bookings based on selected criteria
     */
    function sortBookings(bookings, sortValue) {
        if (!bookings || !bookings.length) return [];
        
        const sortedBookings = [...bookings];
        
        switch (sortValue) {
            case 'date-asc':
                // Sort by date (oldest to newest)
                return sortedBookings.sort((a, b) => 
                    new Date(a.flight.departureTime) - new Date(b.flight.departureTime)
                );
            case 'date-desc':
                // Sort by date (newest to oldest)
                return sortedBookings.sort((a, b) => 
                    new Date(b.flight.departureTime) - new Date(a.flight.departureTime)
                );
            case 'price-asc':
                // Sort by price (low to high)
                return sortedBookings.sort((a, b) => 
                    (a.totalPrice || 0) - (b.totalPrice || 0)
                );
            case 'price-desc':
                // Sort by price (high to low)
                return sortedBookings.sort((a, b) => 
                    (b.totalPrice || 0) - (a.totalPrice || 0)
                );
            default:
                return sortedBookings;
        }
    }
    
    /**
     * Setup action buttons in booking cards
     */
    function setupActionButtons() {
        // Using event delegation for dynamically created buttons
        document.addEventListener('click', function(e) {
            // View details button
            if (e.target.closest('.view-details-btn')) {
                const btn = e.target.closest('.view-details-btn');
                const bookingId = btn.getAttribute('data-booking-id');
                handleViewDetails(bookingId);
            }
            
            // Print boarding pass button
            if (e.target.closest('.print-btn')) {
                const btn = e.target.closest('.print-btn');
                const bookingId = btn.getAttribute('data-booking-id');
                handlePrintBoardingPass(bookingId);
            }
            
            // Payment button
            if (e.target.closest('.pay-btn')) {
                const btn = e.target.closest('.pay-btn');
                const bookingId = btn.getAttribute('data-booking-id');
                handlePayment(bookingId);
            }
            
            // Edit booking button
            if (e.target.closest('.edit-btn')) {
                const btn = e.target.closest('.edit-btn');
                const bookingId = btn.getAttribute('data-booking-id');
                handleEditBooking(bookingId);
            }
            
            // Cancel booking button
            if (e.target.closest('.cancel-btn')) {
                const btn = e.target.closest('.cancel-btn');
                const bookingId = btn.getAttribute('data-booking-id');
                handleCancelBooking(bookingId);
            }
            
            // Share travel button
            if (e.target.closest('.share-btn')) {
                const btn = e.target.closest('.share-btn');
                const bookingId = btn.getAttribute('data-booking-id');
                handleShareTravel(bookingId);
            }
            
            // Rebook button
            if (e.target.closest('.rebook-btn')) {
                const btn = e.target.closest('.rebook-btn');
                const bookingId = btn.getAttribute('data-booking-id');
                handleRebook(bookingId);
            }
        });
    }
    
    /**
     * Handle view booking details
     */
    function handleViewDetails(bookingId) {
        window.location.href = `confirmation.html?bookingId=${bookingId}`;
    }
    
    /**
     * Handle print boarding pass
     */
    function handlePrintBoardingPass(bookingId) {
        // Get booking data
        apiService.getBookingById(bookingId)
            .then(booking => {
                // Create and open print window
                printBoardingPass(booking);
            })
            .catch(error => {
                console.error('Error fetching booking details for printing:', error);
                alert('ไม่สามารถพิมพ์บัตรโดยสารได้ในขณะนี้ กรุณาลองใหม่อีกครั้งภายหลัง');
            });
    }
    
    /**
     * Print boarding pass in new window
     */
    function printBoardingPass(booking) {
        // Create print window
        const printWindow = window.open('', '_blank');
        
        // Set print window content
        printWindow.document.write(`
            <html>
            <head>
                <title>บัตรโดยสาร - ${booking.bookingId}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 20px;
                    }
                    .boarding-pass {
                        width: 100%;
                        max-width: 800px;
                        margin: 0 auto 20px;
                        border: 2px solid #333;
                        border-radius: 10px;
                        overflow: hidden;
                        page-break-after: always;
                    }
                    .boarding-pass-header {
                        background-color: #003366;
                        color: white;
                        padding: 15px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .airline-name {
                        font-size: 24px;
                        font-weight: bold;
                    }
                    .flight-info {
                        display: flex;
                        padding: 20px;
                        border-bottom: 1px solid #ddd;
                    }
                    .flight-route {
                        flex: 1;
                    }
                    .flight-details {
                        flex: 1;
                        text-align: right;
                    }
                    .passenger-info {
                        padding: 20px;
                        display: flex;
                    }
                    .passenger-details {
                        flex: 1;
                    }
                    .seat-details {
                        flex: 1;
                        text-align: right;
                    }
                    .boarding-time {
                        padding: 15px;
                        background-color: #f0f0f0;
                        text-align: center;
                        font-weight: bold;
                    }
                    .barcode {
                        padding: 20px;
                        text-align: center;
                    }
                    h2 {
                        margin: 0;
                        font-size: 18px;
                        color: #003366;
                    }
                    p {
                        margin: 5px 0;
                    }
                    .city-code {
                        font-size: 32px;
                        font-weight: bold;
                    }
                    .time {
                        font-size: 24px;
                        font-weight: bold;
                    }
                    .flight-path {
                        display: flex;
                        align-items: center;
                        margin: 10px 0;
                    }
                    .route-line {
                        flex: 1;
                        height: 2px;
                        background-color: #333;
                        position: relative;
                    }
                    .route-line:after {
                        content: '';
                        position: absolute;
                        right: 0;
                        top: -4px;
                        width: 0;
                        height: 0;
                        border-top: 5px solid transparent;
                        border-bottom: 5px solid transparent;
                        border-left: 10px solid #333;
                    }
                    @media print {
                        .print-instructions {
                            display: none;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="print-instructions">
                    <p>หน้านี้จะพิมพ์โดยอัตโนมัติ หากไม่พิมพ์โดยอัตโนมัติ กรุณาคลิกที่ปุ่มพิมพ์ในเบราว์เซอร์ของคุณ</p>
                </div>
        `);
        
        // Create boarding pass for each passenger
        booking.passengers.forEach(passenger => {
            const departureTime = new Date(booking.flight.departureTime);
            const boardingTime = new Date(departureTime);
            boardingTime.setMinutes(departureTime.getMinutes() - 30); // Boarding 30 minutes before departure
            
            const formattedDepartureTime = departureTime.toLocaleTimeString('th-TH', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const formattedBoardingTime = boardingTime.toLocaleTimeString('th-TH', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const formattedDepartureDate = departureTime.toLocaleDateString('th-TH', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
            
            printWindow.document.write(`
                <div class="boarding-pass">
                    <div class="boarding-pass-header">
                        <div class="airline-name">${booking.flight.aircraft}</div>
                        <div class="flight-number">เที่ยวบิน: ${booking.flight.flightNumber}</div>
                    </div>
                    
                    <div class="flight-info">
                        <div class="flight-route">
                            <h2>เส้นทางการบิน</h2>
                            <div class="city-code">${booking.flight.departureCity.substring(0, 3).toUpperCase()}</div>
                            <p>${booking.flight.departureCity}</p>
                            
                            <div class="flight-path">
                                <div class="route-line"></div>
                            </div>
                            
                            <div class="city-code">${booking.flight.arrivalCity.substring(0, 3).toUpperCase()}</div>
                            <p>${booking.flight.arrivalCity}</p>
                        </div>
                        
                        <div class="flight-details">
                            <h2>รายละเอียดเที่ยวบิน</h2>
                            <p><strong>วันที่:</strong> ${formattedDepartureDate}</p>
                            <p><strong>เวลาออกเดินทาง:</strong> <span class="time">${formattedDepartureTime}</span></p>
                            <p><strong>เทอร์มินัล:</strong> ${booking.flight.departureCity === 'Bangkok' ? 'D' : '1'}</p>
                            <p><strong>Gate:</strong> ${String.fromCharCode(65 + Math.floor(Math.random() * 10))}</p>
                        </div>
                    </div>
                    
                    <div class="passenger-info">
                        <div class="passenger-details">
                            <h2>ข้อมูลผู้โดยสาร</h2>
                            <p><strong>ชื่อ-นามสกุล:</strong> ${passenger.title || ''} ${passenger.firstName} ${passenger.lastName}</p>
                            <p><strong>หมายเลขการจอง:</strong> ${booking.bookingId}</p>
                        </div>
                        
                        <div class="seat-details">
                            <h2>ที่นั่ง</h2>
                            <p class="time">${passenger.seatNumber || 'ยังไม่ได้เลือก'}</p>
                            <p><strong>ชั้นโดยสาร:</strong> ${passenger.seatClass || 'ชั้นประหยัด'}</p>
                        </div>
                    </div>
                    
                    <div class="boarding-time">
                        <p>เวลาขึ้นเครื่อง: ${formattedBoardingTime}</p>
                    </div>
                    
                    <div class="barcode">
                        <!-- Simulated barcode -->
                        <svg width="300" height="50" viewBox="0 0 300 50">
                            <rect x="0" y="0" width="300" height="50" fill="white" />
                            ${Array.from({ length: 30 }, (_, i) => {
                                const x = i * 10;
                                const height = 20 + Math.floor(Math.random() * 30);
                                return `<rect x="${x}" y="${50 - height}" width="6" height="${height}" fill="black" />`;
                            }).join('')}
                        </svg>
                        <p>${booking.bookingId}</p>
                    </div>
                </div>
            `);
        });
        
        // Close body and HTML tags
        printWindow.document.write(`
            </body>
            </html>
        `);
        
        // Close document and print
        printWindow.document.close();
        printWindow.onload = function() {
            printWindow.print();
            setTimeout(() => {
                printWindow.close();
            }, 1000);
        };
    }
    
    /**
     * Handle payment
     */
    function handlePayment(bookingId) {
        window.location.href = `payment.html?bookingId=${bookingId}`;
    }
    
    /**
     * Handle edit booking
     */
    function handleEditBooking(bookingId) {
        window.location.href = `edit-booking.html?bookingId=${bookingId}`;
    }
    
    /**
     * Handle cancel booking
     */
    function handleCancelBooking(bookingId) {
        if (confirm('คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการจองนี้? การกระทำนี้ไม่สามารถเปลี่ยนแปลงได้')) {
            // Show loading state
            const cancelBtn = document.querySelector(`.cancel-btn[data-booking-id="${bookingId}"]`);
            const originalBtnHTML = cancelBtn.innerHTML;
            cancelBtn.disabled = true;
            cancelBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังยกเลิก...';
            
            // Call API
            apiService.cancelBooking(bookingId)
                .then(() => {
                    // Show success message
                    alert('การจองถูกยกเลิกเรียบร้อยแล้ว');
                    
                    // Get booking card
                    const bookingCard = cancelBtn.closest('.booking-card');
                    if (bookingCard) {
                        // Update card status
                        const statusElement = bookingCard.querySelector('.booking-status');
                        if (statusElement) {
                            statusElement.className = 'booking-status cancelled';
                            statusElement.innerHTML = `
                                <span class="status-indicator"></span>
                                <span class="status-text">การจองถูกยกเลิก</span>
                            `;
                        }
                        
                        // Update actions
                        const actionsElement = bookingCard.querySelector('.booking-actions');
                        if (actionsElement) {
                            // Keep view details button
                            const viewDetailsBtn = actionsElement.querySelector('.view-details-btn');
                            
                            // Replace actions
                            actionsElement.innerHTML = '';
                            if (viewDetailsBtn) {
                                actionsElement.appendChild(viewDetailsBtn);
                            }
                            
                            // Add rebook button
                            const rebookBtn = document.createElement('button');
                            rebookBtn.className = 'btn btn-primary btn-sm rebook-btn';
                            rebookBtn.setAttribute('data-booking-id', bookingId);
                            rebookBtn.innerHTML = '<i class="fas fa-search"></i> ค้นหาเที่ยวบินใหม่';
                            actionsElement.appendChild(rebookBtn);
                        }
                    }
                })
                .catch(error => {
                    console.error('Error cancelling booking:', error);
                    alert('ไม่สามารถยกเลิกการจองได้ในขณะนี้ กรุณาลองใหม่อีกครั้งภายหลัง');
                    
                    // Reset button
                    cancelBtn.disabled = false;
                    cancelBtn.innerHTML = originalBtnHTML;
                });
        }
    }
    
    /**
     * Handle share travel
     */
    function handleShareTravel(bookingId) {
        // Check if Web Share API is available
        if (navigator.share) {
            apiService.getBookingById(bookingId)
                .then(booking => {
                    // Create share data
                    const shareData = {
                        title: `เที่ยวบิน ${booking.flight.flightNumber}`,
                        text: `การเดินทางของฉันกับ ${booking.flight.aircraft} จาก ${booking.flight.departureCity} ไปยัง ${booking.flight.arrivalCity} เที่ยวบิน ${booking.flight.flightNumber}`,
                        url: window.location.origin + `/confirmation.html?bookingId=${bookingId}`
                    };
                    
                    // Trigger share dialog
                    navigator.share(shareData)
                        .catch(error => {
                            console.error('Error sharing:', error);
                        });
                })
                .catch(error => {
                    console.error('Error fetching booking details for sharing:', error);
                    alert('ไม่สามารถแชร์การเดินทางได้ในขณะนี้ กรุณาลองใหม่อีกครั้งภายหลัง');
                });
        } else {
            // Web Share API not available
            alert('ไม่สามารถใช้ฟีเจอร์แชร์บนเบราว์เซอร์นี้ กรุณาคัดลอก URL และแชร์ด้วยตนเอง');
        }
    }
    
    /**
     * Handle rebook
     */
    function handleRebook(bookingId) {
        // Redirect to search page with pre-filled data
        apiService.getBookingById(bookingId)
            .then(booking => {
                // Redirect to home page with search parameters
                const departureCity = encodeURIComponent(booking.flight.departureCity);
                const arrivalCity = encodeURIComponent(booking.flight.arrivalCity);
                
                window.location.href = `index.html?from=${departureCity}&to=${arrivalCity}`;
            })
            .catch(error => {
                console.error('Error fetching booking details for rebooking:', error);
                window.location.href = 'index.html'; // Redirect to home page without parameters
            });
    }
    
    // Add CSS styles for booking status page
    addStyles();
    
    /**
     * Add additional styles for the page
     */
    function addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Login Message */
            .login-message {
                display: flex;
                align-items: center;
                background-color: #e3f2fd;
                border-radius: 8px;
                padding: 1rem;
                margin-bottom: 1.5rem;
            }
            
            .login-message i {
                font-size: 1.5rem;
                color: #1976d2;
                margin-right: 1rem;
            }
            
            .login-message h3 {
                margin: 0 0 0.5rem;
                color: #1976d2;
                font-size: 1.1rem;
            }
            
            .login-message p {
                margin: 0;
                font-size: 0.95rem;
            }
            
            /* Loading Indicator */
            .loading-indicator {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 3rem 0;
                text-align: center;
            }
            
            .loading-indicator i {
                font-size: 2rem;
                color: var(--primary-color);
                margin-bottom: 1rem;
            }
            
            /* No Bookings */
            .no-bookings {
                display: flex;
                flex-direction: column;
                align-items: center;
                background-color: #f5f5f5;
                border-radius: 8px;
                padding: 3rem 0;
                text-align: center;
            }
            
            .no-bookings i {
                font-size: 2rem;
                color: #757575;
                margin-bottom: 1rem;
            }
            
            .no-bookings p {
                margin-bottom: 1.5rem;
                color: #757575;
            }
            
            /* Error Message */
            .error-message {
                display: flex;
                flex-direction: column;
                align-items: center;
                background-color: #ffebee;
                border-radius: 8px;
                padding: 3rem 0;
                text-align: center;
                color: #c62828;
            }
            
            .error-message i {
                font-size: 2rem;
                margin-bottom: 1rem;
            }
            
            .error-message p {
                margin-bottom: 1.5rem;
            }
            
            /* Card Highlight Effect */
            .booking-card.highlight {
                animation: highlight-pulse 2s ease-in-out;
            }
            
            @keyframes highlight-pulse {
                0%, 100% {
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                }
                50% {
                    box-shadow: 0 0 20px rgba(0, 102, 204, 0.7);
                    border: 1px solid var(--primary-color);
                }
            }
            
            /* Payment Countdown */
            .payment-countdown {
                display: block;
                width: 100%;
                background-color: #fff8e1;
                color: #ff8f00;
                padding: 0.5rem;
                border-radius: 4px;
                font-weight: 500;
                margin-bottom: 0.75rem;
                text-align: center;
            }
            
            .payment-countdown i {
                margin-right: 0.5rem;
            }
            
            /* User Dropdown */
            .user-dropdown {
                position: relative;
                display: inline-block;
            }
            
            .user-dropdown-btn {
                background: none;
                border: none;
                color: var(--primary-color);
                font-size: 1.1rem;
                cursor: pointer;
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
            
            /* Mobile User Welcome */
            .user-welcome-mobile {
                text-align: center;
                padding: 1rem;
                margin-bottom: 1rem;
                color: var(--primary-color);
                font-weight: 500;
            }
            
            /* User Welcome */
            .user-welcome {
                margin-right: 1rem;
                color: var(--primary-color);
            }
        `;
        
        document.head.appendChild(style);
    }
});