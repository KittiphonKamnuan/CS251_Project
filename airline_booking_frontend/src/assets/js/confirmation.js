import { apiService } from './api-service.js';

document.addEventListener('DOMContentLoaded', async function() {
    // รับ booking ID จาก URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get('bookingId');
    
    if (!bookingId) {
        alert('ไม่พบรหัสการจอง กรุณาตรวจสอบลิงก์ของคุณ');
        window.location.href = 'index.html';
        return;
    }
    
    try {
        // แสดง loading state
        showLoadingState();
        
        // เรียกข้อมูลการจองจาก API
        const booking = await apiService.getBookingById(bookingId);
        
        // เรียกข้อมูลการชำระเงิน
        let paymentInfo = null;
        try {
            paymentInfo = await apiService.getBookingPayment(bookingId);
        } catch (paymentError) {
            console.warn('ไม่พบข้อมูลการชำระเงิน:', paymentError);
            // ไม่ต้องแสดงข้อผิดพลาดนี้ เพราะอาจยังไม่มีการชำระเงิน
        }
        
        // เรียกข้อมูลคะแนนสะสม (ถ้ามีการเข้าสู่ระบบ)
        const userData = localStorage.getItem('userData');
        let loyaltyPoints = null;
        if (userData) {
            try {
                const user = JSON.parse(userData);
                loyaltyPoints = await apiService.getUserLoyaltyPoints(user.userId);
            } catch (loyaltyError) {
                console.warn('ไม่พบข้อมูลคะแนนสะสม:', loyaltyError);
                // ไม่ต้องแสดงข้อผิดพลาดนี้ เพราะอาจยังไม่มีคะแนนสะสม
            }
        }
        
        // ตรวจสอบสถานะการจอง และแสดงหน้าที่เหมาะสม
        if (booking.bookingStatus === 'Confirmed') {
            // แสดงหน้ายืนยันการจอง
            displayConfirmation(booking, paymentInfo, loyaltyPoints);
        } else if (booking.bookingStatus === 'Pending') {
            // แสดงหน้ารอการชำระเงิน
            displayPendingPayment(booking);
        } else if (booking.bookingStatus === 'Cancelled') {
            // แสดงหน้าการจองถูกยกเลิก
            displayCancelledBooking(booking);
        } else {
            // แสดงหน้าการจองปกติ
            displayBookingDetails(booking, paymentInfo, loyaltyPoints);
        }
    } catch (error) {
        console.error('Error fetching booking:', error);
        showErrorMessage('ไม่สามารถโหลดข้อมูลการจองได้ กรุณาลองใหม่อีกครั้ง');
    }
    
    // ปุ่มส่งอีเมลบัตรโดยสาร
    const emailBtn = document.getElementById('email-btn');
    if (emailBtn) {
        emailBtn.addEventListener('click', async function() {
            await sendBoardingPassEmail(bookingId);
        });
    }

    // ปุ่มเพิ่มในปฏิทิน
    setupCalendarOptions();
    
    // สร้าง countdown ถึงวันเดินทาง
    createFlightCountdown();
});

// แสดง loading state
function showLoadingState() {
    const mainContent = document.querySelector('main');
    if (!mainContent) return;
    
    const loadingElement = document.createElement('div');
    loadingElement.className = 'loading-container';
    loadingElement.innerHTML = `
        <div class="loading-spinner"></div>
        <p>กำลังโหลดข้อมูลการจอง...</p>
    `;
    
    mainContent.innerHTML = '';
    mainContent.appendChild(loadingElement);
}

// แสดงข้อความผิดพลาด
function showErrorMessage(message) {
    const mainContent = document.querySelector('main');
    if (!mainContent) return;
    
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.innerHTML = `
        <div class="error-icon"><i class="fas fa-exclamation-circle"></i></div>
        <h2>เกิดข้อผิดพลาด</h2>
        <p>${message}</p>
        <button class="btn btn-primary" onclick="window.location.href='index.html'">กลับไปยังหน้าหลัก</button>
    `;
    
    mainContent.innerHTML = '';
    mainContent.appendChild(errorElement);
}

// แสดงหน้ายืนยันการจอง
function displayConfirmation(booking, paymentInfo, loyaltyPoints) {
    const mainContent = document.querySelector('main');
    if (!mainContent) return;
    
    // สร้าง HTML สำหรับหน้ายืนยันการจอง
    mainContent.innerHTML = `
        <div class="booking-progress">
            <div class="progress-container">
                <div class="progress-step completed">
                    <div class="step-number">1</div>
                    <div class="step-label">เลือกเที่ยวบิน</div>
                </div>
                <div class="progress-line completed"></div>
                <div class="progress-step completed">
                    <div class="step-number">2</div>
                    <div class="step-label">ข้อมูลผู้โดยสาร</div>
                </div>
                <div class="progress-line completed"></div>
                <div class="progress-step completed">
                    <div class="step-number">3</div>
                    <div class="step-label">เลือกที่นั่ง</div>
                </div>
                <div class="progress-line completed"></div>
                <div class="progress-step completed">
                    <div class="step-number">4</div>
                    <div class="step-label">ชำระเงิน</div>
                </div>
                <div class="progress-line completed"></div>
                <div class="progress-step active">
                    <div class="step-number">5</div>
                    <div class="step-label">ยืนยันการจอง</div>
                </div>
            </div>
        </div>

        <section class="confirmation-message">
            <div class="container">
                <div class="success-animation">
                    <div class="checkmark-circle">
                        <div class="checkmark-stem"></div>
                        <div class="checkmark-kick"></div>
                    </div>
                </div>
                <h1>การจองสำเร็จ!</h1>
                <p>ขอบคุณที่ใช้บริการ SkyBooking</p>
                <div class="booking-reference">
                    <span>รหัสการจอง:</span>
                    <strong>${booking.bookingId}</strong>
                </div>
            </div>
        </section>
        
        ${generateBookingDetailsHTML(booking, paymentInfo, loyaltyPoints)}
        
        <section class="action-buttons">
            <div class="container">
                <a href="index.html" class="btn btn-primary btn-large">
                    <i class="fas fa-home"></i> กลับหน้าหลัก
                </a>
            </div>
        </section>
    `;
    
    // สร้าง countdown ถึงวันเดินทาง
    createFlightCountdown(booking.flight.departureTime);
}

// แสดงหน้ารอการชำระเงิน
function displayPendingPayment(booking) {
    const mainContent = document.querySelector('main');
    if (!mainContent) return;
    
    mainContent.innerHTML = `
        <div class="booking-progress">
            <div class="progress-container">
                <div class="progress-step completed">
                    <div class="step-number">1</div>
                    <div class="step-label">เลือกเที่ยวบิน</div>
                </div>
                <div class="progress-line completed"></div>
                <div class="progress-step completed">
                    <div class="step-number">2</div>
                    <div class="step-label">ข้อมูลผู้โดยสาร</div>
                </div>
                <div class="progress-line completed"></div>
                <div class="progress-step completed">
                    <div class="step-number">3</div>
                    <div class="step-label">เลือกที่นั่ง</div>
                </div>
                <div class="progress-line completed"></div>
                <div class="progress-step active">
                    <div class="step-number">4</div>
                    <div class="step-label">ชำระเงิน</div>
                </div>
                <div class="progress-line"></div>
                <div class="progress-step">
                    <div class="step-number">5</div>
                    <div class="step-label">ยืนยันการจอง</div>
                </div>
            </div>
        </div>
        
        <section class="pending-payment">
            <div class="container">
                <div class="pending-icon">
                    <i class="fas fa-clock"></i>
                </div>
                <h1>รอการชำระเงิน</h1>
                <p>คุณยังไม่ได้ชำระเงินสำหรับการจองนี้</p>
                <div class="booking-reference">
                    <span>รหัสการจอง:</span>
                    <strong>${booking.bookingId}</strong>
                </div>
                <div class="payment-countdown" id="payment-countdown">
                    <span>เหลือเวลาชำระเงิน: </span>
                    <span class="countdown-timer">23:59:59</span>
                </div>
                <a href="payment.html?bookingId=${booking.bookingId}" class="btn btn-primary btn-large">
                    <i class="fas fa-credit-card"></i> ชำระเงินทันที
                </a>
            </div>
        </section>
        
        ${generateBookingDetailsHTML(booking, null, null)}
        
        <section class="action-buttons">
            <div class="container">
                <a href="index.html" class="btn btn-outline">
                    <i class="fas fa-home"></i> กลับหน้าหลัก
                </a>
                <a href="payment.html?bookingId=${booking.bookingId}" class="btn btn-primary">
                    <i class="fas fa-credit-card"></i> ชำระเงิน
                </a>
            </div>
        </section>
    `;
    
    // เริ่ม countdown การชำระเงิน
    startPaymentCountdown();
}

// แสดงหน้าการจองถูกยกเลิก
function displayCancelledBooking(booking) {
    const mainContent = document.querySelector('main');
    if (!mainContent) return;
    
    mainContent.innerHTML = `
        <section class="cancelled-booking">
            <div class="container">
                <div class="cancelled-icon">
                    <i class="fas fa-times-circle"></i>
                </div>
                <h1>การจองถูกยกเลิก</h1>
                <p>การจองนี้ถูกยกเลิกแล้ว</p>
                <div class="booking-reference">
                    <span>รหัสการจอง:</span>
                    <strong>${booking.bookingId}</strong>
                </div>
            </div>
        </section>
        
        ${generateBookingDetailsHTML(booking, null, null)}
        
        <section class="action-buttons">
            <div class="container">
                <a href="index.html" class="btn btn-primary btn-large">
                    <i class="fas fa-home"></i> กลับหน้าหลัก
                </a>
            </div>
        </section>
    `;
}

// แสดงรายละเอียดการจอง
function displayBookingDetails(booking, paymentInfo, loyaltyPoints) {
    const mainContent = document.querySelector('main');
    if (!mainContent) return;
    
    mainContent.innerHTML = `
        <section class="booking-status-header">
            <div class="container">
                <div class="status-icon ${getStatusIconClass(booking.bookingStatus)}">
                    <i class="${getStatusIcon(booking.bookingStatus)}"></i>
                </div>
                <h1>${getStatusText(booking.bookingStatus)}</h1>
                <div class="booking-reference">
                    <span>รหัสการจอง:</span>
                    <strong>${booking.bookingId}</strong>
                </div>
            </div>
        </section>
        
        ${generateBookingDetailsHTML(booking, paymentInfo, loyaltyPoints)}
        
        <section class="action-buttons">
            <div class="container">
                <a href="index.html" class="btn btn-primary btn-large">
                    <i class="fas fa-home"></i> กลับหน้าหลัก
                </a>
            </div>
        </section>
    `;
    
    // สร้าง countdown ถึงวันเดินทาง ถ้าการจองยืนยันแล้ว
    if (booking.bookingStatus === 'Confirmed') {
        createFlightCountdown(booking.flight.departureTime);
    }
}

// สร้าง HTML สำหรับรายละเอียดการจอง
function generateBookingDetailsHTML(booking, paymentInfo, loyaltyPoints) {
    // แปลงวันที่และเวลา
    const departureTime = new Date(booking.flight.departureTime);
    const arrivalTime = new Date(booking.flight.arrivalTime);
    
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
        month: 'long',
        year: 'numeric'
    });
    
    // คำนวณระยะเวลาเดินทาง
    const durationMs = arrivalTime - departureTime;
    const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
    const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const duration = `${durationHours}h ${durationMinutes}m`;
    
    // สร้าง HTML สำหรับผู้โดยสาร
    const passengersHTML = booking.passengers.map(passenger => `
        <div class="passenger-card">
            <div class="passenger-name">${passenger.title || ''} ${passenger.firstName} ${passenger.lastName}</div>
            <div class="passenger-details">
                <div class="detail-item">
                    <span class="detail-label">ที่นั่ง:</span>
                    <span class="detail-value">${passenger.seatNumber || 'ยังไม่ได้เลือก'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">ประเภทผู้โดยสาร:</span>
                    <span class="detail-value">${getPassengerTypeText(passenger.passengerType)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">บริการพิเศษ:</span>
                    <span class="detail-value">${passenger.specialService || 'ไม่มี'}</span>
                </div>
            </div>
        </div>
    `).join('');
    
    // สร้าง HTML สำหรับรายละเอียดการชำระเงิน
    let paymentHTML = '';
    if (paymentInfo) {
        const paymentDate = new Date(paymentInfo.paymentDate);
        const formattedPaymentDate = paymentDate.toLocaleString('th-TH', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        paymentHTML = `
            <div class="payment-info-section">
                <div class="section-header">
                    <i class="fas fa-receipt"></i>
                    <h3>ข้อมูลการชำระเงิน</h3>
                </div>
                
                <div class="payment-details">
                    <div class="detail-item">
                        <span class="detail-label">วิธีการชำระเงิน:</span>
                        <span class="detail-value">${getPaymentMethodText(paymentInfo.paymentMethod)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">วันที่ชำระเงิน:</span>
                        <span class="detail-value">${formattedPaymentDate}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">สถานะการชำระเงิน:</span>
                        <span class="detail-value ${getPaymentStatusClass(paymentInfo.paymentStatus)}">${getPaymentStatusText(paymentInfo.paymentStatus)}</span>
                    </div>
                    
                    <div class="price-breakdown">
                        <div class="price-item">
                            <span class="price-label">ค่าโดยสาร:</span>
                            <span class="price-value">฿${booking.baseFare?.toLocaleString() || '0'}</span>
                        </div>
                        <div class="price-item">
                            <span class="price-label">ภาษีและค่าธรรมเนียม:</span>
                            <span class="price-value">฿${booking.taxes?.toLocaleString() || '0'}</span>
                        </div>
                        <div class="price-item">
                            <span class="price-label">บริการเสริม:</span>
                            <span class="price-value">฿${booking.additionalServices?.toLocaleString() || '0'}</span>
                        </div>
                        <div class="price-divider"></div>
                        <div class="price-item total">
                            <span class="price-label">ยอดรวมทั้งสิ้น:</span>
                            <span class="price-value">฿${booking.totalPrice.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else if (booking.bookingStatus !== 'Cancelled') {
        // แสดงปุ่มชำระเงินถ้ายังไม่ได้ชำระและการจองยังไม่ถูกยกเลิก
        paymentHTML = `
            <div class="payment-info-section">
                <div class="section-header">
                    <i class="fas fa-receipt"></i>
                    <h3>ข้อมูลการชำระเงิน</h3>
                </div>
                
                <div class="payment-details">
                    <div class="detail-item">
                        <span class="detail-label">สถานะการชำระเงิน:</span>
                        <span class="detail-value waiting">รอการชำระเงิน</span>
                    </div>
                    
                    <div class="price-breakdown">
                        <div class="price-item">
                            <span class="price-label">ค่าโดยสาร:</span>
                            <span class="price-value">฿${booking.baseFare?.toLocaleString() || '0'}</span>
                        </div>
                        <div class="price-item">
                            <span class="price-label">ภาษีและค่าธรรมเนียม:</span>
                            <span class="price-value">฿${booking.taxes?.toLocaleString() || '0'}</span>
                        </div>
                        <div class="price-item">
                            <span class="price-label">บริการเสริม:</span>
                            <span class="price-value">฿${booking.additionalServices?.toLocaleString() || '0'}</span>
                        </div>
                        <div class="price-divider"></div>
                        <div class="price-item total">
                            <span class="price-label">ยอดรวมทั้งสิ้น:</span>
                            <span class="price-value">฿${booking.totalPrice.toLocaleString()}</span>
                        </div>
                    </div>
                    
                    <div class="payment-actions">
                        <a href="payment.html?bookingId=${booking.bookingId}" class="btn btn-primary">
                            <i class="fas fa-credit-card"></i> ชำระเงินทันที
                        </a>
                    </div>
                </div>
            </div>
        `;
    }
    
    // สร้าง HTML สำหรับคะแนนสะสม
    let loyaltyHTML = '';
    if (loyaltyPoints && booking.bookingStatus === 'Confirmed') {
        const pointsForThisBooking = Math.floor(booking.totalPrice / 10); // สมมติว่าได้ 1 คะแนนต่อการใช้จ่าย 10 บาท
        
        loyaltyHTML = `
            <div class="loyalty-points-summary">
                <div class="points-icon">
                    <i class="fas fa-award"></i>
                </div>
                <div class="points-info">
                    <h3>คะแนนสะสม</h3>
                    <p>คุณได้รับ <strong>${pointsForThisBooking} คะแนน</strong> จากการจองครั้งนี้</p>
                    <p>คะแนนสะสมทั้งหมดของคุณ: <strong>${loyaltyPoints.totalPoints} คะแนน</strong></p>
                </div>
            </div>
        `;
    }
    
    // สร้าง HTML สำหรับรายละเอียดการจอง
    return `
        <section class="booking-details">
            <div class="container">
                <div class="booking-card">
                    <div class="card-header">
                        <h2>รายละเอียดการจอง</h2>
                        <div class="booking-actions">
                            <button class="btn btn-outline" id="print-btn" onclick="window.print()">
                                <i class="fas fa-print"></i> พิมพ์
                            </button>
                            <button class="btn btn-primary" id="email-btn">
                                <i class="fas fa-envelope"></i> ส่งอีเมล
                            </button>
                        </div>
                    </div>
                    
                    <!-- Flight Information -->
                    <div class="flight-info-section">
                        <div class="section-header">
                            <i class="fas fa-plane"></i>
                            <h3>ข้อมูลเที่ยวบิน</h3>
                        </div>
                        
                        <div class="flight-details-card">
                            <div class="airline-info">
                                <img src="../assets/images/icons/airplane.svg" alt="${booking.flight.aircraft}" class="airline-logo">
                                <div>
                                    <div class="airline-name">${booking.flight.aircraft}</div>
                                    <div class="flight-number">${booking.flight.flightNumber}</div>
                                </div>
                            </div>
                            
                            <div class="flight-route">
                                <div class="route-point departure">
                                    <div class="city">${booking.flight.departureCity} (${booking.flight.departureCity.substring(0, 3).toUpperCase()})</div>
                                    <div class="time">${formattedDepartureTime}</div>
                                    <div class="date">${formattedDepartureDate}</div>
                                    <div class="terminal">เทอร์มินัล ${booking.flight.departureCity === 'Bangkok' ? 'D' : '1'}</div>
                                </div>
                                
                                <div class="route-line">
                                    <div class="duration">${duration}</div>
                                    <div class="line"></div>
                                    <div class="airplane-icon">
                                        <i class="fas fa-plane"></i>
                                    </div>
                                </div>
                                
                                <div class="route-point arrival">
                                    <div class="city">${booking.flight.arrivalCity} (${booking.flight.arrivalCity.substring(0, 3).toUpperCase()})</div>
                                    <div class="time">${formattedArrivalTime}</div>
                                    <div class="date">${formattedDepartureDate}</div>
                                    <div class="terminal">เทอร์มินัล ${booking.flight.arrivalCity === 'Bangkok' ? 'D' : '1'}</div>
                                </div>
                            </div>
                            
                            <div class="flight-services">
                                <div class="service-item">
                                    <i class="fas fa-suitcase"></i>
                                    <span>กระเป๋าถือ 7 กก. + กระเป๋าโหลด 20 กก.</span>
                                </div>
                                <div class="service-item">
                                    <i class="fas fa-utensils"></i>
                                    <span>อาหารและเครื่องดื่มบนเที่ยวบิน</span>
                                </div>
                                <div class="service-item">
                                    <i class="fas fa-plane-departure"></i>
                                    <span>${booking.flight.aircraft}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Passenger Information -->
                    <div class="passenger-info-section">
                        <div class="section-header">
                            <i class="fas fa-user"></i>
                            <h3>ข้อมูลผู้โดยสาร</h3>
                        </div>
                        
                        ${passengersHTML}
                    </div>
                    
                    <!-- Contact Information -->
                    <div class="contact-info-section">
                        <div class="section-header">
                            <i class="fas fa-address-card"></i>
                            <h3>ข้อมูลติดต่อ</h3>
                        </div>
                        
                        <div class="contact-details">
                            <div class="detail-item">
                                <span class="detail-label">อีเมล:</span>
                                <span class="detail-value">${booking.contactEmail || 'ไม่ระบุ'}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">เบอร์โทรศัพท์:</span>
                                <span class="detail-value">${booking.contactPhone || 'ไม่ระบุ'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Payment Information -->
                    ${paymentHTML}
                    
                    <!-- Important Notes -->
                    <div class="important-notes">
                        <h3><i class="fas fa-exclamation-circle"></i> ข้อควรทราบ</h3>
                        <ul>
                            <li>กรุณามาถึงสนามบินอย่างน้อย 2 ชั่วโมงก่อนเวลาเครื่องออกสำหรับเที่ยวบินในประเทศ</li>
                            <li>ผู้โดยสารต้องแสดงบัตรประชาชนหรือหนังสือเดินทางที่มีอายุการใช้งานเพื่อขึ้นเครื่อง</li>
                            <li>หากต้องการเปลี่ยนแปลงการจอง กรุณาติดต่อเราล่วงหน้าอย่างน้อย 24 ชั่วโมงก่อนเที่ยวบิน</li>
                        </ul>
                    </div>
                </div>
                
                <!-- Loyalty Points Summary -->
                ${loyaltyHTML}
                
                <!-- Next Steps -->
                <div class="next-steps-section">
                    <h2>ขั้นตอนต่อไป</h2>
                    <div class="next-steps-grid">
                        <div class="next-step-card">
                            <div class="next-step-icon">
                                <i class="fas fa-hotel"></i>
                            </div>
                            <h3>จองที่พัก</h3>
                            <p>เลือกจากโรงแรมกว่า 1,000 แห่งทั่วประเทศไทย</p>
                           <a href="#" class="btn btn-outline">จองที่พัก</a>
                       </div>
                       <div class="next-step-card">
                           <div class="next-step-icon">
                               <i class="fas fa-car"></i>
                           </div>
                           <h3>จองรถเช่า</h3>
                           <p>เลือกรถได้หลากหลายรุ่นในราคาพิเศษ</p>
                           <a href="#" class="btn btn-outline">จองรถเช่า</a>
                       </div>
                       <div class="next-step-card">
                           <div class="next-step-icon">
                               <i class="fas fa-umbrella-beach"></i>
                           </div>
                           <h3>กิจกรรมท่องเที่ยว</h3>
                           <p>ค้นพบกิจกรรมท่องเที่ยวที่น่าสนใจในจุดหมายปลายทางของคุณ</p>
                           <a href="#" class="btn btn-outline">ดูกิจกรรม</a>
                       </div>
                   </div>
               </div>
           </div>
       </section>
   `;
}

// สร้าง countdown ถึงวันเดินทาง
function createFlightCountdown(departureTime) {
   if (!departureTime) return;
   
   const departureDate = new Date(departureTime);
   const now = new Date();
   
   // ถ้าเที่ยวบินผ่านไปแล้ว ไม่ต้องแสดง countdown
   if (departureDate <= now) return;
   
   // สร้าง element สำหรับ countdown
   const countdownElement = document.createElement('div');
   countdownElement.className = 'countdown';
   
   // เพิ่ม countdown เข้าไปที่ confirmation-message
   const confirmationMessage = document.querySelector('.confirmation-message .container');
   if (!confirmationMessage) return;
   
   confirmationMessage.appendChild(countdownElement);
   
   // เริ่ม countdown
   updateCountdown();
   const countdownInterval = setInterval(updateCountdown, 1000);
   
   function updateCountdown() {
       const now = new Date().getTime();
       const distance = departureDate.getTime() - now;
       
       // ถ้าหมดเวลาแล้ว
       if (distance < 0) {
           clearInterval(countdownInterval);
           countdownElement.innerHTML = `
               <div class="countdown-expired">เที่ยวบินของคุณได้ออกเดินทางแล้ว</div>
           `;
           return;
       }
       
       // คำนวณวัน ชั่วโมง นาที วินาที
       const days = Math.floor(distance / (1000 * 60 * 60 * 24));
       const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
       const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
       const seconds = Math.floor((distance % (1000 * 60)) / 1000);
       
       // อัพเดท countdown
       countdownElement.innerHTML = `
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
}

// เริ่ม countdown เวลาชำระเงิน
function startPaymentCountdown() {
   const countdownElement = document.getElementById('payment-countdown');
   if (!countdownElement) return;
   
   // สมมติให้เวลาชำระเงินเหลือ 24 ชั่วโมง
   let hours = 23;
   let minutes = 59;
   let seconds = 59;
   
   const updateCountdown = () => {
       countdownElement.querySelector('.countdown-timer').textContent = 
           `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
       
       // ถ้าเวลาเหลือน้อย ให้เปลี่ยนสี
       if (hours === 0 && minutes < 30) {
           countdownElement.style.color = 'var(--danger)';
       }
   };
   
   // อัพเดททุก 1 วินาที
   const countdownInterval = setInterval(() => {
       seconds--;
       
       if (seconds < 0) {
           seconds = 59;
           minutes--;
           
           if (minutes < 0) {
               minutes = 59;
               hours--;
               
               if (hours < 0) {
                   // หมดเวลา
                   clearInterval(countdownInterval);
                   countdownElement.innerHTML = '<span style="color: var(--danger);">หมดเวลาชำระเงิน</span>';
                   return;
               }
           }
       }
       
       updateCountdown();
   }, 1000);
   
   // อัพเดทครั้งแรก
   updateCountdown();
}

// ส่งบัตรโดยสารทางอีเมล
async function sendBoardingPassEmail(bookingId) {
   const emailBtn = document.getElementById('email-btn');
   if (!emailBtn) return;
   
   // แสดง loading state
   const originalBtnText = emailBtn.innerHTML;
   emailBtn.disabled = true;
   emailBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังส่ง...';
   
   try {
       // ในกรณีที่มี API สำหรับส่งอีเมล (ยังไม่มีใน api-service)
       // สามารถเพิ่ม method ใน api-service และเรียกใช้ได้ดังนี้
       // await apiService.sendBoardingPassEmail(bookingId);
       
       // จำลองการส่งอีเมล
       await new Promise(resolve => setTimeout(resolve, 1500));
       
       // ดึงข้อมูลการจองเพื่อหาอีเมลที่จะส่งไป
       const booking = await apiService.getBookingById(bookingId);
       const email = booking.contactEmail || 'อีเมลของคุณ';
       
       // แสดงข้อความสำเร็จ
       alert(`บัตรโดยสารถูกส่งไปยัง ${email} เรียบร้อยแล้ว กรุณาตรวจสอบกล่องข้อความของคุณ`);
   } catch (error) {
       console.error('Error sending boarding pass email:', error);
       alert('ไม่สามารถส่งอีเมลได้ กรุณาลองใหม่อีกครั้ง');
   } finally {
       // คืนค่า button state
       emailBtn.disabled = false;
       emailBtn.innerHTML = originalBtnText;
   }
}

// ตั้งค่าตัวเลือกเพิ่มลงในปฏิทิน
function setupCalendarOptions() {
   // สร้างปุ่มเพิ่มในปฏิทิน
   const addToCalendarBtn = document.createElement('button');
   addToCalendarBtn.className = 'btn btn-outline';
   addToCalendarBtn.innerHTML = '<i class="fas fa-calendar-plus"></i> เพิ่มลงในปฏิทิน';
   
   // เพิ่มปุ่มไว้ใน booking-actions
   const bookingActions = document.querySelector('.booking-actions');
   if (bookingActions) {
       bookingActions.prepend(addToCalendarBtn);
       
       // เพิ่ม event listener
       addToCalendarBtn.addEventListener('click', function() {
           showCalendarOptions();
       });
   }
}

// แสดงตัวเลือกปฏิทิน
function showCalendarOptions() {
   // สร้าง dropdown menu
   const dropdown = document.createElement('div');
   dropdown.className = 'calendar-dropdown';
   dropdown.innerHTML = `
       <a href="#" data-calendar="google">Google Calendar</a>
       <a href="#" data-calendar="apple">Apple Calendar</a>
       <a href="#" data-calendar="outlook">Outlook</a>
   `;
   
   // กำหนดตำแหน่งและสไตล์
   const addToCalendarBtn = document.querySelector('.booking-actions button');
   if (!addToCalendarBtn) return;
   
   const rect = addToCalendarBtn.getBoundingClientRect();
   dropdown.style.position = 'absolute';
   dropdown.style.top = (rect.bottom + window.scrollY) + 'px';
   dropdown.style.left = (rect.left + window.scrollX) + 'px';
   dropdown.style.zIndex = '1000';
   dropdown.style.backgroundColor = 'white';
   dropdown.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
   dropdown.style.borderRadius = '4px';
   dropdown.style.padding = '0.5rem 0';
   
   // จัดการสไตล์ของลิงก์
   const links = dropdown.querySelectorAll('a');
   links.forEach(link => {
       link.style.display = 'block';
       link.style.padding = '0.5rem 1rem';
       link.style.color = '#333';
       link.style.textDecoration = 'none';
       
       // เพิ่ม hover effect
       link.addEventListener('mouseover', () => {
           link.style.backgroundColor = '#f5f5f5';
       });
       link.addEventListener('mouseout', () => {
           link.style.backgroundColor = 'transparent';
       });
       
       // เพิ่ม event listener
       link.addEventListener('click', (e) => {
           e.preventDefault();
           const calendarType = link.getAttribute('data-calendar');
           addToCalendar(calendarType);
           document.body.removeChild(dropdown);
       });
   });
   
   // เพิ่ม dropdown ลงใน body
   document.body.appendChild(dropdown);
   
   // ปิด dropdown เมื่อคลิกนอก dropdown
   const closeDropdown = (e) => {
       if (!dropdown.contains(e.target) && e.target !== addToCalendarBtn) {
           document.body.removeChild(dropdown);
           document.removeEventListener('click', closeDropdown);
       }
   };
   
   // ใช้ setTimeout เพื่อหลีกเลี่ยงการทริกเกอร์ทันที
   setTimeout(() => {
       document.addEventListener('click', closeDropdown);
   }, 0);
}

// เพิ่มเที่ยวบินลงในปฏิทิน
function addToCalendar(calendarType) {
   // ในงานจริง จะสร้าง URL สำหรับปฏิทินแต่ละประเภท
   // และเปิดลิงก์นั้นเพื่อเพิ่มลงในปฏิทิน
   
   // แสดงข้อความยืนยัน
   alert(`เพิ่มเที่ยวบินลงใน ${calendarType} เรียบร้อยแล้ว!`);
}

// Helper functions

// ได้ class ไอคอนตามสถานะ
function getStatusIconClass(status) {
   switch (status) {
       case 'Confirmed': return 'confirmed';
       case 'Pending': return 'pending';
       case 'Cancelled': return 'cancelled';
       case 'Completed': return 'completed';
       case 'Refunded': return 'refunded';
       default: return '';
   }
}

// ได้ไอคอนตามสถานะ
function getStatusIcon(status) {
   switch (status) {
       case 'Confirmed': return 'fas fa-check-circle';
       case 'Pending': return 'fas fa-clock';
       case 'Cancelled': return 'fas fa-times-circle';
       case 'Completed': return 'fas fa-check-double';
       case 'Refunded': return 'fas fa-undo';
       default: return 'fas fa-info-circle';
   }
}

// ได้ข้อความตามสถานะ
function getStatusText(status) {
   switch (status) {
       case 'Confirmed': return 'การจองยืนยันแล้ว';
       case 'Pending': return 'รอการชำระเงิน';
       case 'Cancelled': return 'การจองถูกยกเลิก';
       case 'Completed': return 'เดินทางเสร็จสิ้น';
       case 'Refunded': return 'คืนเงินแล้ว';
       default: return status;
   }
}

// ได้ข้อความตามประเภทผู้โดยสาร
function getPassengerTypeText(type) {
   switch (type) {
       case 'ADULT': return 'ผู้ใหญ่';
       case 'CHILD': return 'เด็ก';
       case 'INFANT': return 'ทารก';
       default: return 'ผู้ใหญ่';
   }
}

// ได้ข้อความตามวิธีการชำระเงิน
function getPaymentMethodText(method) {
   switch (method) {
       case 'CREDIT_CARD': return 'บัตรเครดิต (XXXX-XXXX-XXXX-1234)';
       case 'BANK_TRANSFER': return 'โอนเงินผ่านธนาคาร';
       case 'QR_PAYMENT': return 'ชำระผ่าน QR Code';
       case 'E_WALLET': return 'E-Wallet';
       default: return method;
   }
}

// ได้ข้อความตามสถานะการชำระเงิน
function getPaymentStatusText(status) {
   switch (status) {
       case 'Pending': return 'รอการชำระเงิน';
       case 'Completed': return 'ชำระเงินแล้ว';
       case 'Failed': return 'การชำระเงินล้มเหลว';
       case 'Refunded': return 'คืนเงินแล้ว';
       default: return status;
   }
}

// ได้ class ตามสถานะการชำระเงิน
function getPaymentStatusClass(status) {
   switch (status) {
       case 'Pending': return 'waiting';
       case 'Completed': return 'success';
       case 'Failed': return 'danger';
       case 'Refunded': return 'refunded';
       default: return '';
   }
}

// เพิ่ม styles สำหรับหน้ายืนยันการจอง
const styles = document.createElement('style');
styles.textContent = `
   .loading-container {
       display: flex;
       flex-direction: column;
       align-items: center;
       justify-content: center;
       min-height: 300px;
       padding: 2rem;
   }
   
   .loading-spinner {
       border: 3px solid #f3f3f3;
       border-top: 3px solid var(--primary-color);
       border-radius: 50%;
       width: 40px;
       height: 40px;
       animation: spin 1s linear infinite;
       margin-bottom: 1rem;
   }
   
   @keyframes spin {
       0% { transform: rotate(0deg); }
       100% { transform: rotate(360deg); }
   }
   
   .error-message {
       text-align: center;
       padding: 3rem;
       margin: 2rem auto;
       background-color: #fff0f0;
       border-radius: 8px;
       max-width: 600px;
   }
   
   .error-icon {
       font-size: 3rem;
       color: #ff3333;
       margin-bottom: 1rem;
   }
   
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
   
   .pending-payment {
       text-align: center;
       padding: 3rem 0;
   }
   
   .pending-icon {
       font-size: 3rem;
       color: #ff9900;
       margin-bottom: 1rem;
   }
   
   .payment-countdown {
       margin: 1.5rem 0;
       padding: 1rem;
       background-color: #f8f8f8;
       border-radius: 8px;
       font-size: 1.2rem;
       font-weight: 700;
   }
   
   .cancelled-booking {
       text-align: center;
       padding: 3rem 0;
   }
   
   .cancelled-icon {
       font-size: 3rem;
       color: #ff3333;
       margin-bottom: 1rem;
   }
   
   .booking-status-header {
       text-align: center;
       padding: 3rem 0;
       background-color: #f8f8f8;
   }
   
   .status-icon {
       font-size: 3rem;
       margin-bottom: 1rem;
   }
   
   .status-icon.confirmed {
       color: #4caf50;
   }
   
   .status-icon.pending {
       color: #ff9900;
   }
   
   .status-icon.cancelled {
       color: #ff3333;
   }
   
   .status-icon.completed {
       color: #4caf50;
   }
   
   .status-icon.refunded {
       color: #2196f3;
   }
   
   .calendar-dropdown {
       min-width: 200px;
   }
   
   @keyframes fadeIn {
       from { opacity: 0; transform: translateY(20px); }
       to { opacity: 1; transform: translateY(0); }
   }
   
   @media print {
       header, footer, .booking-progress, .action-buttons, .next-steps-section, .booking-actions {
           display: none !important;
       }
       
       .booking-card {
           box-shadow: none !important;
           border: 1px solid #ddd !important;
       }
   }
`;
document.head.appendChild(styles);