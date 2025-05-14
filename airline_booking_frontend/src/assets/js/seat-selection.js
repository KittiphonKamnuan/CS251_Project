import { apiService } from './api-service.js';

document.addEventListener('DOMContentLoaded', async function() {
    // ดึงข้อมูลจาก URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const flightId = urlParams.get('flightId');
    const passengersCount = parseInt(urlParams.get('passengers') || '1');
    const seatClass = urlParams.get('class') || 'economy';
    
    // ดึงข้อมูลที่บันทึกไว้ใน sessionStorage
    const selectedFlightData = sessionStorage.getItem('selectedFlight') ? 
        JSON.parse(sessionStorage.getItem('selectedFlight')) : null;
    
    // ดึงข้อมูลผู้โดยสารที่บันทึกไว้ใน sessionStorage
    const passengerInfo = sessionStorage.getItem('passengerInfo') ? 
        JSON.parse(sessionStorage.getItem('passengerInfo')) : null;
        
    // ตรวจสอบว่ามีการเลือกเที่ยวบินหรือไม่
    if (!flightId && !selectedFlightData) {
        alert('ไม่พบข้อมูลเที่ยวบิน กรุณาเลือกเที่ยวบินก่อน');
        window.location.href = 'index.html';
        return;
    }
    
    // ใช้ flightId จาก selectedFlightData ถ้าไม่มีใน URL
    const effectiveFlightId = flightId || selectedFlightData.flightId;
    
    // อัปเดตข้อมูลเที่ยวบินบนหน้าเว็บ
    updateFlightSummary(selectedFlightData);
    
    // อัปเดตข้อมูลผู้โดยสาร
    updatePassengerInfo(passengerInfo);
    
    // elements
    const seatContainer = document.querySelector('.airplane-body');
    const selectedSeatDisplay = document.getElementById('selected-seat-display');
    const seatPriceDisplay = document.getElementById('seat-price-display');
    const continueBtn = document.getElementById('continue-btn');
    const backButton = document.getElementById('backButton');
    
    // สำหรับเก็บข้อมูลที่นั่งที่เลือก
    const selectedSeats = [];
    let totalSeatPrice = 0;
    
    // โหลดข้อมูลที่นั่ง
    try {
        await loadSeatData(effectiveFlightId);
    } catch (error) {
        console.error('Error loading seat data:', error);
        alert('ไม่สามารถโหลดข้อมูลที่นั่งได้ กรุณาลองใหม่อีกครั้ง');
    }
    
    // ตั้งค่า event listener สำหรับปุ่ม Continue
    if (continueBtn) {
        continueBtn.addEventListener('click', function(e) {
            // ตรวจสอบว่าได้เลือกที่นั่งครบตามจำนวนผู้โดยสารหรือไม่
            if (selectedSeats.length < passengersCount) {
                e.preventDefault();
                alert(`กรุณาเลือกที่นั่งให้ครบสำหรับผู้โดยสารทั้ง ${passengersCount} คน`);
                return;
            }
            
            // บันทึกข้อมูลที่นั่งที่เลือกใน sessionStorage
            sessionStorage.setItem('selectedSeats', JSON.stringify(selectedSeats));
            
            // บันทึกราคาที่นั่งเพิ่มเติมใน sessionStorage
            sessionStorage.setItem('additionalSeatPrice', totalSeatPrice.toString());
            
            // ไปที่หน้าชำระเงิน
            window.location.href = 'payment.html';
        });
    }
    
    // ตั้งค่า event listener สำหรับปุ่มย้อนกลับ
    if (backButton) {
        backButton.addEventListener('click', function() {
            // กลับไปยังหน้ารายละเอียดเที่ยวบิน
            window.location.href = 'flight-details.html';
        });
    }
    
    /**
     * อัปเดตข้อมูลเที่ยวบินในส่วน summary
     */
    function updateFlightSummary(flightData) {
        if (!flightData) return;
        
        const routeTitle = document.getElementById('routeTitle');
        const routeInfo = document.getElementById('routeInfo');
        
        if (routeTitle && routeInfo) {
            // อัปเดตชื่อเมืองและรหัสสนามบิน
            routeTitle.textContent = `${flightData.departureCity} (${flightData.departureCity.substring(0, 3).toUpperCase()}) → ${flightData.arrivalCity} (${flightData.arrivalCity.substring(0, 3).toUpperCase()})`;
            
            // อัปเดตข้อมูลวันที่และรายละเอียดการเดินทาง
            const departureDate = new Date(flightData.departureTime);
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const formattedDate = departureDate.toLocaleDateString('th-TH', options);
            
            let seatClassText = 'ชั้นประหยัด';
            if (flightData.seatClass === 'premium-economy') {
                seatClassText = 'ชั้นประหยัดพิเศษ';
            } else if (flightData.seatClass === 'business') {
                seatClassText = 'ชั้นธุรกิจ';
            } else if (flightData.seatClass === 'first') {
                seatClassText = 'ชั้นหนึ่ง';
            }
            
            routeInfo.textContent = `${formattedDate} | ผู้โดยสาร ${flightData.passengers} คน | ${seatClassText} | ${flightData.flightNumber}`;
        }
    }
    
    /**
     * อัปเดตข้อมูลผู้โดยสาร
     */
    function updatePassengerInfo(passengerData) {
        if (!passengerData) return;
        
        const passengerInfoElement = document.getElementById('passengerInfo');
        if (passengerInfoElement) {
            // แสดงชื่อผู้โดยสาร
            if (passengerData.passenger && passengerData.passenger.firstName && passengerData.passenger.lastName) {
                let title = '';
                if (passengerData.passenger.title === 'mr') {
                    title = 'นาย';
                } else if (passengerData.passenger.title === 'mrs') {
                    title = 'นาง';
                } else if (passengerData.passenger.title === 'ms') {
                    title = 'นางสาว';
                }
                
                passengerInfoElement.textContent = `กรุณาเลือกที่นั่งสำหรับผู้โดยสาร: ${title} ${passengerData.passenger.firstName} ${passengerData.passenger.lastName}`;
            }
        }
    }
    
    /**
     * โหลดข้อมูลที่นั่งจาก API
     */
    async function loadSeatData(flightId) {
        // แสดง loading state
        if (seatContainer) {
            seatContainer.innerHTML = '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> กำลังโหลดข้อมูลที่นั่ง...</div>';
        }
        
        try {
            // ดึงข้อมูลที่นั่งจาก API
            const seats = await apiService.getFlightSeats(flightId);
            
            // แสดงข้อมูลที่นั่ง
            renderSeats(seats);
        } catch (error) {
            console.error('Error fetching seat data:', error);
            
            // ถ้าไม่สามารถดึงข้อมูลจาก API ได้ ให้ใช้ข้อมูลจำลอง
            renderMockSeats();
        }
    }
    
    /**
     * แสดงข้อมูลที่นั่งจริงจาก API
     */
    function renderSeats(seats) {
        if (!seatContainer) return;
        
        // สร้าง map ของข้อมูลที่นั่ง เพื่อให้ค้นหาได้ง่าย
        const seatMap = {};
        seats.forEach(seat => {
            seatMap[seat.seatNumber] = seat;
        });
        
        // แยกที่นั่งตามชั้นโดยสาร
        const businessSeats = seats.filter(seat => seat.seatClass === 'Business');
        const economySeats = seats.filter(seat => seat.seatClass === 'Economy');
        
        // สร้าง HTML สำหรับที่นั่ง
        let html = '';
        
        // ส่วนของชั้นธุรกิจ
        if (businessSeats.length > 0) {
            html += `
                <div class="seat-class-label">ชั้นธุรกิจ</div>
                ${generateSeatRows(businessSeats, 'Business')}
                <div class="class-divider"></div>
            `;
        }
        
        // ส่วนของชั้นประหยัด
        if (economySeats.length > 0) {
            html += `
                <div class="seat-class-label">ชั้นประหยัด</div>
                ${generateSeatRows(economySeats, 'Economy')}
            `;
        }
        
        seatContainer.innerHTML = html;
        
        // เพิ่ม event listeners สำหรับการเลือกที่นั่ง
        addSeatClickListeners();
    }
    
    /**
     * สร้าง HTML สำหรับแถวที่นั่ง
     */
    function generateSeatRows(seats, seatClass) {
        // จัดกลุ่มที่นั่งตามแถว
        const rowMap = {};
        seats.forEach(seat => {
            const rowNumber = seat.seatNumber.replace(/[A-Z]/g, '');
            if (!rowMap[rowNumber]) {
                rowMap[rowNumber] = [];
            }
            rowMap[rowNumber].push(seat);
        });
        
        // สร้าง HTML สำหรับแต่ละแถว
        let html = '';
        
        Object.keys(rowMap).sort((a, b) => parseInt(a) - parseInt(b)).forEach(rowNumber => {
            const rowSeats = rowMap[rowNumber];
            
            // ตรวจสอบว่าเป็นแถวทางออกฉุกเฉินหรือไม่
            const isExitRow = ['8', '15', '16', '30'].includes(rowNumber);
            
            html += `<div class="seat-row">`;
            html += `<div class="row-number">${rowNumber}</div>`;
            
            // เรียงที่นั่งตามตัวอักษร
            rowSeats.sort((a, b) => {
                const letterA = a.seatNumber.replace(/[0-9]/g, '');
                const letterB = b.seatNumber.replace(/[0-9]/g, '');
                return letterA.localeCompare(letterB);
            });
            
            // สร้าง HTML สำหรับแต่ละที่นั่งในแถว
            rowSeats.forEach((seat, index) => {
                const seatLetter = seat.seatNumber.replace(/[0-9]/g, '');
                
                // กำหนด class สำหรับที่นั่ง
                let seatClass = 'seat';
                if (seat.seatStatus === 'Occupied') {
                    seatClass += ' occupied';
                } else if (isExitRow) {
                    seatClass += ' exit-row';
                } else if (seat.price > 0) {
                    seatClass += ' premium';
                }
                
                html += `<div class="${seatClass}" data-seat="${seat.seatNumber}" data-price="${seat.price || 0}">${seatLetter}</div>`;
                
                // เพิ่มทางเดินระหว่างที่นั่ง
                if (seatClass === 'Business' && index === 1) {
                    html += `<div class="aisle"></div>`;
                } else if (seatClass === 'Economy' && index === 2) {
                    html += `<div class="aisle"></div>`;
                }
            });
            
            // เพิ่มหมายเลขแถวทางด้านขวา
            html += `<div class="row-number">${rowNumber}</div>`;
            html += `</div>`;
            
            // เพิ่มข้อความแถวทางออกฉุกเฉิน
            if (isExitRow) {
                html += `<div class="seat-row">
                    <div class="aisle exit-row-marker">แถวทางออกฉุกเฉิน</div>
                </div>`;
            }
        });
        
        return html;
    }
    
    /**
     * แสดงข้อมูลที่นั่งจำลอง (กรณีที่ไม่สามารถดึงข้อมูลจาก API ได้)
     */
    function renderMockSeats() {
        if (!seatContainer) return;
        
        // จำลองข้อมูลที่นั่ง
        const mockHtml = `
            <!-- Business Class -->
            <div class="seat-class-label">ชั้นธุรกิจ</div>
            <div class="seat-row">
                <div class="row-number">1</div>
                <div class="seat occupied" data-seat="1A">A</div>
                <div class="seat occupied" data-seat="1B">B</div>
                <div class="aisle"></div>
                <div class="seat occupied" data-seat="1C">C</div>
                <div class="seat occupied" data-seat="1D">D</div>
                <div class="row-number">1</div>
            </div>
            <div class="seat-row">
                <div class="row-number">2</div>
                <div class="seat premium" data-seat="2A" data-price="1500">A</div>
                <div class="seat premium" data-seat="2B" data-price="1500">B</div>
                <div class="aisle"></div>
                <div class="seat premium" data-seat="2C" data-price="1500">C</div>
                <div class="seat premium" data-seat="2D" data-price="1500">D</div>
                <div class="row-number">2</div>
            </div>
            
            <!-- Divider between classes -->
            <div class="class-divider"></div>
            
            <!-- Economy Class -->
            <div class="seat-class-label">ชั้นประหยัด</div>
            <div class="seat-row">
                <div class="row-number">10</div>
                <div class="seat premium" data-seat="10A" data-price="350">A</div>
                <div class="seat premium" data-seat="10B" data-price="350">B</div>
                <div class="seat premium" data-seat="10C" data-price="350">C</div>
                <div class="aisle"></div>
                <div class="seat premium" data-seat="10D" data-price="350">D</div>
                <div class="seat premium" data-seat="10E" data-price="350">E</div>
                <div class="seat premium" data-seat="10F" data-price="350">F</div>
                <div class="row-number">10</div>
            </div>
            
            <!-- Exit Row -->
            <div class="seat-row">
                <div class="row-number">11</div>
                <div class="seat exit-row" data-seat="11A" data-price="250">A</div>
                <div class="seat exit-row" data-seat="11B" data-price="250">B</div>
                <div class="seat exit-row" data-seat="11C" data-price="250">C</div>
                <div class="aisle exit-row-marker">แถวทางออกฉุกเฉิน</div>
                <div class="seat exit-row" data-seat="11D" data-price="250">D</div>
                <div class="seat exit-row" data-seat="11E" data-price="250">E</div>
                <div class="seat exit-row" data-seat="11F" data-price="250">F</div>
                <div class="row-number">11</div>
            </div>
            
            <!-- Regular Economy Rows -->
            <div class="seat-row">
                <div class="row-number">12</div>
                <div class="seat occupied" data-seat="12A">A</div>
                <div class="seat" data-seat="12B">B</div>
                <div class="seat" data-seat="12C">C</div>
                <div class="aisle"></div>
                <div class="seat" data-seat="12D">D</div>
                <div class="seat" data-seat="12E">E</div>
                <div class="seat occupied" data-seat="12F">F</div>
                <div class="row-number">12</div>
            </div>
            <div class="seat-row">
                <div class="row-number">13</div>
                <div class="seat" data-seat="13A">A</div>
                <div class="seat" data-seat="13B">B</div>
                <div class="seat" data-seat="13C">C</div>
                <div class="aisle"></div>
                <div class="seat" data-seat="13D">D</div>
                <div class="seat occupied" data-seat="13E">E</div>
                <div class="seat occupied" data-seat="13F">F</div>
                <div class="row-number">13</div>
            </div>
            <div class="seat-row">
                <div class="row-number">14</div>
                <div class="seat" data-seat="14A">A</div>
                <div class="seat" data-seat="14B">B</div>
                <div class="seat" data-seat="14C">C</div>
                <div class="aisle"></div>
                <div class="seat" data-seat="14D">D</div>
                <div class="seat" data-seat="14E">E</div>
                <div class="seat" data-seat="14F">F</div>
                <div class="row-number">14</div>
            </div>
            <div class="seat-row">
                <div class="row-number">15</div>
                <div class="seat occupied" data-seat="15A">A</div>
                <div class="seat occupied" data-seat="15B">B</div>
                <div class="seat" data-seat="15C">C</div>
                <div class="aisle"></div>
                <div class="seat" data-seat="15D">D</div>
                <div class="seat occupied" data-seat="15E">E</div>
                <div class="seat" data-seat="15F">F</div>
                <div class="row-number">15</div>
            </div>
            
            <!-- More rows would be added here -->
            <div class="more-rows">...</div>
            
            <!-- Last rows -->
            <div class="seat-row">
                <div class="row-number">30</div>
                <div class="seat" data-seat="30A">A</div>
                <div class="seat" data-seat="30B">B</div>
                <div class="seat" data-seat="30C">C</div>
                <div class="aisle"></div>
                <div class="seat" data-seat="30D">D</div>
                <div class="seat" data-seat="30E">E</div>
                <div class="seat" data-seat="30F">F</div>
                <div class="row-number">30</div>
            </div>
        `;
        
        seatContainer.innerHTML = mockHtml;
        
        // เพิ่ม event listeners สำหรับการเลือกที่นั่ง
        addSeatClickListeners();
    }
    
    /**
     * เพิ่ม event listeners สำหรับการเลือกที่นั่ง
     */
    function addSeatClickListeners() {
        const seatElements = document.querySelectorAll('.seat:not(.occupied)');
        
        seatElements.forEach(seat => {
            seat.addEventListener('click', function() {
                const seatNumber = this.getAttribute('data-seat');
                const seatPrice = parseInt(this.getAttribute('data-price') || '0');
                
                // ถ้าที่นั่งนี้ถูกเลือกอยู่แล้ว ให้ยกเลิกการเลือก
                if (this.classList.contains('selected')) {
                    this.classList.remove('selected');
                    
                    // ลบที่นั่งออกจากรายการที่เลือก
                    const index = selectedSeats.findIndex(s => s.seatNumber === seatNumber);
                    if (index !== -1) {
                        totalSeatPrice -= selectedSeats[index].price;
                        selectedSeats.splice(index, 1);
                    }
                } 
                // ถ้ายังไม่ได้เลือก และยังเลือกไม่ครบตามจำนวนผู้โดยสาร
                else if (selectedSeats.length < passengersCount) {
                    this.classList.add('selected');
                    
                    // เพิ่มที่นั่งลงในรายการที่เลือก
                    selectedSeats.push({
                        seatNumber,
                        price: seatPrice
                    });
                    
                    totalSeatPrice += seatPrice;
                } 
                // ถ้าเลือกครบแล้ว
                else {
                    alert(`คุณสามารถเลือกได้เพียง ${passengersCount} ที่นั่งเท่านั้น กรุณายกเลิกที่นั่งที่เลือกไว้ก่อนหากต้องการเลือกที่นั่งอื่น`);
                }
                
                // อัพเดทการแสดงผลที่นั่งที่เลือก
                updateSelectedSeatsDisplay();
                
                // เปิดใช้งานปุ่ม Continue ถ้าเลือกครบแล้ว
                if (continueBtn) {
                    continueBtn.disabled = selectedSeats.length < passengersCount;
                }
            });
        });
    }
    
    /**
     * อัพเดทการแสดงผลที่นั่งที่เลือก
     */
    function updateSelectedSeatsDisplay() {
        if (selectedSeatDisplay) {
            if (selectedSeats.length > 0) {
                const seatNumbers = selectedSeats.map(seat => seat.seatNumber).join(', ');
                selectedSeatDisplay.textContent = seatNumbers;
            } else {
                selectedSeatDisplay.textContent = 'ยังไม่ได้เลือกที่นั่ง';
            }
        }
        
        if (seatPriceDisplay) {
            seatPriceDisplay.textContent = `฿${totalSeatPrice.toLocaleString()}`;
        }
    }
});