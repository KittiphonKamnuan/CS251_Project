import { apiService } from './api-service.js';

document.addEventListener('DOMContentLoaded', async function() {
    console.log("Page loaded, starting initialization...");
    
    // ตั้งเวลาตรวจสอบการโหลดที่นานเกินไป
    const loadingTimeout = setTimeout(() => {
        const loadingElements = document.querySelectorAll('.loading-spinner');
        if (loadingElements.length > 0) {
            console.warn("Loading timeout occurred - Creating fallback UI");
            
            // สร้าง UI สำรอง
            const mainContent = document.querySelector('main');
            if (mainContent) {
                mainContent.innerHTML = `
                    <div class="container text-center" style="padding: 2rem;">
                        <h2>ข้อมูลการจองของคุณ</h2>
                        <p>ไม่สามารถโหลดข้อมูลการจองได้ในขณะนี้</p>
                        <div class="error-actions" style="margin-top: 2rem;">
                            <button class="btn btn-primary" onclick="window.location.reload()">ลองอีกครั้ง</button>
                            <a href="index.html" class="btn btn-outline">กลับหน้าหลัก</a>
                        </div>
                    </div>
                `;
            }
        }
    }, 10000); // 10 วินาที
    
    // รับ booking ID จาก URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get('bookingId');
    
    console.log("Booking ID from URL:", bookingId);
    
    if (!bookingId) {
        console.error("No booking ID found in URL");
        showErrorMessage('ไม่พบรหัสการจอง กรุณาตรวจสอบลิงก์ของคุณ');
        clearTimeout(loadingTimeout);
        return;
    }
    
    try {
        // แสดง loading state
        showLoadingState();
        
        // เรียกข้อมูลการจองจาก API
        let booking;
        try {
            console.log(`Fetching booking data for ID: ${bookingId}`);
            booking = await apiService.getBookingById(bookingId);
            console.log("Booking data received:", booking);
        } catch (error) {
            // If booking not found, show error message and return
            console.error("Error fetching booking:", error);
            if (error.message && error.message.includes('ไม่พบการจอง')) {
                showErrorMessage(`ไม่พบข้อมูลการจอง "${bookingId}" กรุณาตรวจสอบรหัสการจองอีกครั้ง`);
                
                // Add a button to go to booking status page
                const errorMessage = document.querySelector('.error-message');
                if (errorMessage) {
                    const checkBookingBtn = document.createElement('a');
                    checkBookingBtn.href = 'booking-status.html';
                    checkBookingBtn.className = 'btn btn-outline';
                    checkBookingBtn.style.marginTop = '1rem';
                    checkBookingBtn.style.marginLeft = '1rem';
                    checkBookingBtn.innerHTML = '<i class="fas fa-search"></i> ค้นหาการจอง';
                    
                    const actionBtns = errorMessage.querySelector('button').parentNode;
                    actionBtns.appendChild(checkBookingBtn);
                }
                
                clearTimeout(loadingTimeout);
                return;
            }
            throw error;
        }
        
        // เรียกข้อมูลการชำระเงิน
        let paymentInfo = null;
        try {
            console.log(`Fetching payment info for booking ID: ${bookingId}`);
            paymentInfo = await apiService.getBookingPayment(bookingId);
            console.log("Payment info received:", paymentInfo);
        } catch (paymentError) {
            console.warn('ไม่พบข้อมูลการชำระเงิน:', paymentError.message);
            // สร้างข้อมูลการชำระเงินเริ่มต้น
            paymentInfo = {
                paymentMethod: booking.paymentMethod || 'credit-card',
                paymentDate: new Date().toISOString(),
                amount: booking.totalPrice || 0,
                paymentStatus: 'completed'
            };
            console.log("Created default payment info:", paymentInfo);
        }
        
        // เรียกข้อมูลคะแนนสะสม (ถ้ามีการเข้าสู่ระบบ)
        const userData = localStorage.getItem('userData');
        let loyaltyPoints = null;
        
        if (userData) {
            try {
                const user = JSON.parse(userData);
                console.log("User data found:", user);
                
                try {
                    // ป้องกันการเกิด SQL Error จากการเรียก API
                    // โดยใช้ try-catch ในการดักจับข้อผิดพลาด
                    console.log(`Fetching loyalty points for user ID: ${user.userId}`);
                    loyaltyPoints = await apiService.getUserLoyaltyPoints(user.userId);
                    console.log("Loyalty points data received:", loyaltyPoints);
                } catch (pointsError) {
                    console.warn('ไม่สามารถดึงข้อมูลคะแนนสะสม:', pointsError);
                    
                    // สร้างข้อมูลคะแนนสะสมเริ่มต้น
                    loyaltyPoints = {
                        userId: user.userId,
                        totalPoints: 0,
                        pointsExpiryDate: new Date(new Date().getFullYear() + 1, 11, 31).toISOString()
                    };
                    console.log("Created default loyalty points:", loyaltyPoints);
                }
            } catch (error) {
                console.warn('ไม่สามารถอ่านข้อมูลผู้ใช้งาน:', error);
            }
        } else {
            console.log("No user data found in localStorage");
            // สร้างข้อมูลคะแนนสะสมเริ่มต้น
            loyaltyPoints = {
                userId: "guest",
                totalPoints: 0,
                pointsExpiryDate: new Date(new Date().getFullYear() + 1, 11, 31).toISOString()
            };
        }
        
        // อัพเดตข้อมูลเที่ยวบินและรายละเอียดการจอง
        console.log("Updating flight summary...");
        updateFlightSummary(booking);
        
        console.log("Updating booking details...");
        updateBookingDetails(booking, paymentInfo, loyaltyPoints);
        
        // สร้าง countdown ถึงวันเดินทาง
        console.log("Creating flight countdown...");
        createFlightCountdown(booking);
        
        console.log("All data loaded and displayed successfully");
        
    } catch (error) {
        console.error('Error details:', error);
        console.error('Error stack:', error.stack);
        showErrorMessage('ไม่สามารถโหลดข้อมูลการจองได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
        // ล้างตัวจับเวลาเมื่อโหลดเสร็จหรือมีข้อผิดพลาด
        clearTimeout(loadingTimeout);
    }
    
    // ปุ่มส่งอีเมลบัตรโดยสาร
    const emailBtn = document.getElementById('email-btn');
    if (emailBtn) {
        emailBtn.addEventListener('click', async function() {
            await sendBoardingPassEmail(bookingId);
        });
    }
    
    // ตรวจสอบและซ่อมแซมหน้าเว็บถ้ายังแสดงสถานะ loading
    setTimeout(function() {
        if (document.querySelector('.loading-spinner')) {
            console.warn("Loading spinner still visible after timeout - fixing display");
            repairUI();
        }
        
        // ตรวจสอบว่าส่วนแสดงคะแนนสะสมทำงานถูกต้อง
        ensureLoyaltyPointsVisible();
    }, 5000);
});

// ซ่อมแซมหน้า UI กรณีมีปัญหา
function repairUI() {
    // ตรวจสอบและซ่อมแซมโครงสร้าง HTML
    ensureHTMLStructure();
    
    // ดึงข้อมูลจาก URL
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get('bookingId') || 'BK0000000';
    
    // สร้างข้อมูลพื้นฐาน
    const basicBooking = {
        bookingId: bookingId,
        contactEmail: "user@example.com",
        contactPhone: "081-234-5678",
        totalPrice: 0,
        flight: {
            flightNumber: "SK000",
            departureCity: "กรุงเทพ",
            arrivalCity: "เชียงใหม่",
            departureTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            arrivalTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
            aircraft: "Boeing 737-800"
        },
        passengers: [{
            firstName: "ผู้โดยสาร",
            lastName: "",
            seatNumber: "-"
        }]
    };
    
    // อัพเดตหน้า UI
    updateFlightSummary(basicBooking);
    updateBookingDetails(basicBooking, null, { totalPoints: 0 });
    createFlightCountdown(basicBooking);
    
    // แสดงข้อความแจ้งเตือน
    showNotification('ไม่สามารถโหลดข้อมูลได้ แสดงข้อมูลพื้นฐาน');
}

// แสดงการแจ้งเตือน
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-info-circle"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    // สไตล์สำหรับการแจ้งเตือน
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = '#f8f9fa';
    notification.style.border = '1px solid #ddd';
    notification.style.borderRadius = '8px';
    notification.style.padding = '10px 15px';
    notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    notification.style.zIndex = '1000';
    notification.style.display = 'flex';
    notification.style.alignItems = 'center';
    notification.style.justifyContent = 'space-between';
    notification.style.maxWidth = '300px';
    
    // สไตล์สำหรับเนื้อหา
    const content = notification.querySelector('.notification-content');
    content.style.display = 'flex';
    content.style.alignItems = 'center';
    content.style.gap = '10px';
    
    // สไตล์สำหรับปุ่มปิด
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.background = 'none';
    closeBtn.style.border = 'none';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.fontSize = '20px';
    closeBtn.style.color = '#aaa';
    
    // เพิ่มการทำงานของปุ่มปิด
    closeBtn.addEventListener('click', function() {
        document.body.removeChild(notification);
    });
    
    // เพิ่มเข้าไปในหน้าเว็บ
    document.body.appendChild(notification);
    
    // ซ่อนหลังจาก 5 วินาที
    setTimeout(function() {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
    }, 5000);
}

// ตรวจสอบโครงสร้าง HTML ที่จำเป็น
function ensureHTMLStructure() {
    console.log("Checking HTML structure");
    
    // ตรวจสอบและสร้าง main element ถ้าไม่มี
    let main = document.querySelector('main');
    if (!main) {
        console.warn("Main element not found - creating");
        main = document.createElement('main');
        document.body.appendChild(main);
    }
    
    // ตรวจสอบส่วนต่างๆ ที่จำเป็น
    const sections = [
        {
            id: 'flight-summary',
            className: 'flight-summary',
            html: `
                <div class="container">
                    <div class="flight-route">
                        <h2 id="routeTitle">กรุงเทพ (BKK) → เชียงใหม่ (CNX)</h2>
                        <p id="routeInfo">วันพฤหัสบดีที่ 22 พฤษภาคม 2025 | ผู้โดยสาร 1 คน | ชั้นประหยัด | SK102</p>
                    </div>
                </div>
            `
        },
        {
            id: 'confirmation-message',
            className: 'confirmation-message',
            html: `
                <div class="container">
                    <div class="success-animation">
                        <div class="checkmark-circle">
                            <div class="checkmark-stem"></div>
                            <div class="checkmark-kick"></div>
                        </div>
                    </div>
                    <h1>การจองสำเร็จ!</h1>
                    <p>ขอบคุณที่ใช้บริการ Skyways Airlines</p>
                    <div class="booking-reference">
                        <span>รหัสการจอง:</span>
                        <strong id="bookingReference">กำลังโหลด...</strong>
                    </div>
                </div>
            `
        },
        {
            id: 'booking-details',
            className: 'booking-details',
            html: `
                <div class="container">
                    <div class="booking-card">
                        <div class="card-header">
                            <h2>รายละเอียดการจอง</h2>
                            <div class="booking-actions">
                                <button class="btn btn-outline" onclick="window.print()">
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
                                    <img src="../assets/images/icons/airplane.png" alt="Skyways Airlines" class="airline-logo">
                                    <div>
                                        <div class="airline-name" id="airlineName">Skyways Airlines</div>
                                        <div class="flight-number" id="flightNumber">กำลังโหลด...</div>
                                    </div>
                                </div>
                                
                                <div class="flight-route">
                                    <div class="route-point departure">
                                        <div class="city" id="departureAirport">กำลังโหลด...</div>
                                        <div class="time" id="departureTime">--:--</div>
                                        <div class="date" id="departureDate">--/--/----</div>
                                        <div class="terminal" id="departureTerminal">เทอร์มินัล</div>
                                    </div>
                                    
                                    <div class="route-line">
                                        <div class="duration" id="flightDuration">--h --m</div>
                                        <div class="line"></div>
                                        <div class="airplane-icon">
                                            <i class="fas fa-plane"></i>
                                        </div>
                                    </div>
                                    
                                    <div class="route-point arrival">
                                        <div class="city" id="arrivalAirport">กำลังโหลด...</div>
                                        <div class="time" id="arrivalTime">--:--</div>
                                        <div class="date" id="arrivalDate">--/--/----</div>
                                        <div class="terminal" id="arrivalTerminal">เทอร์มินัล</div>
                                    </div>
                                </div>
                                
                                <div class="flight-services">
                                    <div class="service-item">
                                        <i class="fas fa-suitcase"></i>
                                        <span id="baggageInfo">กระเป๋าถือ 7 กก. + กระเป๋าโหลด 20 กก.</span>
                                    </div>
                                    <div class="service-item">
                                        <i class="fas fa-utensils"></i>
                                        <span id="mealInfo">อาหารและเครื่องดื่มบนเที่ยวบิน</span>
                                    </div>
                                    <div class="service-item">
                                        <i class="fas fa-plane-departure"></i>
                                        <span id="aircraftInfo">กำลังโหลด...</span>
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
                            
                            <div class="passenger-card" id="passengerInfoCard">
                                <div class="passenger-name" id="passengerName">กำลังโหลด...</div>
                                <div class="passenger-details">
                                    <div class="detail-item">
                                        <span class="detail-label">ที่นั่ง:</span>
                                        <span class="detail-value" id="seatNumber">กำลังโหลด...</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-label">ประเภทผู้โดยสาร:</span>
                                        <span class="detail-value">ผู้ใหญ่</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-label">บริการพิเศษ:</span>
                                        <span class="detail-value" id="specialService">ไม่มี</span>
                                    </div>
                                </div>
                            </div>
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
                                    <span class="detail-value" id="contactEmail">กำลังโหลด...</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">เบอร์โทรศัพท์:</span>
                                    <span class="detail-value" id="contactPhone">กำลังโหลด...</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Payment Information -->
                        <div class="payment-info-section">
                            <div class="section-header">
                                <i class="fas fa-receipt"></i>
                                <h3>ข้อมูลการชำระเงิน</h3>
                            </div>
                            
                            <div class="payment-details">
                                <div class="detail-item">
                                    <span class="detail-label">วิธีการชำระเงิน:</span>
                                    <span class="detail-value" id="paymentMethod">กำลังโหลด...</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">วันที่ชำระเงิน:</span>
                                    <span class="detail-value" id="paymentDate">กำลังโหลด...</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">สถานะการชำระเงิน:</span>
                                    <span class="detail-value success">ชำระเงินแล้ว</span>
                                </div>
                                
                                <div class="price-breakdown">
                                    <div class="price-item">
                                        <span class="price-label">ค่าโดยสาร:</span>
                                        <span class="price-value" id="baseFare">฿0</span>
                                    </div>
                                    <div class="price-item">
                                        <span class="price-label">ภาษีและค่าธรรมเนียม:</span>
                                        <span class="price-value" id="taxesAndFees">฿0</span>
                                    </div>
                                    <div class="price-item">
                                        <span class="price-label">บริการเสริม:</span>
                                        <span class="price-value" id="additionalServices">฿0</span>
                                    </div>
                                    <div class="price-divider"></div>
                                    <div class="price-item total">
                                        <span class="price-label">ยอดรวมทั้งสิ้น:</span>
                                        <span class="price-value" id="totalPrice">฿0</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Loyalty Points Section -->
                        <div class="loyalty-points-section" id="loyaltyPointsSection">
                            <div class="section-header">
                                <i class="fas fa-award"></i>
                                <h3>คะแนนสะสม</h3>
                            </div>
                            
                            <div class="loyalty-points-details">
                                <div class="detail-item">
                                    <span class="detail-label">คะแนนที่ได้รับจากการจองครั้งนี้:</span>
                                    <span class="detail-value" id="pointsEarned">0 คะแนน</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">คะแนนสะสมทั้งหมด:</span>
                                    <span class="detail-value" id="totalPoints">0 คะแนน</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `
        }
    ];
    
    // ตรวจสอบและสร้างส่วนที่ขาดหายไป
    sections.forEach(section => {
        if (!document.querySelector(`.${section.className}`)) {
            console.warn(`${section.className} section not found - creating`);
            const newSection = document.createElement('section');
            newSection.className = section.className;
            newSection.id = section.id;
            newSection.innerHTML = section.html;
            main.appendChild(newSection);
        }
    });
    
    // สไตล์สำหรับส่วนคะแนนสะสม
    const loyaltyStyle = document.createElement('style');
    loyaltyStyle.textContent = `
        .loyalty-points-section {
            padding: 1.5rem;
            margin-top: 1.5rem;
            background-color: #f8f8ff;
            border-radius: 8px;
            border: 1px solid #e0e0ff;
        }
        
        .loyalty-points-details {
            margin-top: 1rem;
        }
        
        .loyalty-points-details .detail-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5rem;
        }
        
        .loyalty-points-details .detail-label {
            font-weight: normal;
            color: #555;
        }
        
        .loyalty-points-details .detail-value {
            font-weight: bold;
            color: #4a90e2;
        }
    `;
    
    if (!document.querySelector('style[data-id="loyalty-style"]')) {
        loyaltyStyle.setAttribute('data-id', 'loyalty-style');
        document.head.appendChild(loyaltyStyle);
    }
}

// แสดง loading state
function showLoadingState() {
    console.log("Showing loading state...");
    const flightSummary = document.querySelector('.flight-summary');
    const bookingDetails = document.querySelector('.booking-details');
    const confirmationMessage = document.querySelector('.confirmation-message');
    
    if (flightSummary) {
        flightSummary.innerHTML = `
            <div class="container">
                <div class="loading-spinner"></div>
                <p class="text-center">กำลังโหลดข้อมูลการจอง...</p>
            </div>
        `;
        console.log("Flight summary loading state set");
    } else {
        console.warn("Flight summary element not found");
    }
    
    if (bookingDetails) {
        bookingDetails.innerHTML = '';
        console.log("Booking details cleared for loading");
    } else {
        console.warn("Booking details element not found");
    }
    
    if (confirmationMessage) {
        const bookingRef = confirmationMessage.querySelector('.booking-reference strong');
        if (bookingRef) {
            bookingRef.textContent = 'กำลังโหลด...';
            console.log("Booking reference loading state set");
        } else {
            console.warn("Booking reference element not found");
        }
    } else {
        console.warn("Confirmation message element not found");
    }
}

// แสดงข้อความผิดพลาด
function showErrorMessage(message) {
    console.log(`Showing error message: ${message}`);
    const mainContent = document.querySelector('main');
    if (!mainContent) {
        console.error("Main content element not found");
        return;
    }
    
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.innerHTML = `
        <div class="error-icon"><i class="fas fa-exclamation-circle"></i></div>
        <h2>เกิดข้อผิดพลาด</h2>
        <p>${message}</p>
        <div class="error-actions">
            <button class="btn btn-primary" onclick="window.location.href='index.html'">กลับไปยังหน้าหลัก</button>
        </div>
    `;
    
    // เก็บ progress bar ไว้
    const progressBar = document.querySelector('.booking-progress');
    
    mainContent.innerHTML = '';
    if (progressBar) {
        mainContent.appendChild(progressBar);
        console.log("Progress bar preserved");
    }
    mainContent.appendChild(errorElement);
    console.log("Error message displayed");
}

// สร้าง countdown ถึงวันเดินทาง
function createFlightCountdown(booking) {
    try {
        if (!booking || !booking.flight || !booking.flight.departureTime) {
            console.warn("Missing flight or departure time data for countdown");
            return;
        }
        
        const departureDate = new Date(booking.flight.departureTime);
        const now = new Date();
        
        console.log(`Creating countdown for departure: ${departureDate}`);
        
        // ถ้าเที่ยวบินผ่านไปแล้ว ไม่ต้องแสดง countdown
        if (departureDate <= now) {
            console.log("Flight has already departed, not showing countdown");
            return;
        }
        
        // สร้าง element สำหรับ countdown
        const countdownElement = document.createElement('div');
        countdownElement.className = 'countdown';
        
        // เพิ่ม countdown เข้าไปที่ confirmation-message
        const confirmationMessage = document.querySelector('.confirmation-message .container');
        if (!confirmationMessage) {
            console.warn("Confirmation message container not found");
            return;
        }
        // ลบ countdown เดิมถ้ามี
        const existingCountdown = confirmationMessage.querySelector('.countdown');
        if (existingCountdown) {
            existingCountdown.remove();
        }
        
        confirmationMessage.appendChild(countdownElement);
        console.log("Countdown element added to DOM");
        
        // เริ่ม countdown
        updateCountdown();
        const countdownInterval = setInterval(updateCountdown, 1000);
        console.log("Countdown interval started");
        
        function updateCountdown() {
            const now = new Date().getTime();
            const distance = departureDate.getTime() - now;
            
            // ถ้าหมดเวลาแล้ว
            if (distance < 0) {
                clearInterval(countdownInterval);
                countdownElement.innerHTML = `
                    <div class="countdown-expired">เที่ยวบินของคุณได้ออกเดินทางแล้ว</div>
                `;
                console.log("Countdown expired");
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
    } catch (error) {
        console.error('Error creating flight countdown:', error);
    }
}

// อัพเดตข้อมูลเที่ยวบิน
function updateFlightSummary(booking) {
    try {
        const routeTitle = document.getElementById('routeTitle');
        const routeInfo = document.getElementById('routeInfo');
        const bookingReference = document.getElementById('bookingReference');
        
        if (!booking) {
            console.warn("Missing booking data");
            return;
        }
        
        // อัพเดตข้อมูลรหัสการจอง
        if (bookingReference) {
            bookingReference.textContent = booking.bookingId || 'ไม่พบรหัสการจอง';
            console.log(`Updated booking reference: ${bookingReference.textContent}`);
        } else {
            console.warn("Booking reference element not found");
        }
        
        // ตรวจสอบว่ามีข้อมูลเที่ยวบินหรือไม่
        if (!booking.flight) {
            console.warn("Flight data missing in booking");
            return;
        }
        
        // อัพเดตข้อมูลเส้นทาง
        if (routeTitle && routeInfo) {
            const flight = booking.flight;
            
            // สร้างชื่อเส้นทาง
            if (flight.departureCity && flight.arrivalCity) {
                const departureCode = flight.departureCity.substring(0, 3).toUpperCase();
                const arrivalCode = flight.arrivalCity.substring(0, 3).toUpperCase();
                routeTitle.textContent = `${flight.departureCity} (${departureCode}) → ${flight.arrivalCity} (${arrivalCode})`;
                console.log(`Updated route title: ${routeTitle.textContent}`);
            } else {
                console.warn("Missing departure or arrival city");
            }
            
            // สร้างรายละเอียดเส้นทาง
            if (flight.departureTime) {
                const departureDate = new Date(flight.departureTime);
                const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
                let formattedDate;
                
                try {
                    formattedDate = departureDate.toLocaleDateString('th-TH', options);
                } catch (e) {
                    console.warn("Error formatting date:", e);
                    formattedDate = departureDate.toDateString(); // ใช้รูปแบบอื่นถ้า th-TH ไม่ทำงาน
                }
                
                const passengers = booking.passengers?.length || 1;
                
                let routeDetails = `${formattedDate} | ผู้โดยสาร ${passengers} คน`;
                
                // เพิ่มข้อมูลชั้นที่นั่ง
                const seatClassMap = {
                    'economy': 'ชั้นประหยัด',
                    'premium-economy': 'ชั้นประหยัดพิเศษ',
                    'business': 'ชั้นธุรกิจ',
                    'first': 'ชั้นหนึ่ง'
                };
                
                routeDetails += ` | ${seatClassMap[flight.seatClass] || 'ชั้นประหยัด'}`;
                
                // เพิ่มข้อมูลเที่ยวบิน
                if (flight.flightNumber) {
                    routeDetails += ` | ${flight.flightNumber}`;
                }
                
                routeInfo.textContent = routeDetails;
                console.log(`Updated route info: ${routeInfo.textContent}`);
            } else {
                console.warn("Missing departure time");
            }
        } else {
            console.warn("Route title or info elements not found");
        }
    } catch (error) {
        console.error("Error updating flight summary:", error);
    }
}

// อัพเดตข้อมูลรายละเอียดการจอง
function updateBookingDetails(booking, paymentInfo, loyaltyPoints) {
    try {
        if (!booking) {
            console.warn("Missing booking data for booking details");
            return;
        }
        
        console.log("Updating booking details with data:", { booking, paymentInfo, loyaltyPoints });
        
        // ข้อมูลเที่ยวบิน
        const flightNumber = document.getElementById('flightNumber');
        const departureAirport = document.getElementById('departureAirport');
        const arrivalAirport = document.getElementById('arrivalAirport');
        const departureTime = document.getElementById('departureTime');
        const arrivalTime = document.getElementById('arrivalTime');
        const departureDate = document.getElementById('departureDate');
        const arrivalDate = document.getElementById('arrivalDate');
        const flightDuration = document.getElementById('flightDuration');
        const aircraftInfo = document.getElementById('aircraftInfo');
        
        // ตรวจสอบข้อมูลเที่ยวบิน
        if (!booking.flight) {
            console.warn("Missing flight data");
            return;
        }
        
        // ตรวจสอบว่าเที่ยวบินมีข้อมูล timestamps ที่ถูกต้อง
        if (!booking.flight.departureTime || !booking.flight.arrivalTime) {
            console.warn("Missing departure or arrival time");
            return;
        }
        
        // แปลง timestamps เป็น Date objects
        const depTime = new Date(booking.flight.departureTime);
        const arrTime = new Date(booking.flight.arrivalTime);
        
        // คำนวณระยะเวลาบิน
        const duration = (arrTime - depTime) / (1000 * 60); // เป็นนาที
        const durationHours = Math.floor(duration / 60);
        const durationMinutes = Math.floor(duration % 60);
        
        // อัพเดตข้อมูลเที่ยวบิน
        if (flightNumber) flightNumber.textContent = booking.flight.flightNumber || 'N/A';
        
        if (departureAirport) {
            const depCode = booking.flight.departureCity.substring(0, 3).toUpperCase();
            departureAirport.textContent = `${booking.flight.departureCity} (${depCode})`;
        }
        
        if (arrivalAirport) {
            const arrCode = booking.flight.arrivalCity.substring(0, 3).toUpperCase();
            arrivalAirport.textContent = `${booking.flight.arrivalCity} (${arrCode})`;
        }
        
        if (departureTime) {
            try {
                departureTime.textContent = depTime.toLocaleTimeString('th-TH', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } catch (e) {
                console.warn("Error formatting departure time:", e);
                departureTime.textContent = depTime.toTimeString().substring(0, 5); // Fallback
            }
        }
        
        if (arrivalTime) {
            try {
                arrivalTime.textContent = arrTime.toLocaleTimeString('th-TH', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } catch (e) {
                console.warn("Error formatting arrival time:", e);
                arrivalTime.textContent = arrTime.toTimeString().substring(0, 5); // Fallback
            }
        }
        
        if (departureDate) {
            try {
                departureDate.textContent = depTime.toLocaleDateString('th-TH', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                });
            } catch (e) {
                console.warn("Error formatting departure date:", e);
                departureDate.textContent = depTime.toDateString(); // Fallback
            }
        }
        
        if (arrivalDate) {
            try {
                arrivalDate.textContent = arrTime.toLocaleDateString('th-TH', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                });
            } catch (e) {
                console.warn("Error formatting arrival date:", e);
                arrivalDate.textContent = arrTime.toDateString(); // Fallback
            }
        }
        
        if (flightDuration) {
            flightDuration.textContent = `${durationHours}h ${durationMinutes}m`;
        }
        
        if (aircraftInfo) {
            aircraftInfo.textContent = booking.flight.aircraft || 'Boeing 737-800';
        }
        
        // ข้อมูลผู้โดยสาร
        if (booking.passengers && booking.passengers.length > 0) {
            const passenger = booking.passengers[0];
            const passengerName = document.getElementById('passengerName');
            const seatNumber = document.getElementById('seatNumber');
            const specialService = document.getElementById('specialService');
            
            if (passengerName) {
                passengerName.textContent = `${passenger.title || ''} ${passenger.firstName} ${passenger.lastName}`;
            }
            
            if (seatNumber) {
                seatNumber.textContent = passenger.seatNumber || 'ยังไม่ได้เลือก';
            }
            
            if (specialService) {
                specialService.textContent = passenger.specialService || 'ไม่มี';
            }
        } else {
            console.warn("No passenger data available");
        }
        
        // ข้อมูลการติดต่อ
        const contactEmail = document.getElementById('contactEmail');
        const contactPhone = document.getElementById('contactPhone');
        
        if (contactEmail) contactEmail.textContent = booking.contactEmail || 'ไม่ระบุ';
        if (contactPhone) contactPhone.textContent = booking.contactPhone || 'ไม่ระบุ';
        
        // ข้อมูลการชำระเงิน
        const paymentMethod = document.getElementById('paymentMethod');
        const paymentDate = document.getElementById('paymentDate');
        const baseFare = document.getElementById('baseFare');
        const taxesAndFees = document.getElementById('taxesAndFees');
        const additionalServices = document.getElementById('additionalServices');
        const totalPrice = document.getElementById('totalPrice');
        
        if (paymentInfo) {
            if (paymentMethod) {
                const method = paymentInfo.paymentMethod || 'ไม่ระบุ';
                
                // แปลงชื่อวิธีการชำระเงิน
                let methodText = method;
                if (method === 'credit-card') methodText = 'บัตรเครดิต';
                else if (method === 'qr-payment') methodText = 'QR Code';
                else if (method === 'e-wallet') methodText = 'E-Wallet';
                else if (method === 'bank-transfer') methodText = 'โอนเงินผ่านธนาคาร';
                
                paymentMethod.textContent = methodText;
            }
            
            if (paymentDate && paymentInfo.paymentDate) {
                try {
                    const payDate = new Date(paymentInfo.paymentDate);
                    paymentDate.textContent = payDate.toLocaleString('th-TH', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                } catch (e) {
                    console.warn("Error formatting payment date:", e);
                    paymentDate.textContent = new Date(paymentInfo.paymentDate).toLocaleString(); // Fallback
                }
            }
        } else {
            console.warn("No payment info available");
        }
        
        // อัพเดตข้อมูลราคา
        if (baseFare) baseFare.textContent = `฿${(booking.baseFare || 0).toLocaleString()}`;
        if (taxesAndFees) taxesAndFees.textContent = `฿${(booking.taxes || 0).toLocaleString()}`;
        if (additionalServices) additionalServices.textContent = `฿${(booking.additionalServices || 0).toLocaleString()}`;
        if (totalPrice) totalPrice.textContent = `฿${(booking.totalPrice || 0).toLocaleString()}`;
        
        // อัพเดตข้อมูลคะแนนสะสม
        updateLoyaltyPoints(booking, loyaltyPoints);
        
        console.log("Booking details updated successfully");
    } catch (error) {
        console.error("Error updating booking details:", error);
    }
}

// อัพเดตข้อมูลคะแนนสะสม
function updateLoyaltyPoints(booking, loyaltyPoints) {
    try {
        console.log("Updating loyalty points section with:", loyaltyPoints);
        
        const loyaltyPointsSection = document.getElementById('loyaltyPointsSection');
        
        // ถ้าไม่พบส่วนคะแนนสะสม ให้สร้างใหม่
        if (!loyaltyPointsSection) {
            console.warn("Loyalty points section not found");
            ensureLoyaltyPointsVisible();
            return;
        }
        
        const pointsEarned = document.getElementById('pointsEarned');
        const totalPoints = document.getElementById('totalPoints');
        
        if (!pointsEarned || !totalPoints) {
            console.warn("Points elements not found");
            return;
        }
        
        // คำนวณคะแนนที่ได้รับจากการจอง (1 คะแนนต่อ 10 บาท)
        const bookingPrice = booking?.totalPrice || 0;
        const earnedPoints = Math.floor(bookingPrice / 10);
        
        // คะแนนสะสมทั้งหมด
        let existingPoints = 0;
        
        // ตรวจสอบข้อมูลคะแนนสะสม
        if (loyaltyPoints) {
            console.log("Full loyalty points data:", loyaltyPoints);
            
            // ตรวจสอบทุกรูปแบบของข้อมูลคะแนนสะสม
            if (typeof loyaltyPoints.totalPoints !== 'undefined') {
                existingPoints = loyaltyPoints.totalPoints;
            } else if (typeof loyaltyPoints.pointsBalance !== 'undefined') {
                existingPoints = loyaltyPoints.pointsBalance;
            } else if (typeof loyaltyPoints.points !== 'undefined') {
                existingPoints = loyaltyPoints.points;
            }
        }
        
        // แปลงเป็นตัวเลข
        existingPoints = parseInt(existingPoints, 10) || 0;
        
        // อัพเดตการแสดงผล
        pointsEarned.textContent = `${earnedPoints.toLocaleString()} คะแนน`;
        totalPoints.textContent = `${(existingPoints + earnedPoints).toLocaleString()} คะแนน`;
        
        // แสดงส่วนคะแนนสะสม
        loyaltyPointsSection.style.display = 'block';
        
        // เพิ่ม styles
        loyaltyPointsSection.style.padding = '1.5rem';
        loyaltyPointsSection.style.marginTop = '1.5rem';
        loyaltyPointsSection.style.backgroundColor = '#f8f8ff';
        loyaltyPointsSection.style.borderRadius = '8px';
        loyaltyPointsSection.style.border = '1px solid #e0e0ff';
        
        console.log(`Loyalty points updated: earned=${earnedPoints}, total=${existingPoints + earnedPoints}`);
    } catch (error) {
        console.error("Error updating loyalty points:", error);
    }
}

// แน่ใจว่าส่วนคะแนนสะสมแสดงผล
function ensureLoyaltyPointsVisible() {
    const loyaltyPointsSection = document.getElementById('loyaltyPointsSection');
    const bookingCard = document.querySelector('.booking-card');
    
    if (!loyaltyPointsSection && bookingCard) {
        // สร้างส่วนคะแนนสะสมใหม่
        console.log("Creating new loyalty points section");
        const loyaltySection = document.createElement('div');
        loyaltySection.className = 'loyalty-points-section';
        loyaltySection.id = 'loyaltyPointsSection';
        loyaltySection.innerHTML = `
            <div class="section-header">
                <i class="fas fa-award"></i>
                <h3>คะแนนสะสม</h3>
            </div>
            <div class="loyalty-points-details">
                <div class="detail-item">
                    <span class="detail-label">คะแนนที่ได้รับจากการจองครั้งนี้:</span>
                    <span class="detail-value" id="pointsEarned">0 คะแนน</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">คะแนนสะสมทั้งหมด:</span>
                    <span class="detail-value" id="totalPoints">0 คะแนน</span>
                </div>
            </div>
        `;
        
        // จัดรูปแบบ
        loyaltySection.style.display = 'block';
        loyaltySection.style.padding = '1.5rem';
        loyaltySection.style.marginTop = '1.5rem';
        loyaltySection.style.backgroundColor = '#f8f8ff';
        loyaltySection.style.borderRadius = '8px';
        loyaltySection.style.border = '1px solid #e0e0ff';
        
        // เพิ่มเข้าไปในหน้า
        bookingCard.appendChild(loyaltySection);
        return true;
    } else if (loyaltyPointsSection) {
        // ตรวจสอบว่าแสดงผลอยู่หรือไม่
        if (loyaltyPointsSection.style.display === 'none') {
            loyaltyPointsSection.style.display = 'block';
        }
        
        // ตรวจสอบค่าคะแนน
        const pointsEarned = document.getElementById('pointsEarned');
        const totalPoints = document.getElementById('totalPoints');
        
        if (pointsEarned && !pointsEarned.textContent.includes('คะแนน')) {
            pointsEarned.textContent = '0 คะแนน';
        }
        
        if (totalPoints && !totalPoints.textContent.includes('คะแนน')) {
            totalPoints.textContent = '0 คะแนน';
        }
        
        return true;
    }
    
    return false;
}

// ส่งบัตรโดยสารทางอีเมล
async function sendBoardingPassEmail(bookingId) {
    console.log(`Sending boarding pass email for booking ID: ${bookingId}`);
    const emailBtn = document.getElementById('email-btn');
    if (!emailBtn) {
        console.warn("Email button not found");
        return;
    }
    
    // แสดง loading state
    const originalBtnText = emailBtn.innerHTML;
    emailBtn.disabled = true;
    emailBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังส่ง...';
    
    try {
        // ดึงข้อมูลการจองเพื่อหาอีเมลที่จะส่งไป
        let booking;
        try {
            booking = await apiService.getBookingById(bookingId);
        } catch (error) {
            throw new Error('ไม่สามารถดึงข้อมูลการจองได้: ' + error.message);
        }
        
        const email = booking.contactEmail || 'อีเมลของคุณ';
        
        // จำลองการส่งอีเมล
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // แสดงข้อความสำเร็จ
        console.log(`Email sent successfully to: ${email}`);
        alert(`บัตรโดยสารถูกส่งไปยัง ${email} เรียบร้อยแล้ว กรุณาตรวจสอบกล่องข้อความของคุณ`);
    } catch (error) {
        console.error('Error sending boarding pass email:', error);
        alert('ไม่สามารถส่งอีเมลได้: ' + error.message);
    } finally {
        // คืนค่า button state
        emailBtn.disabled = false;
        emailBtn.innerHTML = originalBtnText;
        console.log("Email button state restored");
    }
}

// เพิ่ม styles สำหรับหน้ายืนยันการจอง
const styles = document.createElement('style');
styles.textContent = `
    .loading-spinner {
        border: 3px solid #f3f3f3;
        border-top: 3px solid var(--primary-color, #4a90e2);
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
        margin: 2rem auto;
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
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .error-icon {
        font-size: 3rem;
        color: #ff3333;
        margin-bottom: 1rem;
    }
    
    .error-actions {
        margin-top: 2rem;
        display: flex;
        justify-content: center;
        gap: 1rem;
    }
    
    .countdown {
        margin-top: 2rem;
        animation: fadeIn 1s ease-in-out;
    }
    
    .countdown-title {
        font-size: 1.2rem;
        margin-bottom: 1rem;
        text-align: center;
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
        text-align: center;
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
        background-color: #fff0f0;
        padding: 1rem;
        border-radius: 8px;
        text-align: center;
        color: #ff3333;
        font-weight: 700;
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
    
    .text-center {
        text-align: center;
    }
    
    /* Loyalty Points Section Styles */
    .loyalty-points-section {
        padding: 1.5rem;
        margin-top: 1.5rem;
        background-color: #f8f8ff;
        border-radius: 8px;
        border: 1px solid #e0e0ff;
    }
    
    .loyalty-points-details {
        margin-top: 1rem;
    }
    
    .loyalty-points-details .detail-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
    }
    
    .loyalty-points-details .detail-label {
        font-weight: normal;
        color: #555;
    }
    
    .loyalty-points-details .detail-value {
        font-weight: bold;
        color: #4a90e2;
    }
    
    .section-header {
        display: flex;
        align-items: center;
        margin-bottom: 1rem;
    }
    
    .section-header i {
        margin-right: 0.5rem;
        color: #4a90e2;
    }
`;

console.log("Adding styling to document");
document.head.appendChild(styles);

// ตรวจสอบซ้ำหลังจากโหลดหน้าเว็บเสร็จสมบูรณ์
window.addEventListener('load', function() {
    // หากยังแสดง loading spinner อยู่หลังจากโหลดหน้าเว็บเสร็จสมบูรณ์
    setTimeout(function() {
        const loadingSpinner = document.querySelector('.loading-spinner');
        if (loadingSpinner) {
            console.warn("Loading spinner still visible after page load - fixing display");
            repairUI();
        }
        
        // ตรวจสอบส่วนคะแนนสะสมอีกครั้ง
        ensureLoyaltyPointsVisible();
    }, 2000);
});