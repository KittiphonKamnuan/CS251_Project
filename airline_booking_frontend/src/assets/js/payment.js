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
    // Loyalty points ที่จะได้รับ
    let loyaltyPointsEarned = 0;
    
    // Setup payment tabs
    setupPaymentTabs();
    
    // Setup credit card input formatting
    setupCreditCardInputs();
    
    // Load booking data or flight summary
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
    
    // ----- Functions -----

    function setupPaymentTabs() {
        if (!paymentTabs || !paymentContents) return;
        paymentTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                paymentTabs.forEach(t => t.classList.remove('active'));
                paymentContents.forEach(c => c.classList.remove('active'));
                this.classList.add('active');
                const tabId = this.dataset.tab;
                document.getElementById(`${tabId}-content`).classList.add('active');
            });
        });
    }
    
    function setupCreditCardInputs() {
        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                let formattedValue = '';
                for (let i = 0; i < value.length; i++) {
                    if (i > 0 && i % 4 === 0) formattedValue += ' ';
                    formattedValue += value[i];
                }
                e.target.value = formattedValue.slice(0, 19);
            });
        }
        if (expiryDateInput) {
            expiryDateInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                let formattedValue = '';
                if (value.length > 0) {
                    let month = value.substring(0, 2);
                    if (parseInt(month) > 12 && month.length === 2) month = '12';
                    formattedValue = month;
                    if (value.length >= 2) formattedValue += '/';
                    if (value.length > 2) formattedValue += value.substring(2, 4);
                }
                e.target.value = formattedValue.slice(0, 5);
            });
        }
        if (cvvInput) {
            cvvInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                e.target.value = value.slice(0, 4);
            });
        }
    }
    
    async function loadBookingData(bookingId) {
        try {
            showLoadingState();
            const booking = await apiService.getBookingById(bookingId);
            bookingInfo = booking;
            // คำนวณ loyalty points
            if (bookingInfo && bookingInfo.totalPrice) {
                loyaltyPointsEarned = Math.floor(bookingInfo.totalPrice / 10);
            }
            updateBookingSummary(booking);
            hideLoadingState();
        } catch (error) {
            console.error('Error loading booking data:', error);
            alert('ไม่สามารถโหลดข้อมูลการจองได้ กรุณาลองใหม่อีกครั้ง');
            hideLoadingState();
        }
    }
    
    function loadFlightSummary() {
        if (!selectedFlightData || !passengerInfo) {
            alert('ไม่พบข้อมูลการจอง กรุณาเลือกเที่ยวบินและกรอกข้อมูลผู้โดยสารก่อน');
            window.location.href = 'index.html';
            return;
        }
        const summaryData = {
            flight: selectedFlightData,
            passengers: [passengerInfo.passenger],
            selectedSeats: selectedSeats,
            baseFare: selectedFlightData.price,
            taxes: Math.round(selectedFlightData.price * 0.325),
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
        
        // คำนวณ loyalty points
        if (bookingInfo.totalPrice) {
            loyaltyPointsEarned = Math.floor(bookingInfo.totalPrice / 10);
        }
        
        updateBookingSummary(summaryData);
    }
    
    function updateBookingSummary(data) {
        const flightRoute = document.querySelector('.flight-route');
        if (flightRoute && data.flight) {
            const flight = data.flight;
            let routeTitle = '';
            if (flight.departureCity && flight.arrivalCity) {
                const departureCode = flight.departureCity.substring(0, 3).toUpperCase();
                const arrivalCode = flight.arrivalCity.substring(0, 3).toUpperCase();
                routeTitle = `${flight.departureCity} (${departureCode}) → ${flight.arrivalCity} (${arrivalCode})`;
            }
            flightRoute.querySelector('h2').textContent = routeTitle;
            
            let routeInfo = '';
            if (flight.departureTime) {
                const departureDate = new Date(flight.departureTime);
                const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
                const formattedDate = departureDate.toLocaleDateString('th-TH', options);
                const passengers = data.passengers?.length || 1;
                routeInfo = `${formattedDate} | ผู้โดยสาร ${passengers} คน`;
                if (flight.seatClass) {
                    const seatClassMap = {
                        'economy': 'ชั้นประหยัด',
                        'premium-economy': 'ชั้นประหยัดพิเศษ',
                        'business': 'ชั้นธุรกิจ',
                        'first': 'ชั้นหนึ่ง'
                    };
                    routeInfo += ` | ${seatClassMap[flight.seatClass] || 'ชั้นประหยัด'}`;
                }
                if (flight.flightNumber) routeInfo += ` | ${flight.flightNumber}`;
            }
            flightRoute.querySelector('p').textContent = routeInfo;
        }
        
        updateSummaryItem('flightNumberSummary', data.flight?.flightNumber || 'N/A');
        
        if (data.flight?.departureTime) {
            const departureDate = new Date(data.flight.departureTime);
            updateSummaryItem('flightDateSummary', departureDate.toLocaleDateString('th-TH', {
                day: 'numeric', month: 'long', year: 'numeric'
            }));
            const arrivalTime = new Date(data.flight.arrivalTime);
            updateSummaryItem('flightTimeSummary', `${departureDate.toLocaleTimeString('th-TH', {
                hour: '2-digit', minute: '2-digit'
            })} - ${arrivalTime.toLocaleTimeString('th-TH', {
                hour: '2-digit', minute: '2-digit'
            })}`);
        }
        
        if (data.passengers && data.passengers.length > 0) {
            const passenger = data.passengers[0];
            const passengerName = passenger.firstName && passenger.lastName ? `${passenger.firstName} ${passenger.lastName}` : 'N/A';
            updateSummaryItem('passengerSummary', `${data.passengers.length} คน (${passengerName})`);
        }
        
        const seatNumbers = data.selectedSeats?.map(seat => seat.seatNumber).join(', ') || 
            data.passengers?.map(p => p.seatNumber).filter(s => s).join(', ') || 'ยังไม่ได้เลือก';
        updateSummaryItem('seatSummary', seatNumbers);
        
        const basePrice = document.getElementById('basePrice');
        const taxesAndFees = document.getElementById('taxesAndFees');
        const additionalServices = document.getElementById('additionalServices');
        const totalPrice = document.getElementById('totalPrice');
        
        if (basePrice) basePrice.textContent = `฿${(data.baseFare || 0).toLocaleString()}`;
        if (taxesAndFees) taxesAndFees.textContent = `฿${(data.taxes || 0).toLocaleString()}`;
        if (additionalServices) additionalServices.textContent = `฿${(data.additionalServices || 0).toLocaleString()}`;
        if (totalPrice) totalPrice.textContent = `฿${(data.totalPrice || 0).toLocaleString()}`;
        
        // Loyalty points
        const userData = localStorage.getItem('userData');
        if (userData && data.totalPrice) {
            try {
                const user = JSON.parse(userData);
                // คำนวณคะแนนสะสม
                loyaltyPointsEarned = Math.floor(data.totalPrice / 10);
                const loyaltyPointsSection = document.getElementById('loyaltyPointsSection');
                const loyaltyPointsInfo = document.getElementById('loyaltyPointsInfo');
                if (loyaltyPointsSection && loyaltyPointsInfo) {
                    loyaltyPointsSection.style.display = 'block';
                    loyaltyPointsInfo.textContent = `คุณจะได้รับ ${loyaltyPointsEarned} คะแนนเมื่อการจองเสร็จสมบูรณ์`;
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
    }
    
    function updateSummaryItem(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }
    
    function setupPayNowButton() {
        if (!payNowBtn) return;
        
        payNowBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            // Prevent multiple clicks
            if (this.disabled) return;
            
            this.disabled = true;
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังดำเนินการ...';
            
            // Validate terms acceptance
            const acceptTerms = document.getElementById('accept-terms');
            const acceptPolicy = document.getElementById('accept-policy');
            if (!acceptTerms?.checked) {
                alert('กรุณายอมรับเงื่อนไขและข้อตกลงในการจองตั๋วเครื่องบิน');
                resetButton();
                return;
            }
            if (!acceptPolicy?.checked) {
                alert('กรุณายอมรับนโยบายความเป็นส่วนตัวของ SkyBooking');
                resetButton();
                return;
            }
            
            // Validate payment method
            const activeTab = document.querySelector('.payment-tab.active');
            if (!activeTab) {
                alert('กรุณาเลือกวิธีการชำระเงิน');
                resetButton();
                return;
            }
            const paymentMethod = activeTab.dataset.tab;
            
            // Validate forms
            if (paymentMethod === 'credit-card' && !validateCreditCardForm()) {
                resetButton();
                return;
            } else if (paymentMethod === 'e-wallet' && !validateEWalletForm()) {
                resetButton();
                return;
            }
            
            showLoadingState();
            
            try {
                // เตรียมข้อมูลผู้ใช้
                let userId = null;
                const userData = localStorage.getItem('userData');
                
                if (userData) {
                    try {
                        const user = JSON.parse(userData);
                        userId = user.userId;
                        console.log('User logged in with ID:', userId);
                    } catch (error) {
                        console.error('Error parsing user data:', error);
                    }
                }
                
                if (bookingId) {
                    // Update payment for existing booking
                    const paymentData = {
                        bookingId,
                        paymentMethod,
                        amount: bookingInfo.totalPrice,
                        paymentStatus: 'Completed',
                        paymentDate: new Date().toISOString().split('T')[0],
                        // เพิ่มข้อมูล loyalty points
                        loyaltyPointsEarned: loyaltyPointsEarned
                    };
                    
                    if (paymentMethod === 'credit-card') {
                        paymentData.cardNumber = cardNumberInput.value.replace(/\s/g, '').slice(-4);
                        paymentData.cardHolder = cardHolderInput.value;
                        paymentData.expiryDate = expiryDateInput.value;
                    } else if (paymentMethod === 'e-wallet') {
                        paymentData.walletType = document.querySelector('input[name="wallet"]:checked')?.value;
                        paymentData.walletPhone = document.getElementById('wallet-phone')?.value;
                    }
                    
                    await apiService.createPayment(bookingId, paymentData);
                    
                    // เพิ่มคะแนนสะสมให้ผู้ใช้
                    if (userId && loyaltyPointsEarned > 0) {
                        try {
                            await apiService.addLoyaltyPoints(userId, loyaltyPointsEarned, bookingId);
                            console.log('Loyalty points added successfully:', loyaltyPointsEarned);
                        } catch (loyaltyError) {
                            console.error('Error adding loyalty points:', loyaltyError);
                            // ไม่หยุดการทำงานเมื่อมีปัญหากับการเพิ่มคะแนนสะสม
                        }
                    }
                    
                    await apiService.updateBookingStatus(bookingId, 'Confirmed');
                    window.location.href = `confirmation.html?bookingId=${bookingId}`;
                } else if (bookingInfo && selectedFlightData && passengerInfo) {
                    // Check logged-in user
                    if (!userId) {
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
                    
                    // Prepare booking data
                    const currentDate = new Date();
                    const formattedDate = currentDate.toISOString().split('T')[0];
                    // สมมติ passengerInfo.passengers เป็น array ของผู้โดยสารหลายคน
                    const passengersData = (passengerInfo.passengers || [passengerInfo.passenger]).map((p, index) => ({
                        title: p.title || '',
                        firstName: p.firstName || '',
                        lastName: p.lastName || '',
                        dateOfBirth: p.dateOfBirth || formattedDate,
                        nationality: p.nationality || 'TH',
                        documentId: p.documentId || '',
                        seatNumber: selectedSeats[index]?.seatNumber || null,
                        seatId: selectedSeats[index]?.seatId || null,
                        specialService: p.specialService || ''
                    }));                    

                    const bookingData = {
                        bookingDate: formattedDate,
                        bookingStatus: 'Confirmed',
                        totalPrice: bookingInfo.totalPrice,
                        baseFare: bookingInfo.baseFare,
                        taxes: bookingInfo.taxes,
                        additionalServices: bookingInfo.additionalServices,
                        contactEmail: passengerInfo.contact?.email || '',
                        contactPhone: passengerInfo.contact?.phone || '',
                        passengers: passengersData,
                        // เพิ่มข้อมูล loyalty points
                        loyaltyPointsEarned: loyaltyPointsEarned
                    };

                    
                    console.log('Booking data to send:', JSON.stringify(bookingData));
                    
                    // Create booking once only
                    const booking = await apiService.createBooking(bookingData, userId, selectedFlightData.flightId);
                    console.log('Booking created successfully:', booking);
                    
                    if (!booking || !booking.bookingId) {
                        throw new Error('ไม่ได้รับข้อมูลการจองจาก API');
                    }
                    
                    // Prepare payment data
                    const paymentData = {
                        bookingId: booking.bookingId,
                        paymentMethod,
                        amount: bookingInfo.totalPrice || 0,
                        paymentStatus: 'Completed',
                        paymentDate: formattedDate,
                        // เพิ่มข้อมูล loyalty points
                        loyaltyPointsEarned: loyaltyPointsEarned
                    };
                    
                    if (paymentMethod === 'credit-card') {
                        paymentData.cardNumber = cardNumberInput?.value ? cardNumberInput.value.replace(/\s/g, '').slice(-4) : '';
                        paymentData.cardHolder = cardHolderInput?.value || '';
                        paymentData.expiryDate = expiryDateInput?.value || '';
                    } else if (paymentMethod === 'e-wallet') {
                        paymentData.walletType = document.querySelector('input[name="wallet"]:checked')?.value || '';
                        paymentData.walletPhone = document.getElementById('wallet-phone')?.value || '';
                    }
                    
                    console.log('Creating payment with data:', paymentData);
                    await apiService.createPayment(booking.bookingId, paymentData);
                    
                    // เพิ่มคะแนนสะสมให้ผู้ใช้
                    if (userId && loyaltyPointsEarned > 0) {
                        try {
                            await apiService.addLoyaltyPoints(userId, loyaltyPointsEarned, booking.bookingId);
                            console.log('Loyalty points added successfully:', loyaltyPointsEarned);
                        } catch (loyaltyError) {
                            console.error('Error adding loyalty points:', loyaltyError);
                            // ไม่หยุดการทำงานเมื่อมีปัญหากับการเพิ่มคะแนนสะสม
                        }
                    }
                    
                    console.log('Updating booking status to Confirmed');
                    await apiService.updateBookingStatus(booking.bookingId, 'Confirmed');
                    
                    // Clear sessionStorage
                    sessionStorage.removeItem('selectedFlight');
                    sessionStorage.removeItem('passengerInfo');
                    sessionStorage.removeItem('selectedSeats');
                    sessionStorage.removeItem('additionalSeatPrice');
                    
                    // Redirect to confirmation page
                    window.location.href = `confirmation.html?bookingId=${booking.bookingId}`;
                } else {
                    throw new Error('ไม่พบข้อมูลการจองที่จำเป็น');
                }
            } catch (error) {
                console.error('Complete error details:', error);
                console.error('Error message:', error.message);
                console.error('Error stack:', error.stack);
                if (error.response) {
                    console.error('Error response:', error.response);
                }
                alert('เกิดข้อผิดพลาดในการชำระเงิน: ' + (error.message || 'กรุณาลองใหม่อีกครั้ง'));
                resetButton();
                hideLoadingState();
            }
        });
        
        function resetButton() {
            payNowBtn.innerHTML = originalText;
            payNowBtn.disabled = false;
        }
    }
    
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
        
        const [month, year] = expiryDate.split('/');
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100;
        const currentMonth = currentDate.getMonth() + 1;
        
        if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
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
    
    function setupDiscountCode() {
        if (!discountBtn || !discountInput) return;
        discountBtn.addEventListener('click', function() {
            const discountCode = discountInput.value.trim();
            if (!discountCode) {
                alert('กรุณากรอกรหัสส่วนลด');
                return;
            }
            if (discountCode.toUpperCase() === 'SKYPROMO') {
                if (bookingInfo) {
                    const discount = Math.round(bookingInfo.totalPrice * 0.1);
                    const newTotal = bookingInfo.totalPrice - discount;
                    
                    const totalItem = document.getElementById('totalPrice');
                    if (totalItem) {
                        totalItem.innerHTML = `฿${newTotal.toLocaleString()} <span style="text-decoration: line-through; color: #999; font-size: 0.85em;">฿${bookingInfo.totalPrice.toLocaleString()}</span>`;
                        totalItem.style.color = '#4caf50';
                    }
                    
                    const priceBreakdown = document.querySelector('.price-breakdown');
                    if (priceBreakdown) {
                        let discountItem = document.querySelector('.price-item.discount');
                        if (!discountItem) {
                            discountItem = document.createElement('div');
                            discountItem.className = 'price-item discount';
                            discountItem.innerHTML = `
                                <span class="price-label">ส่วนลด (10%)</span>
                                <span class="price-value" style="color: #4caf50;">-฿${discount.toLocaleString()}</span>
                            `;
                            const totalItem = document.querySelector('.price-item.total');
                            priceBreakdown.insertBefore(discountItem, totalItem);
                        } else {
                            discountItem.querySelector('.price-value').textContent = `-฿${discount.toLocaleString()}`;
                        }
                    }
                    
                    bookingInfo.discount = discount;
                    bookingInfo.totalPrice = newTotal;
                    
                    // อัพเดทคะแนนสะสมตามราคาใหม่
                    loyaltyPointsEarned = Math.floor(newTotal / 10);
                    
                    // อัพเดทข้อความแสดงคะแนนสะสม
                    const loyaltyPointsInfo = document.getElementById('loyaltyPointsInfo');
                    if (loyaltyPointsInfo) {
                        loyaltyPointsInfo.textContent = `คุณจะได้รับ ${loyaltyPointsEarned} คะแนนเมื่อการจองเสร็จสมบูรณ์`;
                    }
                }
                alert('ใช้รหัสส่วนลดสำเร็จ! คุณได้รับส่วนลด 10%');
                discountInput.disabled = true;
                discountBtn.disabled = true;
                discountBtn.innerHTML = 'ใช้แล้ว';
            } else {
                alert('รหัสส่วนลดไม่ถูกต้องหรือหมดอายุ');
            }
        });
    }
    
    function setupBackButton() {
        if (!backButton) return;
        backButton.addEventListener('click', function() {
            window.location.href = 'seat-selection.html';
        });
    }
    
    function showLoadingState() {
        const loadingOverlay = document.querySelector('.loading-overlay');
        if (loadingOverlay) loadingOverlay.style.display = 'flex';
    }
    
    function hideLoadingState() {
        const loadingOverlay = document.querySelector('.loading-overlay');
        if (loadingOverlay) loadingOverlay.style.display = 'none';
    }
});