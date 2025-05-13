import { apiService } from './api-service.js';

document.addEventListener('DOMContentLoaded', function() {
    // ตรวจสอบสถานะการเข้าสู่ระบบ
    const userData = localStorage.getItem('userData');
    let userObj = null;
    
    if (userData) {
        try {
            userObj = JSON.parse(userData);
            // ถ้ามีข้อมูลผู้ใช้ ให้แสดงการจองของผู้ใช้นั้น
            loadUserBookings(userObj.userId);
        } catch (e) {
            console.error('Error parsing user data:', e);
        }
    }
    
    // Element references
    const bookingSearchForm = document.getElementById('booking-search-form');
    const upcomingBookings = document.getElementById('upcoming-bookings');
    const pastBookings = document.getElementById('past-bookings');
    const noResults = document.getElementById('no-results');
    
    // ตั้งค่า sort dropdown
    const sortSelect = document.getElementById('sort-by');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            if (userObj) {
                // ถ้าผู้ใช้เข้าสู่ระบบแล้ว เรียงลำดับการจองที่แสดงอยู่
                sortBookings(this.value);
            }
        });
    }
    
    // ค้นหาการจอง
    if (bookingSearchForm) {
        bookingSearchForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const bookingReference = document.getElementById('booking-reference').value.trim();
            const lastName = document.getElementById('last-name').value.trim();
            
            if (!bookingReference || !lastName) {
                alert('กรุณากรอกรหัสการจองและนามสกุลของคุณ');
                return;
            }
            
            // แสดง loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังค้นหา...';
            
            try {
                // เรียกใช้ API เพื่อค้นหาการจอง
                const booking = await apiService.getBookingById(bookingReference);
                
                // ตรวจสอบว่าการจองนี้มีผู้โดยสารที่มีนามสกุลตรงกับที่ค้นหาหรือไม่
                const passengerFound = booking.passengers.some(
                    passenger => passenger.lastName.toLowerCase() === lastName.toLowerCase()
                );
                
                if (passengerFound) {
                    // แสดงผลการจอง
                    displayBookingResult(booking);
                } else {
                    // ไม่พบผู้โดยสารที่มีนามสกุลนี้ในการจอง
                    showNoResults();
                }
            } catch (error) {
                console.error('Error fetching booking:', error);
                showNoResults();
            } finally {
                // คืนค่า button state
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }
    
    // โหลดการจองของผู้ใช้
    async function loadUserBookings(userId) {
        try {
            // แสดง loading state
            const loadingIndicator = document.createElement('div');
            loadingIndicator.className = 'loading-indicator';
            loadingIndicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังโหลดข้อมูลการจอง...';
            
            if (upcomingBookings) {
                upcomingBookings.querySelector('.container').appendChild(loadingIndicator.cloneNode(true));
            }
            
            // เรียกใช้ API เพื่อดึงการจองของผู้ใช้
            const bookings = await apiService.getUserBookings(userId);
            
            // ลบ loading indicator
            document.querySelectorAll('.loading-indicator').forEach(el => el.remove());
            
            if (bookings.length > 0) {
                // แยกการจองเป็นที่กำลังจะเกิดขึ้นและที่ผ่านมาแล้ว
                const now = new Date();
                const upcoming = [];
                const past = [];
                
                bookings.forEach(booking => {
                    // ตรวจสอบว่ามี flight และ departureTime หรือไม่
                    if (booking.flight && booking.flight.departureTime) {
                        const departureTime = new Date(booking.flight.departureTime);
                        if (departureTime > now) {
                            upcoming.push(booking);
                        } else {
                            past.push(booking);
                        }
                    }
                });
                
                // แสดงผล
                if (upcoming.length > 0) {
                    displayBookingsList(upcoming, 'upcoming-bookings');
                } else if (upcomingBookings) {
                    upcomingBookings.querySelector('.booking-cards').innerHTML = 
                        '<div class="no-bookings">คุณไม่มีการจองที่กำลังจะเดินทาง</div>';
                }
                
                if (past.length > 0) {
                    displayBookingsList(past, 'past-bookings');
                } else if (pastBookings) {
                    pastBookings.querySelector('.booking-cards').innerHTML = 
                        '<div class="no-bookings">คุณไม่มีประวัติการเดินทาง</div>';
                }
            } else {
                // ไม่มีการจอง
                if (upcomingBookings) {
                    upcomingBookings.querySelector('.booking-cards').innerHTML = 
                        '<div class="no-bookings">คุณไม่มีการจองที่กำลังจะเดินทาง</div>';
                }
                
                if (pastBookings) {
                    pastBookings.querySelector('.booking-cards').innerHTML = 
                        '<div class="no-bookings">คุณไม่มีประวัติการเดินทาง</div>';
                }
            }
        } catch (error) {
            console.error('Error loading user bookings:', error);
            
            // แสดงข้อความผิดพลาด
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.innerHTML = '<i class="fas fa-exclamation-triangle"></i> เกิดข้อผิดพลาดในการโหลดข้อมูลการจอง';
            
            if (upcomingBookings) {
                upcomingBookings.querySelector('.booking-cards').innerHTML = '';
                upcomingBookings.querySelector('.container').appendChild(errorMessage.cloneNode(true));
            }
            
            if (pastBookings) {
                pastBookings.querySelector('.booking-cards').innerHTML = '';
                pastBookings.querySelector('.container').appendChild(errorMessage.cloneNode(true));
            }
        }
    }
    
    // แสดงผลรายการจอง
    function displayBookingsList(bookings, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const bookingCardsContainer = container.querySelector('.booking-cards');
        if (!bookingCardsContainer) return;
        
        // ล้างข้อมูลเดิม
        bookingCardsContainer.innerHTML = '';
        
        // เพิ่มการ์ดการจองแต่ละรายการ
        bookings.forEach(booking => {
            bookingCardsContainer.appendChild(createBookingCard(booking));
        });
        
        // แสดง container
        container.style.display = 'block';
        
        // ทำให้สามารถเรียงลำดับได้
        storeSortableBookings(bookings, containerId);
    }
    
    // แสดงผลลัพธ์การค้นหาการจอง
    function displayBookingResult(booking) {
        const now = new Date();
        const departureTime = new Date(booking.flight.departureTime);
        const isPastBooking = departureTime < now;
        
        // ล้างข้อมูลที่แสดงอยู่
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
        
        // แสดงผลการจอง
        const bookingCard = createBookingCard(booking);
        
        if (isPastBooking) {
            if (pastBookings) {
                pastBookings.querySelector('.booking-cards').appendChild(bookingCard);
            }
        } else {
            if (upcomingBookings) {
                upcomingBookings.querySelector('.booking-cards').appendChild(bookingCard);
            }
        }
        
        // เน้นการ์ดที่แสดง
        bookingCard.classList.add('highlight');
        bookingCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // ลบการเน้นหลังจากผ่านไปสักครู่
        setTimeout(() => {
            bookingCard.classList.remove('highlight');
        }, 3000);
    }
    
    // แสดงว่าไม่พบการจอง
    function showNoResults() {
        if (upcomingBookings) upcomingBookings.style.display = 'none';
        if (pastBookings) pastBookings.style.display = 'none';
        if (noResults) noResults.style.display = 'block';
        
        // เลื่อนไปยังข้อความแจ้งว่าไม่พบ
        if (noResults) {
            noResults.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    // สร้างการ์ดการจอง
    function createBookingCard(booking) {
        const card = document.createElement('div');
        card.className = 'booking-card';
        card.dataset.bookingId = booking.bookingId;
        
        // กำหนด CSS class ตามสถานะการจอง
        if (booking.bookingStatus === 'Completed') {
            card.classList.add('past');
        }
        
        // แปลงวันที่และเวลาให้อยู่ในรูปแบบที่ต้องการ
        const bookingDate = new Date(booking.bookingDate);
        const formattedBookingDate = bookingDate.toLocaleDateString('th-TH', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
        
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
            month: 'short',
            year: 'numeric'
        });
        
        // คำนวณระยะเวลาเดินทาง
        const durationMs = arrivalTime - departureTime;
        const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
        const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        const duration = `${durationHours}h ${durationMinutes}m`;
        
        // กำหนดสถานะการจอง
        let statusClass, statusText;
        switch (booking.bookingStatus) {
            case 'Confirmed':
                statusClass = 'active';
                statusText = 'การจองยืนยันแล้ว';
                break;
            case 'Pending':
                statusClass = 'waiting';
                statusText = 'รอการชำระเงิน';
                break;
            case 'Cancelled':
                statusClass = 'cancelled';
                statusText = 'ยกเลิกแล้ว';
                break;
            case 'Completed':
                statusClass = 'completed';
                statusText = 'เดินทางเสร็จสิ้น';
                break;
            case 'Refunded':
                statusClass = 'refunded';
                statusText = 'คืนเงินแล้ว';
                break;
            default:
                statusClass = '';
                statusText = booking.bookingStatus;
        }
        
        // กำหนดเนื้อหา HTML ของการ์ด
        card.innerHTML = `
            <div class="booking-status ${statusClass}">
                <span class="status-indicator"></span>
                <span class="status-text">${statusText}</span>
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
                    <img src="../assets/images/icons/airplane.svg" alt="${booking.flight.aircraft}" class="airline-logo">
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
                    <i class="fas fa-chair"></i> ที่นั่ง: ${getSeatList(booking.passengers)}
                </div>
            </div>
            <div class="booking-actions">
                <button class="btn btn-outline btn-sm" onclick="window.location.href='confirmation.html?bookingId=${booking.bookingId}'">
                    <i class="fas fa-eye"></i> ดูรายละเอียด
                </button>
                ${getBookingActionButtons(booking)}
            </div>
        `;
        
        // เพิ่ม countdown timer ถ้าเป็นการรอชำระเงิน
        if (booking.bookingStatus === 'Pending') {
            // สร้าง element สำหรับ countdown
            const countdownElement = document.createElement('div');
            countdownElement.className = 'payment-countdown';
            countdownElement.innerHTML = '<i class="fas fa-clock"></i> เหลือเวลาชำระเงิน: 23:59:59';
            
            // เพิ่ม countdown ไว้ด้านบนของ booking-actions
            const bookingActions = card.querySelector('.booking-actions');
            bookingActions.prepend(countdownElement);
            
            // เริ่ม countdown
            startCountdown(countdownElement);
        }
        
        // เพิ่ม event listeners กับปุ่มต่างๆ
        setTimeout(() => {
            const detailsButton = card.querySelector('.btn-outline.btn-sm');
            if (detailsButton) {
                detailsButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    window.location.href = `confirmation.html?bookingId=${booking.bookingId}`;
                });
            }
            
            // ปุ่มพิมพ์บัตรโดยสาร
            const printButton = card.querySelector('.print-button');
            if (printButton) {
                printButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    printBoardingPass(booking);
                });
            }
            
            // ปุ่มชำระเงิน
            const payButton = card.querySelector('.pay-button');
            if (payButton) {
                payButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    window.location.href = `payment.html?bookingId=${booking.bookingId}`;
                });
            }
            
            // ปุ่มแก้ไขการจอง
            const editButton = card.querySelector('.edit-button');
            if (editButton) {
                editButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    window.location.href = `edit-booking.html?bookingId=${booking.bookingId}`;
                });
            }
            
            // ปุ่มยกเลิกการจอง
            const cancelButton = card.querySelector('.cancel-button');
            if (cancelButton) {
                cancelButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    confirmCancelBooking(booking.bookingId);
                });
            }
        }, 0);
        
        return card;
    }
    
    // ได้รายการที่นั่งของผู้โดยสาร
    function getSeatList(passengers) {
        if (!passengers || passengers.length === 0) return 'ยังไม่ได้เลือก';
        
        const seats = passengers
            .map(p => p.seatNumber || 'ยังไม่ได้เลือก')
            .filter(s => s !== 'ยังไม่ได้เลือก');
        
        return seats.length > 0 ? seats.join(', ') : 'ยังไม่ได้เลือก';
    }
    
    // ได้ปุ่มสำหรับการจัดการการจอง ขึ้นอยู่กับสถานะการจอง
    function getBookingActionButtons(booking) {
        const now = new Date();
        const departureTime = new Date(booking.flight.departureTime);
        const isPastFlight = departureTime <= now;
        
        // ไม่สามารถดำเนินการใดๆ กับการจองที่ผ่านไปแล้ว ยกเว้นการดูรายละเอียดและพิมพ์
        if (isPastFlight) {
            return `
                <button class="btn btn-outline btn-sm print-button">
                    <i class="fas fa-print"></i> พิมพ์บัตรโดยสาร
                </button>
                <button class="btn btn-primary btn-sm">
                    <i class="fas fa-share-alt"></i> แชร์การเดินทาง
                </button>
            `;
        }
        
        // ดำเนินการตามสถานะการจอง
        switch (booking.bookingStatus) {
            case 'Pending':
                return `
                    <button class="btn btn-success btn-sm pay-button">
                        <i class="fas fa-credit-card"></i> ชำระเงิน
                    </button>
                    <button class="btn btn-danger btn-sm cancel-button">
                        <i class="fas fa-times"></i> ยกเลิกการจอง
                    </button>
                `;
            case 'Confirmed':
                return `
                    <button class="btn btn-outline btn-sm print-button">
                        <i class="fas fa-print"></i> พิมพ์บัตรโดยสาร
                    </button>
                    <button class="btn btn-primary btn-sm edit-button">
                        <i class="fas fa-pen"></i> แก้ไขการจอง
                    </button>
                    <button class="btn btn-danger btn-sm cancel-button">
                        <i class="fas fa-times"></i> ยกเลิกการจอง
                    </button>
                `;
            case 'Cancelled':
            case 'Refunded':
                return ''; // ไม่มีปุ่มสำหรับการจองที่ยกเลิกหรือคืนเงินแล้ว
            default:
                return '';
        }
    }
    
    // เริ่ม countdown timer สำหรับการชำระเงิน
    function startCountdown(countdownElement) {
        // สมมติให้เวลาชำระเงินเหลือ 24 ชั่วโมง
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
                        // หมดเวลาชำระเงิน
                        clearInterval(countdownInterval);
                        countdownElement.innerHTML = '<i class="fas fa-exclamation-circle"></i> หมดเวลาชำระเงิน';
                        countdownElement.style.color = 'var(--danger)';
                        return;
                    }
                }
            }
            
            // อัพเดท UI
            const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            countdownElement.innerHTML = `<i class="fas fa-clock"></i> เหลือเวลาชำระเงิน: ${timeStr}`;
            
            // เปลี่ยนสีถ้าเหลือเวลาน้อย
            if (hours === 0 && minutes < 30) {
                countdownElement.style.color = 'var(--danger)';
            }
        }, 1000);
    }
    
    // ยืนยันการยกเลิกการจอง
    function confirmCancelBooking(bookingId) {
        if (window.confirm('คุณต้องการยกเลิกการจองนี้ใช่หรือไม่?')) {
            cancelBooking(bookingId);
        }
    }
    
    // ยกเลิกการจอง
    async function cancelBooking(bookingId) {
        try {
            // เรียกใช้ API เพื่อยกเลิกการจอง
            await apiService.cancelBooking(bookingId);
            
            // แสดงข้อความสำเร็จ
            alert('ยกเลิกการจองเรียบร้อยแล้ว');
            
            // โหลดข้อมูลใหม่
            if (userObj) {
                loadUserBookings(userObj.userId);
            } else {
                // ถ้าไม่ได้เข้าสู่ระบบ อัพเดทการ์ดการจองที่แสดงอยู่
                const bookingCard = document.querySelector(`.booking-card[data-booking-id="${bookingId}"]`);
                if (bookingCard) {
                    const statusElement = bookingCard.querySelector('.booking-status');
                    if (statusElement) {
                        statusElement.className = 'booking-status cancelled';
                        statusElement.querySelector('.status-text').textContent = 'ยกเลิกแล้ว';
                    }
                    
                    const actionsElement = bookingCard.querySelector('.booking-actions');
                    if (actionsElement) {
                        // ลบปุ่มทั้งหมดยกเว้นปุ่มดูรายละเอียด
                        const detailsButton = actionsElement.querySelector('.btn-outline.btn-sm');
                        actionsElement.innerHTML = '';
                        if (detailsButton) {
                            actionsElement.appendChild(detailsButton);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error cancelling booking:', error);
            alert('ไม่สามารถยกเลิกการจองได้: ' + error.message);
        }
    }
    
    // พิมพ์บัตรโดยสาร
    function printBoardingPass(booking) {
        // สร้าง template สำหรับพิมพ์
        const printWindow = window.open('', '_blank');
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
                        margin: 0 auto;
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
                </style>
            </head>
            <body onload="window.print(); window.setTimeout(function(){ window.close(); }, 500)">
        `);
        
        // สร้างบัตรโดยสารสำหรับผู้โดยสารแต่ละคน
        booking.passengers.forEach(passenger => {
            const departureTime = new Date(booking.flight.departureTime);
            const boardingTime = new Date(departureTime);
            boardingTime.setMinutes(departureTime.getMinutes() - 30); // เวลาขึ้นเครื่องก่อน 30 นาที
            
            const formattedDepartureTime = departureTime.toLocaleTimeString('th-TH', {
                hour: '2-digit',
                minute: '2-digit'});
           
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
                            <!-- สมมติว่ามีบาร์โค้ด -->
                            <svg width="300" height="50">
                                <rect x="0" y="0" width="300" height="50" fill="white" />
                                <!-- จำลองการวาดบาร์โค้ด -->
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
            
            printWindow.document.write(`
                </body>
                </html>
            `);
            
            printWindow.document.close();
        }
        
        // เก็บข้อมูลการจองเพื่อใช้ในการเรียงลำดับ
        const bookingsStore = {};
        
        function storeSortableBookings(bookings, containerId) {
            bookingsStore[containerId] = [...bookings];
        }
        
        // เรียงลำดับการจอง
        function sortBookings(sortBy) {
            const upcomingContainer = document.getElementById('upcoming-bookings');
            const pastContainer = document.getElementById('past-bookings');
            
            if (upcomingContainer && bookingsStore['upcoming-bookings']) {
                const sortedUpcoming = sortBookingsList(bookingsStore['upcoming-bookings'], sortBy);
                displayBookingsList(sortedUpcoming, 'upcoming-bookings');
            }
            
            if (pastContainer && bookingsStore['past-bookings']) {
                const sortedPast = sortBookingsList(bookingsStore['past-bookings'], sortBy);
                displayBookingsList(sortedPast, 'past-bookings');
            }
        }
        
        // เรียงลำดับรายการจอง
        function sortBookingsList(bookings, sortBy) {
            const bookingsCopy = [...bookings];
            
            switch (sortBy) {
                case 'date-asc':
                    // เรียงตามวันที่ (เก่าสุดไปล่าสุด)
                    return bookingsCopy.sort((a, b) => {
                        return new Date(a.flight.departureTime) - new Date(b.flight.departureTime);
                    });
                    
                case 'date-desc':
                    // เรียงตามวันที่ (ล่าสุดไปเก่าสุด)
                    return bookingsCopy.sort((a, b) => {
                        return new Date(b.flight.departureTime) - new Date(a.flight.departureTime);
                    });
                    
                case 'price-asc':
                    // เรียงตามราคา (ต่ำไปสูง)
                    return bookingsCopy.sort((a, b) => {
                        return a.totalPrice - b.totalPrice;
                    });
                    
                case 'price-desc':
                    // เรียงตามราคา (สูงไปต่ำ)
                    return bookingsCopy.sort((a, b) => {
                        return b.totalPrice - a.totalPrice;
                    });
                    
                default:
                    return bookingsCopy;
            }
        }
        
        // เพิ่ม CSS style สำหรับ highlight effect
        const highlightStyle = document.createElement('style');
        highlightStyle.textContent = `
            .booking-card.highlight {
                animation: highlight-pulse 1.5s ease-in-out;
            }
            
            @keyframes highlight-pulse {
                0%, 100% {
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                }
                50% {
                    box-shadow: 0 0 20px rgba(0, 102, 204, 0.7);
                    border-color: rgba(0, 102, 204, 0.7);
                }
            }
            
            .loading-indicator {
                text-align: center;
                padding: 20px;
                font-size: 1rem;
            }
            
            .loading-indicator i {
                margin-right: 8px;
                color: var(--primary-color);
            }
            
            .no-bookings {
                text-align: center;
                padding: 30px;
                background-color: #f8f8f8;
                border-radius: 8px;
                margin: 20px 0;
                font-size: 1rem;
                color: #666;
            }
            
            .error-message {
                text-align: center;
                padding: 15px;
                background-color: #fff0f0;
                border-radius: 8px;
                margin: 20px 0;
                color: var(--danger);
                border: 1px solid var(--danger);
            }
            
            .error-message i {
                margin-right: 8px;
            }
        `;
        document.head.appendChild(highlightStyle);
     });