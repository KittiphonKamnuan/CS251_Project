import { apiService } from './api-service.js';

document.addEventListener('DOMContentLoaded', function() {
    // เลือก elements ที่เกี่ยวข้อง
    const paymentTabs = document.querySelectorAll('.payment-tab');
    const paymentContents = document.querySelectorAll('.payment-tab-content');
    const cardNumberInput = document.getElementById('card-number');
    const expiryDateInput = document.getElementById('expiry-date');
    const cvvInput = document.getElementById('cvv');
    const payNowBtn = document.getElementById('pay-now-btn');
    
    // ดึงข้อมูลจาก URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get('bookingId');
    
    // ดึงข้อมูลที่บันทึกไว้ใน sessionStorage
    const selectedFlightData = sessionStorage.getItem('selectedFlight') ? 
        JSON.parse(sessionStorage.getItem('selectedFlight')) : null;
    const passengerData = sessionStorage.getItem('passengerData') ? 
        JSON.parse(sessionStorage.getItem('passengerData')) : null;
    const selectedSeats = sessionStorage.getItem('selectedSeats') ? 
        JSON.parse(sessionStorage.getItem('selectedSeats')) : [];
    const additionalSeatPrice = parseInt(sessionStorage.getItem('additionalSeatPrice') || '0');
    
    // ข้อมูลการจอง
    let bookingInfo = null;
    
    // ตั้งค่า tabs สำหรับวิธีการชำระเงิน
    setupPaymentTabs();
    
    // ตั้งค่า formatting สำหรับช่องกรอกข้อมูลบัตรเครดิต
    setupCreditCardInputs();
    
    // โหลดข้อมูลการจอง
    if (bookingId) {
        loadBookingData(bookingId);
    } else {
        loadFlightSummary();
    }
    
    // ตั้งค่าปุ่มชำระเงิน
    setupPayNowButton();
    
    // ตั้งค่ารหัสส่วนลด
    setupDiscountCode();
    
    /**
     * ตั้งค่า tabs สำหรับวิธีการชำระเงิน
     */
    function setupPaymentTabs() {
        if (!paymentTabs || !paymentContents) return;
        
        paymentTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // ลบ class active จากทุก tab และ content
                paymentTabs.forEach(t => t.classList.remove('active'));
                paymentContents.forEach(c => c.classList.remove('active'));
                
                // เพิ่ม class active ให้กับ tab ที่คลิก
                this.classList.add('active');
                
                // แสดง content ที่เกี่ยวข้อง
                const tabId = this.dataset.tab;
                document.getElementById(`${tabId}-content`).classList.add('active');
            });
        });
    }
    
    /**
     * ตั้งค่า formatting สำหรับช่องกรอกข้อมูลบัตรเครดิต
     */
    function setupCreditCardInputs() {
        // Format หมายเลขบัตรเครดิต
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
                
                // จำกัดให้กรอกได้ไม่เกิน 19 ตัวอักษร (16 ตัวเลข + 3 ช่องว่าง)
                if (e.target.value.length > 19) {
                    e.target.value = e.target.value.slice(0, 19);
                }
            });
        }
        
        // Format วันหมดอายุ (MM/YY)
        if (expiryDateInput) {
            expiryDateInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                let formattedValue = '';
                
                if (value.length > 0) {
                    // 2 ตัวแรกคือเดือน
                    let month = value.substring(0, 2);
                    // ถ้าเดือนมากกว่า 12 ให้เป็น 12
                    if (parseInt(month) > 12 && month.length === 2) {
                        month = '12';
                    }
                    formattedValue = month;
                    
                    // เพิ่ม / หลังจากเดือน
                    if (value.length >= 2) {
                        formattedValue += '/';
                    }
                    
                    // ตัวเลขที่เหลือคือปี
                    if (value.length > 2) {
                        formattedValue += value.substring(2, 4);
                    }
                }
                
                e.target.value = formattedValue;
                
                // จำกัดให้กรอกได้ไม่เกิน 5 ตัวอักษร (MM/YY)
                if (e.target.value.length > 5) {
                    e.target.value = e.target.value.slice(0, 5);
                }
            });
        }
        
        // Format CVV (3 หรือ 4 หลัก)
        if (cvvInput) {
            cvvInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                e.target.value = value;
                
                // จำกัดให้กรอกได้ไม่เกิน 4 ตัวอักษร
                if (e.target.value.length > 4) {
                    e.target.value = e.target.value.slice(0, 4);
                }
            });
        }
    }
    
    /**
     * โหลดข้อมูลการจอง
     */
    async function loadBookingData(bookingId) {
        try {
            // แสดง loading state
            showLoadingState();
            
            // ดึงข้อมูลการจองจาก API
            const booking = await apiService.getBookingById(bookingId);
            bookingInfo = booking;
            
            // อัพเดทข้อมูลในหน้า
            updateBookingSummary(booking);
            
            // ซ่อน loading state
            hideLoadingState();
        } catch (error) {
            console.error('Error loading booking data:', error);
            alert('ไม่สามารถโหลดข้อมูลการจองได้ กรุณาลองใหม่อีกครั้ง');
            
            // ซ่อน loading state
            hideLoadingState();
        }
    }
    
    /**
     * โหลดข้อมูลสรุปเที่ยวบิน (กรณีที่ยังไม่มี bookingId)
     */
    function loadFlightSummary() {
        if (!selectedFlightData || !passengerData) {
            alert('ไม่พบข้อมูลการจอง กรุณาเลือกเที่ยวบินและกรอกข้อมูลผู้โดยสารก่อน');
            window.location.href = 'index.html';
            return;
        }
        
        // สร้างข้อมูลสรุปการจองจากข้อมูลที่บันทึกไว้
        const summaryData = {
            flight: selectedFlightData,
            passengers: [passengerData],
            selectedSeats: selectedSeats,
            baseFare: selectedFlightData.price,
            taxes: Math.round(selectedFlightData.price * 0.325), // ภาษีและค่าธรรมเนียมประมาณ 32.5%
            additionalServices: additionalSeatPrice,
            totalPrice: selectedFlightData.price + Math.round(selectedFlightData.price * 0.325) + additionalSeatPrice
        };
        
        bookingInfo = summaryData;
        
        // อัพเดทข้อมูลในหน้า
        updateBookingSummary(summaryData);
    }
    
    /**
     * อัพเดทข้อมูลสรุปการจอง
     */
    function updateBookingSummary(data) {
        // อัพเดทข้อมูลเที่ยวบิน
        const flightSummary = document.querySelector('.flight-route');
        if (flightSummary) {
            const flight = data.flight;
            const passengers = data.passengers?.length || 1;
            
            // สร้างข้อความสรุปเที่ยวบิน
            let summaryText = '';
            if (flight.departureCity && flight.arrivalCity) {
                const departureCode = flight.departureCity.substring(0, 3).toUpperCase();
                const arrivalCode = flight.arrivalCity.substring(0, 3).toUpperCase();
                summaryText = `${flight.departureCity} (${departureCode}) → ${flight.arrivalCity} (${arrivalCode})`;
            }
            
            flightSummary.querySelector('h2').textContent = summaryText;
            
            // สร้างข้อความรายละเอียดเที่ยวบิน
            let detailsText = '';
            if (flight.departureTime) {
                const departureDate = new Date(flight.departureTime);
                const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
                const formattedDate = departureDate.toLocaleDateString('th-TH', options);
                
                detailsText = `${formattedDate} | ผู้โดยสาร ${passengers} คน`;
                
                // เพิ่มชั้นโดยสาร
                if (flight.seatClass) {
                    const seatClassMap = {
                        'economy': 'ชั้นประหยัด',
                        'premium-economy': 'ชั้นประหยัดพิเศษ',
                        'business': 'ชั้นธุรกิจ',
                        'first': 'ชั้นหนึ่ง'
                    };
                    detailsText += ` | ${seatClassMap[flight.seatClass] || 'ชั้นประหยัด'}`;
                }
                
                // เพิ่มรหัสเที่ยวบิน
                if (flight.flightNumber) {
                    detailsText += ` | ${flight.flightNumber}`;
                }
            }
            
            flightSummary.querySelector('p').textContent = detailsText;
        }
        
        // อัพเดทข้อมูลสรุปการจอง
        const summaryItems = document.querySelectorAll('.summary-item');
        if (summaryItems.length > 0) {
            // ข้อมูลเที่ยวบิน
            const flightNumberItem = summaryItems[0]?.querySelector('.summary-value');
            if (flightNumberItem) {
                flightNumberItem.textContent = data.flight.flightNumber || 'N/A';
            }
            
            // วันที่
            const dateItem = summaryItems[1]?.querySelector('.summary-value');
            if (dateItem && data.flight.departureTime) {
                const departureDate = new Date(data.flight.departureTime);
                dateItem.textContent = departureDate.toLocaleDateString('th-TH', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                });
            }
            
            // เวลา
            const timeItem = summaryItems[2]?.querySelector('.summary-value');
            if (timeItem && data.flight.departureTime && data.flight.arrivalTime) {
                const departureTime = new Date(data.flight.departureTime);
                const arrivalTime = new Date(data.flight.arrivalTime);
                
                timeItem.textContent = `${departureTime.toLocaleTimeString('th-TH', {
                    hour: '2-digit',
                    minute: '2-digit'
                })} - ${arrivalTime.toLocaleTimeString('th-TH', {
                    hour: '2-digit',
                    minute: '2-digit'
                })}`;
            }
            
            // ผู้โดยสาร
            const passengerItem = summaryItems[3]?.querySelector('.summary-value');
            if (passengerItem && data.passengers) {
                const passengerName = data.passengers[0]?.firstName && data.passengers[0]?.lastName ?
                    `${data.passengers[0].firstName} ${data.passengers[0].lastName}` : 'N/A';
                
                passengerItem.textContent = `${data.passengers.length} คน (${passengerName})`;
            }
            
            // ที่นั่ง
            const seatItem = summaryItems[4]?.querySelector('.summary-value');
            if (seatItem) {
                const seatNumbers = data.selectedSeats?.map(seat => seat.seatNumber).join(', ') || 
                    data.passengers?.map(p => p.seatNumber).filter(s => s).join(', ') || 
                    'ยังไม่ได้เลือก';
                
                seatItem.textContent = seatNumbers;
            }
        }
        
        // อัพเดทราคา
        const fareItems = document.querySelectorAll('.price-item');
        if (fareItems.length > 0) {
            // ค่าโดยสาร
            const baseFareItem = fareItems[0]?.querySelector('.price-value');
            if (baseFareItem) {
                baseFareItem.textContent = `฿${(data.baseFare || 0).toLocaleString()}`;
            }
            
            // ภาษีและค่าธรรมเนียม
            const taxesItem = fareItems[1]?.querySelector('.price-value');
            if (taxesItem) {
                taxesItem.textContent = `฿${(data.taxes || 0).toLocaleString()}`;
            }
            
            // บริการเสริม
            const additionalItem = fareItems[2]?.querySelector('.price-value');
            if (additionalItem) {
                additionalItem.textContent = `฿${(data.additionalServices || 0).toLocaleString()}`;
            }
            
            // ยอดรวม
            const totalItem = document.querySelector('.price-item.total .price-value');
            if (totalItem) {
                totalItem.textContent = `฿${(data.totalPrice || 0).toLocaleString()}`;
            }
        }
    }
    
    /**
     * ตั้งค่าปุ่มชำระเงิน
     */
    function setupPayNowButton() {
        if (!payNowBtn) return;
        
        payNowBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            // ตรวจสอบว่ายอมรับข้อตกลงหรือไม่
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
            
            // ตรวจสอบว่าเลือกวิธีการชำระเงินหรือไม่
            const activeTab = document.querySelector('.payment-tab.active');
            if (!activeTab) {
                alert('กรุณาเลือกวิธีการชำระเงิน');
                return;
            }
            
            const paymentMethod = activeTab.dataset.tab;
            
            // ตรวจสอบความถูกต้องของข้อมูลตามวิธีการชำระเงิน
            if (paymentMethod === 'credit-card') {
                if (!validateCreditCardForm()) {
                    return;
                }
            } else if (paymentMethod === 'e-wallet') {
                if (!validateEWalletForm()) {
                    return;
                }
            }
            
            // แสดง loading state
            const originalBtnText = payNowBtn.innerHTML;
            payNowBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังดำเนินการ...';
            payNowBtn.disabled = true;
            
            try {
                // ถ้ามี bookingId ให้อัพเดทการชำระเงินสำหรับการจองที่มีอยู่แล้ว
                if (bookingId) {
                    // รวบรวมข้อมูลการชำระเงิน
                    const paymentData = {
                        bookingId,
                        paymentMethod,
                        amount: bookingInfo.totalPrice,
                        paymentStatus: 'Completed',
                        paymentDate: new Date().toISOString()
                    };
                    
                    // เพิ่มข้อมูลเพิ่มเติมตามวิธีการชำระเงิน
                    if (paymentMethod === 'credit-card') {
                        paymentData.cardNumber = cardNumberInput.value.replace(/\s/g, '').slice(-4);
                        paymentData.cardHolder = document.getElementById('card-holder')?.value;
                        paymentData.expiryDate = expiryDateInput.value;
                    } else if (paymentMethod === 'e-wallet') {
                        paymentData.walletType = document.querySelector('input[name="wallet"]:checked')?.value;
                        paymentData.walletPhone = document.getElementById('wallet-phone')?.value;
                    }
                    
                    // เรียกใช้ API เพื่อบันทึกการชำระเงิน
                    await apiService.createPayment(bookingId, paymentData);
                    
                    // อัพเดทสถานะการจอง
                    await apiService.updateBookingStatus(bookingId, 'Confirmed');
                    
                    // Redirect ไปยังหน้ายืนยันการจอง
                    window.location.href = `confirmation.html?bookingId=${bookingId}`;
                } 
                // ถ้าไม่มี bookingId ให้สร้างการจองใหม่
                else if (bookingInfo && selectedFlightData && passengerData) {
                    // สมมติว่าผู้ใช้เข้าสู่ระบบแล้ว
                    const userData = localStorage.getItem('userData');
                    let userId = null;
                    
                    if (userData) {
                        try {
                            const user = JSON.parse(userData);
                            userId = user.userId;
                        } catch (error) {
                            console.error('Error parsing user data:', error);
                        }
                    }
                    
                    // ถ้าไม่มี userId ให้ redirect ไปยังหน้าเข้าสู่ระบบ
                    if (!userId) {
                        // บันทึกข้อมูลการจองชั่วคราวเพื่อนำกลับมาใช้หลังจากเข้าสู่ระบบ
                        sessionStorage.setItem('pendingBooking', JSON.stringify({
                            flight: selectedFlightData,
                            passenger: passengerData,
                            seats: selectedSeats,
                            additionalSeatPrice
                        }));
                        
                        alert('กรุณาเข้าสู่ระบบก่อนทำการชำระเงิน');
                        window.location.href = 'login.html?redirect=payment.html';
                        return;
                    }
                    
                    // รวบรวมข้อมูลการจอง
                    const bookingData = {
                        userId,
                        flightId: selectedFlightData.flightId,
                        bookingDate: new Date().toISOString(),
                        bookingStatus: 'Confirmed',
                        totalPrice: bookingInfo.totalPrice,
                        baseFare: bookingInfo.baseFare,
                        taxes: bookingInfo.taxes,
                        additionalServices: bookingInfo.additionalServices,
                        contactEmail: passengerData.contactEmail,
                        contactPhone: passengerData.contactPhone,
                        passengers: [{
                            title: passengerData.title,
                            firstName: passengerData.firstName,
                            lastName: passengerData.lastName,
                            dob: passengerData.dob,
                            nationality: passengerData.nationality,
                            passportNumber: passengerData.passportNumber,
                            seatNumber: selectedSeats.length > 0 ? selectedSeats[0].seatNumber : null,
                            specialService: passengerData.specialService
                        }]
                    };
                    
                    // เรียกใช้ API เพื่อสร้างการจองใหม่
                    const booking = await apiService.createBooking(bookingData, userId, selectedFlightData.flightId);
                    
                    // รวบรวมข้อมูลการชำระเงิน
                    const paymentData = {
                        bookingId: booking.bookingId,
                        paymentMethod,
                        amount: bookingInfo.totalPrice,
                        paymentStatus: 'Completed',
                        paymentDate: new Date().toISOString()
                    };
                    
                    // เพิ่มข้อมูลเพิ่มเติมตามวิธีการชำระเงิน
                    if (paymentMethod === 'credit-card') {
                        paymentData.cardNumber = cardNumberInput.value.replace(/\s/g, '').slice(-4);
                        paymentData.cardHolder = document.getElementById('card-holder')?.value;
                        paymentData.expiryDate = expiryDateInput.value;
                    } else if (paymentMethod === 'e-wallet') {
                        paymentData.walletType = document.querySelector('input[name="wallet"]:checked')?.value;
                        paymentData.walletPhone = document.getElementById('wallet-phone')?.value;
                    }
                    
                    // เรียกใช้ API เพื่อบันทึกการชำระเงิน
                    await apiService.createPayment(booking.bookingId, paymentData);
                    
                    // ล้างข้อมูลการจองที่บันทึกไว้ใน sessionStorage
                    sessionStorage.removeItem('selectedFlight');
                    sessionStorage.removeItem('passengerData');
                    sessionStorage.removeItem('selectedSeats');
                    sessionStorage.removeItem('additionalSeatPrice');
                    
                    // Redirect ไปยังหน้ายืนยันการจอง
                    window.location.href = `confirmation.html?bookingId=${booking.bookingId}`;
                } else {
                    throw new Error('ไม่พบข้อมูลการจอง');
                }
            } catch (error) {
                console.error('Payment error:', error);
                alert('เกิดข้อผิดพลาดในการชำระเงิน: ' + error.message);
                
                // คืนค่าสถานะปุ่ม
                payNowBtn.innerHTML = originalBtnText;
                payNowBtn.disabled = false;
            }
        });
    }
    
    /**
     * ตรวจสอบความถูกต้องของฟอร์มบัตรเครดิต
     */
    function validateCreditCardForm() {
        const cardNumber = cardNumberInput.value.replace(/\s/g, '');
        const cardHolder = document.getElementById('card-holder')?.value;
        const expiryDate = expiryDateInput.value;
        const cvv = cvvInput.value;
        
        if (!cardNumber || cardNumber.length < 16) {
            alert('กรุณากรอกหมายเลขบัตรให้ถูกต้อง');
            cardNumberInput.focus();
            return false;
        }
        
        if (!cardHolder) {
            alert('กรุณากรอกชื่อผู้ถือบัตร');
            document.getElementById('card-holder').focus();
            return false;
        }
        
        if (!expiryDate || expiryDate.length < 5) {
            alert('กรุณากรอกวันหมดอายุบัตรให้ถูกต้อง (MM/YY)');
            expiryDateInput.focus();
            return false;
        }
        
        // ตรวจสอบว่าบัตรหมดอายุหรือไม่
        const [month, year] = expiryDate.split('/');
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100; // ดึง 2 ตัวสุดท้ายของปี
        const currentMonth = currentDate.getMonth() + 1; // getMonth() คืนค่า 0-11
        
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
     * ตรวจสอบความถูกต้องของฟอร์ม E-Wallet
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
     * ตั้งค่ารหัสส่วนลด
     */
    function setupDiscountCode() {
        const discountBtn = document.querySelector('.discount-input button');
        if (!discountBtn) return;
        
        discountBtn.addEventListener('click', function() {
            const discountInput = document.querySelector('.discount-input input');
            const discountCode = discountInput.value.trim();
            
            if (!discountCode) {
                alert('กรุณากรอกรหัสส่วนลด');
                return;
            }
            
            // ตรวจสอบรหัสส่วนลด
            if (discountCode.toUpperCase() === 'SKYPROMO') {
                // คำนวณส่วนลด 10%
                if (bookingInfo) {
                    const discount = Math.round(bookingInfo.totalPrice * 0.1);
                    const newTotal = bookingInfo.totalPrice - discount;
                    
                    // อัพเดทราคารวม
                    const totalItem = document.querySelector('.price-item.total .price-value');
                    if (totalItem) {
                        totalItem.innerHTML = `฿${newTotal.toLocaleString()} <span style="text-decoration: line-through; color: #999; font-size: 0.85em;">฿${bookingInfo.totalPrice.toLocaleString()}</span>`;
                        totalItem.style.color = '#4caf50';
                    }
                    
                    // เพิ่มรายการส่วนลด
                    const priceBreakdown = document.querySelector('.price-breakdown');
                    if (priceBreakdown) {
                        // ตรวจสอบว่ามีรายการส่วนลดอยู่แล้วหรือไม่
                        let discountItem = document.querySelector('.price-item.discount');
                        if (!discountItem) {
                            // สร้างรายการส่วนลดใหม่
                            discountItem = document.createElement('div');
                            discountItem.className = 'price-item discount';
                            discountItem.innerHTML = `
                                <span class="price-label">ส่วนลด (10%):</span>
                                <span class="price-value" style="color: #4caf50;">-฿${discount.toLocaleString()}</span>
                            `;
                            
                            // แทรกรายการส่วนลดก่อนรายการราคารวม
                            const totalItem = document.querySelector('.price-item.total');
                            priceBreakdown.insertBefore(discountItem, totalItem);
                        } else {
                            // อัพเดทรายการส่วนลดที่มีอยู่แล้ว
                            discountItem.querySelector('.price-value').textContent = `-฿${discount.toLocaleString()}`;
                        }
                    }
                    
                    // อัพเดทราคารวมในข้อมูลการจอง
                    bookingInfo.discount = discount;
                    bookingInfo.totalPrice = newTotal;
                }
                
                // แสดงข้อความสำเร็จ
                alert('ใช้รหัสส่วนลดสำเร็จ! คุณได้รับส่วนลด 10%');
                
                // ปิดการใช้งานช่องกรอกรหัสส่วนลด
                discountInput.disabled = true;
                discountBtn.disabled = true;
                discountBtn.innerHTML = 'ใช้แล้ว';
            } else {
                alert('รหัสส่วนลดไม่ถูกต้องหรือหมดอายุ');
            }
        });
    }
    
    /**
     * แสดง loading state
     */
    function showLoadingState() {
        // เพิ่ม loading overlay
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="loading-spinner"></div>
            <p>กำลังโหลดข้อมูล...</p>
        `;
        
        // ปรับแต่ง CSS
        loadingOverlay.style.position = 'fixed';
        loadingOverlay.style.top = '0';
        loadingOverlay.style.left = '0';
        loadingOverlay.style.width = '100%';
        loadingOverlay.style.height = '100%';
        loadingOverlay.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        loadingOverlay.style.display = 'flex';
        loadingOverlay.style.flexDirection = 'column';
        loadingOverlay.style.justifyContent = 'center';
        loadingOverlay.style.alignItems = 'center';
        loadingOverlay.style.zIndex = '9999';
        
        const spinner = loadingOverlay.querySelector('.loading-spinner');
        spinner.style.width = '40px';
        spinner.style.height = '40px';
        spinner.style.border = '4px solid #f3f3f3';
        spinner.style.borderTop = '4px solid var(--primary-color)';
        spinner.style.borderRadius = '50%';
        spinner.style.animation = 'spin 1s linear infinite';
        
        // เพิ่ม keyframes animation
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(styleElement);
        
        // เพิ่ม loading overlay ลงใน body
        document.body.appendChild(loadingOverlay);
    }
    
    /**
     * ซ่อน loading state
     */
    function hideLoadingState() {
        // ลบ loading overlay
        const loadingOverlay = document.querySelector('.loading-overlay');
        if (loadingOverlay) {
            document.body.removeChild(loadingOverlay);
        }
    }
});