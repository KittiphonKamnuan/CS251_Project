import { apiService } from './api-service.js';

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const paymentTabs = document.querySelectorAll('.payment-tab');
    const paymentContents = document.querySelectorAll('.payment-tab-content');
    const cardNumberInput = document.getElementById('card-number');
    const cardHolderInput = document.getElementById('card-holder');
    const expiryDateInput = document.getElementById('expiry-date');
    const cvvInput = document.getElementById('cvv');
    const payNowBtn = document.getElementById('pay-now-btn');
    const backButton = document.getElementById('backButton');
    const discountBtn = document.getElementById('apply-discount-btn');
    const discountInput = document.getElementById('discount-code-input');
    
    // Get data from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get('bookingId');
    
    // Get data from sessionStorage
    const selectedFlightData = sessionStorage.getItem('selectedFlight') ? 
        JSON.parse(sessionStorage.getItem('selectedFlight')) : null;
    const passengerInfo = sessionStorage.getItem('passengerInfo') ? 
        JSON.parse(sessionStorage.getItem('passengerInfo')) : null;
    const selectedSeats = sessionStorage.getItem('selectedSeats') ? 
        JSON.parse(sessionStorage.getItem('selectedSeats')) : [];
    const additionalSeatPrice = parseInt(sessionStorage.getItem('additionalSeatPrice') || '0');
    
    // Booking info
    let bookingInfo = null;
    
    // Setup payment tabs
    setupPaymentTabs();
    
    // Setup credit card input formatting
    setupCreditCardInputs();
    
    // Load booking data
    if (bookingId) {
        loadBookingData(bookingId);
    } else {
        loadFlightSummary();
    }
    
    // Setup pay now button
    setupPayNowButton();
    
    // Setup discount code
    setupDiscountCode();
    
    // Setup back button
    setupBackButton();
    
    /**
     * Setup payment tabs
     */
    function setupPaymentTabs() {
        if (!paymentTabs || !paymentContents) return;
        
        paymentTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Remove active class from all tabs and content
                paymentTabs.forEach(t => t.classList.remove('active'));
                paymentContents.forEach(c => c.classList.remove('active'));
                
                // Add active class to clicked tab
                this.classList.add('active');
                
                // Show related content
                const tabId = this.dataset.tab;
                document.getElementById(`${tabId}-content`).classList.add('active');
            });
        });
    }
    
    /**
     * Setup credit card input formatting
     */
    function setupCreditCardInputs() {
        // Format card number
        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                let formattedValue = '';
                
                for (let i = 0; i < value.length; i++) {
                    if (i > 0 && i % 4 === 0) {
                        formattedValue += ' ';
                    }
                    formattedValue += value[i];
                }
                
                e.target.value = formattedValue;
                
                // Limit to 19 characters (16 numbers + 3 spaces)
                if (e.target.value.length > 19) {
                    e.target.value = e.target.value.slice(0, 19);
                }
            });
        }
        
        // Format expiry date (MM/YY)
        if (expiryDateInput) {
            expiryDateInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                let formattedValue = '';
                
                if (value.length > 0) {
                    // First 2 digits are month
                    let month = value.substring(0, 2);
                    // If month > 12, set to 12
                    if (parseInt(month) > 12 && month.length === 2) {
                        month = '12';
                    }
                    formattedValue = month;
                    
                    // Add / after month
                    if (value.length >= 2) {
                        formattedValue += '/';
                    }
                    
                    // Remaining digits are year
                    if (value.length > 2) {
                        formattedValue += value.substring(2, 4);
                    }
                }
                
                e.target.value = formattedValue;
                
                // Limit to 5 characters (MM/YY)
                if (e.target.value.length > 5) {
                    e.target.value = e.target.value.slice(0, 5);
                }
            });
        }
        
        // Format CVV (3 or 4 digits)
        if (cvvInput) {
            cvvInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                e.target.value = value;
                
                // Limit to 4 digits
                if (e.target.value.length > 4) {
                    e.target.value = e.target.value.slice(0, 4);
                }
            });
        }
    }
    
    /**
     * Load booking data from API
     */
    async function loadBookingData(bookingId) {
        try {
            // Show loading state
            showLoadingState();
            
            // Get booking data from API
            const booking = await apiService.getBookingById(bookingId);
            bookingInfo = booking;
            
            // Update page with booking data
            updateBookingSummary(booking);
            
            // Hide loading state
            hideLoadingState();
        } catch (error) {
            console.error('Error loading booking data:', error);
            alert('ไม่สามารถโหลดข้อมูลการจองได้ กรุณาลองใหม่อีกครั้ง');
            
            // Hide loading state
            hideLoadingState();
        }
    }
    
    /**
     * Load flight summary from sessionStorage
     */
    function loadFlightSummary() {
        if (!selectedFlightData || !passengerInfo) {
            alert('ไม่พบข้อมูลการจอง กรุณาเลือกเที่ยวบินและกรอกข้อมูลผู้โดยสารก่อน');
            window.location.href = 'index.html';
            return;
        }
        
        // Create summary data from sessionStorage
        const summaryData = {
            flight: selectedFlightData,
            passengers: [passengerInfo.passenger],
            selectedSeats: selectedSeats,
            baseFare: selectedFlightData.price,
            taxes: Math.round(selectedFlightData.price * 0.325), // Tax approximately 32.5%
            additionalServices: additionalSeatPrice + (passengerInfo.additionalCost || 0),
            additionalSeatPrice: additionalSeatPrice,
            additionalCost: passengerInfo.additionalCost || 0,
            contactEmail: passengerInfo.contact.email,
            contactPhone: passengerInfo.contact.phone,
            totalPrice: selectedFlightData.price + 
                        Math.round(selectedFlightData.price * 0.325) + 
                        additionalSeatPrice + 
                        (passengerInfo.additionalCost || 0)
        };
        
        bookingInfo = summaryData;
        
        // Update page with summary data
        updateBookingSummary(summaryData);
    }
    
    /**
     * Update booking summary
     */
    function updateBookingSummary(data) {
        // Update flight route
        const flightRoute = document.querySelector('.flight-route');
        if (flightRoute && data.flight) {
            const flight = data.flight;
            
            // Create route title
            let routeTitle = '';
            if (flight.departureCity && flight.arrivalCity) {
                const departureCode = flight.departureCity.substring(0, 3).toUpperCase();
                const arrivalCode = flight.arrivalCity.substring(0, 3).toUpperCase();
                routeTitle = `${flight.departureCity} (${departureCode}) → ${flight.arrivalCity} (${arrivalCode})`;
            }
            
            flightRoute.querySelector('h2').textContent = routeTitle;
            
            // Create route details
            let routeInfo = '';
            if (flight.departureTime) {
                const departureDate = new Date(flight.departureTime);
                const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
                const formattedDate = departureDate.toLocaleDateString('th-TH', options);
                
                const passengers = data.passengers?.length || 1;
                
                routeInfo = `${formattedDate} | ผู้โดยสาร ${passengers} คน`;
                
                // Add seat class
                if (flight.seatClass) {
                    const seatClassMap = {
                        'economy': 'ชั้นประหยัด',
                        'premium-economy': 'ชั้นประหยัดพิเศษ',
                        'business': 'ชั้นธุรกิจ',
                        'first': 'ชั้นหนึ่ง'
                    };
                    routeInfo += ` | ${seatClassMap[flight.seatClass] || 'ชั้นประหยัด'}`;
                }
                
                // Add flight number
                if (flight.flightNumber) {
                    routeInfo += ` | ${flight.flightNumber}`;
                }
            }
            
            flightRoute.querySelector('p').textContent = routeInfo;
        }
        
        // Update summary items
        updateSummaryItem('flightNumberSummary', data.flight?.flightNumber || 'N/A');
        
        // Update date
        if (data.flight?.departureTime) {
            const departureDate = new Date(data.flight.departureTime);
            updateSummaryItem('flightDateSummary', departureDate.toLocaleDateString('th-TH', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }));
            
            // Update time
            const arrivalTime = new Date(data.flight.arrivalTime);
            updateSummaryItem('flightTimeSummary', `${departureDate.toLocaleTimeString('th-TH', {
                hour: '2-digit',
                minute: '2-digit'
            })} - ${arrivalTime.toLocaleTimeString('th-TH', {
                hour: '2-digit',
                minute: '2-digit'
            })}`);
        }
        
        // Update passenger summary
        if (data.passengers && data.passengers.length > 0) {
            const passenger = data.passengers[0];
            const passengerName = passenger.firstName && passenger.lastName ? 
                `${passenger.firstName} ${passenger.lastName}` : 'N/A';
            
            updateSummaryItem('passengerSummary', `${data.passengers.length} คน (${passengerName})`);
        }
        
        // Update seat summary
        const seatNumbers = data.selectedSeats?.map(seat => seat.seatNumber).join(', ') || 
            data.passengers?.map(p => p.seatNumber).filter(s => s).join(', ') || 
            'ยังไม่ได้เลือก';
        
        updateSummaryItem('seatSummary', seatNumbers);
        
        // Update price breakdown
        const basePrice = document.getElementById('basePrice');
        const taxesAndFees = document.getElementById('taxesAndFees');
        const additionalServices = document.getElementById('additionalServices');
        const totalPrice = document.getElementById('totalPrice');
        
        if (basePrice) basePrice.textContent = `฿${(data.baseFare || 0).toLocaleString()}`;
        if (taxesAndFees) taxesAndFees.textContent = `฿${(data.taxes || 0).toLocaleString()}`;
        if (additionalServices) additionalServices.textContent = `฿${(data.additionalServices || 0).toLocaleString()}`;
        if (totalPrice) totalPrice.textContent = `฿${(data.totalPrice || 0).toLocaleString()}`;
        
        // Show loyalty points if user is logged in
        const userData = localStorage.getItem('userData');
        if (userData && data.totalPrice) {
            try {
                const user = JSON.parse(userData);
                const pointsEarned = Math.floor(data.totalPrice / 10); // 1 point per 10 THB
                
                const loyaltyPointsSection = document.getElementById('loyaltyPointsSection');
                const loyaltyPointsInfo = document.getElementById('loyaltyPointsInfo');
                
                if (loyaltyPointsSection && loyaltyPointsInfo) {
                    loyaltyPointsSection.style.display = 'block';
                    loyaltyPointsInfo.textContent = `คุณจะได้รับ ${pointsEarned} คะแนนเมื่อการจองเสร็จสมบูรณ์`;
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
    }
    
    /**
     * Update summary item by ID
     */
    function updateSummaryItem(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }
    
    /**
     * Setup pay now button
     */
    function setupPayNowButton() {
        if (!payNowBtn) return;
        
        payNowBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            // Check if terms are accepted
            const acceptTerms = document.getElementById('accept-terms');
            const acceptPolicy = document.getElementById('accept-policy');
            
            if (!acceptTerms?.checked) {
                alert('กรุณายอมรับเงื่อนไขและข้อตกลงในการจองตั๋วเครื่องบิน');
                return;
            }
            
            if (!acceptPolicy?.checked) {
                alert('กรุณายอมรับนโยบายความเป็นส่วนตัวของ SkyBooking');
                return;
            }
            
            // Check payment method
            const activeTab = document.querySelector('.payment-tab.active');
            if (!activeTab) {
                alert('กรุณาเลือกวิธีการชำระเงิน');
                return;
            }
            
            const paymentMethod = activeTab.dataset.tab;
            
            // Validate payment form
            if (paymentMethod === 'credit-card') {
                if (!validateCreditCardForm()) {
                    return;
                }
            } else if (paymentMethod === 'e-wallet') {
                if (!validateEWalletForm()) {
                    return;
                }
            }
            
            // Show loading state
            showLoadingState();
            const originalBtnText = payNowBtn.innerHTML;
            payNowBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังดำเนินการ...';
            payNowBtn.disabled = true;
            
            try {
                // If bookingId exists, update payment for existing booking
                if (bookingId) {
                    // Collect payment data
                    const paymentData = {
                        bookingId,
                        paymentMethod,
                        amount: bookingInfo.totalPrice,
                        paymentStatus: 'Completed',
                        paymentDate: new Date().toISOString().split('T')[0]
                    };
                    
                    // Add additional info based on payment method
                    if (paymentMethod === 'credit-card') {
                        paymentData.cardNumber = cardNumberInput.value.replace(/\s/g, '').slice(-4);
                        paymentData.cardHolder = cardHolderInput.value;
                        paymentData.expiryDate = expiryDateInput.value;
                    } else if (paymentMethod === 'e-wallet') {
                        paymentData.walletType = document.querySelector('input[name="wallet"]:checked')?.value;
                        paymentData.walletPhone = document.getElementById('wallet-phone')?.value;
                    }
                    
                    // Call API to save payment
                    await apiService.createPayment(bookingId, paymentData);
                    
                    // Update booking status
                    await apiService.updateBookingStatus(bookingId, 'Confirmed');
                    
                    // Redirect to confirmation page
                    window.location.href = `confirmation.html?bookingId=${bookingId}`;
                } 
                // Create new booking
                else if (bookingInfo && selectedFlightData && passengerInfo) {
                    // Check if user is logged in
                    const userData = localStorage.getItem('userData');
                    let userId = null; // ประกาศตัวแปร userId ที่นี่
                    
                    if (userData) {
                        try {
                            const user = JSON.parse(userData);
                            userId = user.userId;
                            console.log('User logged in with ID:', userId);
                        } catch (error) {
                            console.error('Error parsing user data:', error);
                        }
                    }
                    
                    // If user is not logged in, save temporary booking and redirect to login
                    if (!userId) {
                        // Save booking data to sessionStorage
                        sessionStorage.setItem('pendingBooking', JSON.stringify({
                            flight: selectedFlightData,
                            passenger: passengerInfo,
                            seats: selectedSeats,
                            additionalSeatPrice
                        }));
                        
                        alert('กรุณาเข้าสู่ระบบก่อนทำการชำระเงิน');
                        window.location.href = 'login.html?redirect=payment.html';
                        return;
                    }
                    
                    // Create booking data
                    const currentDate = new Date();
                    const formattedDate = currentDate.toISOString().split('T')[0]; // รูปแบบ YYYY-MM-DD
                    
                    console.log('Creating booking with formatted date:', formattedDate);
                    
                    const bookingData = {
                        bookingDate: formattedDate,
                        bookingStatus: 'Pending',
                        totalPrice: bookingInfo.totalPrice,
                        baseFare: bookingInfo.baseFare,
                        taxes: bookingInfo.taxes,
                        additionalServices: bookingInfo.additionalServices,
                        contactEmail: passengerInfo.contact?.email || '',
                        contactPhone: passengerInfo.contact?.phone || '',
                        passengers: [{
                            title: passengerInfo.passenger?.title || '',
                            firstName: passengerInfo.passenger?.firstName || '',
                            lastName: passengerInfo.passenger?.lastName || '',
                            dateOfBirth: formattedDate, // ใช้วันที่ปัจจุบันในรูปแบบ YYYY-MM-DD
                            nationality: passengerInfo.passenger?.nationality || 'TH',
                            documentId: passengerInfo.passenger?.documentId || '',
                            seatNumber: selectedSeats.length > 0 ? selectedSeats[0].seatNumber : null,
                            specialService: passengerInfo.passenger?.specialService || ''
                        }]
                    };
                    await apiService.createBooking(bookingData, userId, selectedFlightData.flightId);
                    
                    // Log booking data for debugging
                    console.log('Booking data to send:', JSON.stringify(bookingData));
                    
                    try {
                        // Create booking
                        console.log('Calling API to create booking...');
                        const booking = await apiService.createBooking(
                            bookingData, 
                            userId,  // ส่ง userId เป็นพารามิเตอร์ที่ 2
                            selectedFlightData.flightId  // ส่ง flightId เป็นพารามิเตอร์ที่ 3
                        );
                        console.log('Booking created successfully:', booking);
                        
                        if (!booking || !booking.bookingId) {
                            throw new Error('ไม่ได้รับข้อมูลการจองจาก API');
                        }
                        
                        // Collect payment data
                        const paymentData = {
                            bookingId: booking.bookingId,
                            paymentMethod,
                            amount: bookingInfo.totalPrice || 0,
                            paymentStatus: 'Completed',
                            paymentDate: formattedDate
                        };
                        
                        // Add additional info based on payment method
                        if (paymentMethod === 'credit-card') {
                            paymentData.cardNumber = cardNumberInput?.value ? cardNumberInput.value.replace(/\s/g, '').slice(-4) : '';
                            paymentData.cardHolder = cardHolderInput?.value || '';
                            paymentData.expiryDate = expiryDateInput?.value || '';
                        } else if (paymentMethod === 'e-wallet') {
                            paymentData.walletType = document.querySelector('input[name="wallet"]:checked')?.value || '';
                            paymentData.walletPhone = document.getElementById('wallet-phone')?.value || '';
                        }
                        
                        // Save payment
                        console.log('Creating payment with data:', paymentData);
                        await apiService.createPayment(booking.bookingId, paymentData);
                        
                        // Update booking status
                        console.log('Updating booking status to Confirmed');
                        await apiService.updateBookingStatus(booking.bookingId, 'Confirmed');
                        
                        // Clear sessionStorage
                        sessionStorage.removeItem('selectedFlight');
                        sessionStorage.removeItem('passengerInfo');
                        sessionStorage.removeItem('selectedSeats');
                        sessionStorage.removeItem('additionalSeatPrice');
                        
                        // Redirect to confirmation page
                        window.location.href = `confirmation.html?bookingId=${booking.bookingId}`;
                    } catch (bookingError) {
                        console.error('Error during booking process:', bookingError);
                        throw new Error('เกิดข้อผิดพลาดในการสร้างการจอง: ' + (bookingError.message || 'กรุณาลองใหม่อีกครั้ง'));
                    }
                } else {
                    throw new Error('ไม่พบข้อมูลการจองที่จำเป็น');
                }
            } catch (error) {
                console.error('Complete error details:', error);
                console.error('Error message:', error.message);
                console.error('Error stack:', error.stack);
                
                // ถ้ามี response ให้แสดงด้วย
                if (error.response) {
                    console.error('Error response:', error.response);
                }
                
                alert('เกิดข้อผิดพลาดในการชำระเงิน: ' + (error.message || 'กรุณาลองใหม่อีกครั้ง'));
                
                // Reset button state
                payNowBtn.innerHTML = originalBtnText;
                payNowBtn.disabled = false;
                hideLoadingState();
            }
        });
    }
    
    /**
     * Validate credit card form
     */
    function validateCreditCardForm() {
        const cardNumber = cardNumberInput.value.replace(/\s/g, '');
        const cardHolder = cardHolderInput.value;
        const expiryDate = expiryDateInput.value;
        const cvv = cvvInput.value;
        
        if (!cardHolder) {
            alert('กรุณากรอกชื่อผู้ถือบัตร');
            cardHolderInput.focus();
            return false;
        }
        
        if (!cardNumber || cardNumber.length < 16) {
            alert('กรุณากรอกหมายเลขบัตรให้ถูกต้อง');
            cardNumberInput.focus();
            return false;
        }
        
        if (!expiryDate || expiryDate.length < 5) {
            alert('กรุณากรอกวันหมดอายุบัตรให้ถูกต้อง (MM/YY)');
            expiryDateInput.focus();
            return false;
        }
        
        // Check if card is expired
        const [month, year] = expiryDate.split('/');
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100; // Last 2 digits
        const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11
        
        if (parseInt(year) < currentYear || 
            (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
            alert('บัตรของคุณหมดอายุแล้ว กรุณาใช้บัตรอื่น');
            expiryDateInput.focus();
            return false;
        }
        
        if (!cvv || cvv.length < 3) {
            alert('กรุณากรอกรหัส CVV ให้ถูกต้อง');
            cvvInput.focus();
            return false;
        }
        
        return true;
    }
    
    /**
     * Validate e-wallet form
     */
    function validateEWalletForm() {
        const selectedWallet = document.querySelector('input[name="wallet"]:checked');
        if (!selectedWallet) {
            alert('กรุณาเลือกช่องทางการชำระเงิน');
            return false;
        }
        
        const walletPhone = document.getElementById('wallet-phone')?.value;
        if (!walletPhone || !/^0\d{9}$/.test(walletPhone.replace(/-/g, ''))) {
            alert('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (เช่น 0xx-xxx-xxxx)');
            document.getElementById('wallet-phone').focus();
            return false;
        }
        
        return true;
    }
    
    /**
     * Setup discount code
     */
    function setupDiscountCode() {
        if (!discountBtn || !discountInput) return;
        
        discountBtn.addEventListener('click', function() {
            const discountCode = discountInput.value.trim();
            
            if (!discountCode) {
                alert('กรุณากรอกรหัสส่วนลด');
                return;
            }
            
            // Check discount code
            if (discountCode.toUpperCase() === 'SKYPROMO') {
                // Calculate 10% discount
                if (bookingInfo) {
                    const discount = Math.round(bookingInfo.totalPrice * 0.1);
                    const newTotal = bookingInfo.totalPrice - discount;
                    
                    // Update total price
                    const totalItem = document.getElementById('totalPrice');
                    if (totalItem) {
                        totalItem.innerHTML = `฿${newTotal.toLocaleString()} <span style="text-decoration: line-through; color: #999; font-size: 0.85em;">฿${bookingInfo.totalPrice.toLocaleString()}</span>`;
                        totalItem.style.color = '#4caf50';
                    }
                    
                    // Add discount item to price breakdown
                    const priceBreakdown = document.querySelector('.price-breakdown');
                    if (priceBreakdown) {
                        // Check if discount item already exists
                        let discountItem = document.querySelector('.price-item.discount');
                        if (!discountItem) {
                            // Create new discount item
                            discountItem = document.createElement('div');
                            discountItem.className = 'price-item discount';
                            discountItem.innerHTML = `
                                <span class="price-label">ส่วนลด (10%)</span>
                                <span class="price-value" style="color: #4caf50;">-฿${discount.toLocaleString()}</span>
                            `;
                            
                            // Insert discount item before total item
                            const totalItem = document.querySelector('.price-item.total');
                            priceBreakdown.insertBefore(discountItem, totalItem);
                        } else {
                            // Update existing discount item
                            discountItem.querySelector('.price-value').textContent = `-฿${discount.toLocaleString()}`;
                        }
                    }
                    
                    // Update booking info
                    bookingInfo.discount = discount;
                    bookingInfo.totalPrice = newTotal;
                }
                
                // Show success message
                alert('ใช้รหัสส่วนลดสำเร็จ! คุณได้รับส่วนลด 10%');
                
                // Disable discount input
                discountInput.disabled = true;
                discountBtn.disabled = true;
                discountBtn.innerHTML = 'ใช้แล้ว';
            } else {
                alert('รหัสส่วนลดไม่ถูกต้องหรือหมดอายุ');
            }
        });
    }
    
    /**
     * Setup back button
     */
    function setupBackButton() {
        if (!backButton) return;
        
        backButton.addEventListener('click', function() {
            // Go back to seat selection page
            window.location.href = 'seat-selection.html';
        });
    }
    
    /**
     * Show loading state
     */
    function showLoadingState() {
        const loadingOverlay = document.querySelector('.loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'flex';
        }
    }
    
    /**
     * Hide loading state
     */
    function hideLoadingState() {
        const loadingOverlay = document.querySelector('.loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }
});