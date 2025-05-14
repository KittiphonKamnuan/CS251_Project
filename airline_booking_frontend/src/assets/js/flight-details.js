import { apiService } from './api-service.js';

document.addEventListener('DOMContentLoaded', function() {
    // ดึงข้อมูลเที่ยวบินที่เลือกจาก session storage
    const selectedFlight = getSelectedFlight();
    
    // อัปเดตหน้าเว็บด้วยข้อมูลเที่ยวบิน
    if (selectedFlight) {
        updateFlightDetails(selectedFlight);
    } else {
        // ถ้าไม่มีข้อมูลเที่ยวบิน ให้กลับไปยังหน้าค้นหา
        redirectToSearch();
    }
    
    // ตั้งค่า event listeners
    setupEventListeners();
    
    // ตั้งค่า addon checkboxes
    setupAddonCheckboxes();
    
    // ตรวจสอบสถานะการเข้าสู่ระบบ
    checkLoginStatus();
});

/**
 * ดึงข้อมูลเที่ยวบินที่เลือกจาก session storage
 */
function getSelectedFlight() {
    try {
        const flightData = sessionStorage.getItem('selectedFlight');
        if (!flightData) {
            console.warn('ไม่พบข้อมูลเที่ยวบินที่เลือก');
            return null;
        }
        
        return JSON.parse(flightData);
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการอ่านข้อมูลเที่ยวบิน:', error);
        return null;
    }
}

/**
 * อัปเดตหน้าเว็บด้วยข้อมูลเที่ยวบิน
 */
function updateFlightDetails(flight) {
    // อัปเดตข้อมูลเส้นทาง
    updateRouteInfo(flight);
    
    // อัปเดตข้อมูลเที่ยวบิน
    updateFlightCard(flight);
    
    // อัปเดตข้อมูลราคา
    updateFareInfo(flight);
    
    // เติมข้อมูลผู้ใช้ที่เข้าสู่ระบบแล้ว (ถ้ามี)
    fillUserInfo();
}

/**
 * อัปเดตข้อมูลเส้นทาง
 */
function updateRouteInfo(flight) {
    const routeTitle = document.querySelector('.flight-route h2');
    const routeInfo = document.querySelector('.flight-route p');
    
    if (routeTitle && routeInfo) {
        // อัปเดตชื่อเมืองและรหัสสนามบิน
        routeTitle.textContent = `${flight.departureCity} (${flight.departureCity.substring(0, 3).toUpperCase()}) → ${flight.arrivalCity} (${flight.arrivalCity.substring(0, 3).toUpperCase()})`;
        
        // อัปเดตข้อมูลวันที่และรายละเอียดการเดินทาง
        const departureDate = new Date(flight.departureTime);
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = departureDate.toLocaleDateString('th-TH', options);
        
        let seatClassText = 'ชั้นประหยัด';
        if (flight.seatClass === 'premium-economy') {
            seatClassText = 'ชั้นประหยัดพิเศษ';
        } else if (flight.seatClass === 'business') {
            seatClassText = 'ชั้นธุรกิจ';
        } else if (flight.seatClass === 'first') {
            seatClassText = 'ชั้นหนึ่ง';
        }
        
        routeInfo.textContent = `${formattedDate} | ผู้โดยสาร ${flight.passengers} คน | ${seatClassText}`;
    }
}

/**
 * อัปเดตข้อมูลเที่ยวบินในการ์ด
 */
function updateFlightCard(flight) {
    // ดึง elements
    const airlineName = document.querySelector('.airline-name');
    const flightNumber = document.querySelector('.flight-number');
    const departureTime = document.querySelector('.departure .time');
    const departureDate = document.querySelector('.departure .date');
    const departureAirport = document.querySelector('.departure .airport');
    const arrivalTime = document.querySelector('.arrival .time');
    const arrivalDate = document.querySelector('.arrival .date');
    const arrivalAirport = document.querySelector('.arrival .airport');
    const duration = document.querySelector('.flight-duration .duration');
    const aircraft = document.querySelector('.detail-item:nth-child(4) .detail-text');
    
    // อัปเดตข้อมูล
    if (airlineName) airlineName.textContent = "Thai Airways"; // ตั้งค่าเริ่มต้น หรืออาจดึงจาก API
    if (flightNumber) flightNumber.textContent = flight.flightNumber;
    
    // อัปเดตเวลาและวันที่
    const depDateTime = new Date(flight.departureTime);
    const arrDateTime = new Date(flight.arrivalTime);
    
    // จัดรูปแบบเวลา
    const formatTime = (date) => {
        return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    };
    
    // จัดรูปแบบวันที่
    const formatDate = (date) => {
        return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
    };
    
    if (departureTime) departureTime.textContent = formatTime(depDateTime);
    if (departureDate) departureDate.textContent = formatDate(depDateTime);
    if (departureAirport) departureAirport.textContent = `${flight.departureCity} (${flight.departureCity.substring(0, 3).toUpperCase()})`;
    
    if (arrivalTime) arrivalTime.textContent = formatTime(arrDateTime);
    if (arrivalDate) arrivalDate.textContent = formatDate(arrDateTime);
    if (arrivalAirport) arrivalAirport.textContent = `${flight.arrivalCity} (${flight.arrivalCity.substring(0, 3).toUpperCase()})`;
    
    // คำนวณระยะเวลาเที่ยวบิน
    if (duration) {
        const diffMs = arrDateTime - depDateTime;
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        duration.textContent = `${diffHrs}h ${diffMins}m`;
    }
    
    // อัปเดตข้อมูลเครื่องบิน
    if (aircraft) aircraft.textContent = flight.aircraft;
}

/**
 * อัปเดตข้อมูลราคา
 */
function updateFareInfo(flight) {
    const basePrice = document.querySelector('.fare-row:nth-child(1) .fare-value');
    const taxesAndFees = document.querySelector('.fare-row:nth-child(2) .fare-value');
    const totalPrice = document.querySelector('.fare-row.total .fare-value');
    
    // คำนวณราคา
    const passengerCount = parseInt(flight.passengers) || 1;
    const flightPrice = parseFloat(flight.price) || 0;
    
    // สมมติว่าภาษีและค่าธรรมเนียมเป็น 20% ของราคาตั๋ว
    const taxAndFeeAmount = flightPrice * 0.2;
    const totalAmount = flightPrice + taxAndFeeAmount;
    
    // อัปเดตข้อมูลในหน้าเว็บ
    if (basePrice) basePrice.textContent = `฿${flightPrice.toLocaleString()}`;
    if (taxesAndFees) taxesAndFees.textContent = `฿${taxAndFeeAmount.toLocaleString()}`;
    if (totalPrice) totalPrice.textContent = `฿${totalAmount.toLocaleString()}`;
}

/**
 * เติมข้อมูลผู้ใช้ที่เข้าสู่ระบบแล้ว
 */
function fillUserInfo() {
    // ตรวจสอบว่ามีข้อมูลผู้ใช้ที่เข้าสู่ระบบหรือไม่
    const userData = localStorage.getItem('userData');
    
    if (userData) {
        try {
            const user = JSON.parse(userData);
            
            // เติมข้อมูลติดต่อ
            const emailInput = document.getElementById('contact-email');
            const phoneInput = document.getElementById('contact-phone');
            
            if (emailInput && user.email) {
                emailInput.value = user.email;
            }
            
            if (phoneInput && user.phone) {
                phoneInput.value = user.phone;
            }
            
            // เติมข้อมูลผู้โดยสาร
            const titleSelect = document.getElementById('title');
            const firstNameInput = document.getElementById('first-name');
            const lastNameInput = document.getElementById('last-name');
            
            if (firstNameInput && user.firstName) {
                firstNameInput.value = user.firstName;
            }
            
            if (lastNameInput && user.lastName) {
                lastNameInput.value = user.lastName;
            }
            
            // ถ้ามีคำนำหน้า ให้เลือกค่าที่เหมาะสม
            if (titleSelect && user.firstName) {
                // ตัวอย่างการเลือกคำนำหน้าอย่างง่าย
                // ในสถานการณ์จริงอาจต้องใช้ข้อมูลอื่นเพิ่มเติม
                titleSelect.value = 'mr'; // ค่าเริ่มต้น
            }
        } catch (error) {
            console.error('เกิดข้อผิดพลาดในการอ่านข้อมูลผู้ใช้:', error);
        }
    }
}

/**
 * ตั้งค่า event listeners ต่างๆ
 */
function setupEventListeners() {
    // Event listener สำหรับปุ่มดำเนินการต่อ
    const continueButton = document.querySelector('.action-buttons .btn-primary');
    if (continueButton) {
        continueButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // ตรวจสอบข้อมูลฟอร์ม
            if (validatePassengerForm()) {
                // เก็บข้อมูลผู้โดยสาร
                savePassengerInfo();
                
                // ไปที่หน้าเลือกที่นั่ง
                window.location.href = 'seat-selection.html';
            }
        });
    }
    
    // Event listener สำหรับปุ่มย้อนกลับ
    const backButton = document.querySelector('.action-buttons .btn-outline');
    if (backButton) {
        backButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // กลับไปยังหน้าก่อนหน้า
            window.history.back();
        });
    }
}

/**
 * ตรวจสอบข้อมูลฟอร์มผู้โดยสาร
 */
function validatePassengerForm() {
    const form = document.getElementById('passenger-form');
    
    if (!form) {
        return false;
    }
    
    // ดึงข้อมูลจากฟอร์ม
    const contactEmail = document.getElementById('contact-email').value.trim();
    const contactPhone = document.getElementById('contact-phone').value.trim();
    const title = document.getElementById('title').value;
    const firstName = document.getElementById('first-name').value.trim();
    const lastName = document.getElementById('last-name').value.trim();
    const dob = document.getElementById('dob').value;
    const nationality = document.getElementById('nationality').value;
    const passport = document.getElementById('passport').value.trim();
    
    // ตรวจสอบอีเมล
    if (!contactEmail) {
        alert('กรุณากรอกอีเมล');
        return false;
    }
    
    if (!isValidEmail(contactEmail)) {
        alert('กรุณากรอกอีเมลให้ถูกต้อง');
        return false;
    }
    
    // ตรวจสอบเบอร์โทรศัพท์
    if (!contactPhone) {
        alert('กรุณากรอกเบอร์โทรศัพท์');
        return false;
    }
    
    // ตรวจสอบคำนำหน้า
    if (!title) {
        alert('กรุณาเลือกคำนำหน้า');
        return false;
    }
    
    // ตรวจสอบชื่อ
    if (!firstName) {
        alert('กรุณากรอกชื่อ');
        return false;
    }
    
    // ตรวจสอบนามสกุล
    if (!lastName) {
        alert('กรุณากรอกนามสกุล');
        return false;
    }
    
    // ตรวจสอบวันเกิด
    if (!dob) {
        alert('กรุณาเลือกวันเกิด');
        return false;
    }
    
    // ตรวจสอบสัญชาติ
    if (!nationality) {
        alert('กรุณาเลือกสัญชาติ');
        return false;
    }
    
    // ตรวจสอบเลขที่หนังสือเดินทาง/บัตรประชาชน
    if (!passport) {
        alert('กรุณากรอกเลขที่หนังสือเดินทาง/บัตรประชาชน');
        return false;
    }
    
    return true;
}

/**
 * บันทึกข้อมูลผู้โดยสาร
 */
function savePassengerInfo() {
    // ดึงข้อมูลจากฟอร์ม
    const contactEmail = document.getElementById('contact-email').value.trim();
    const contactPhone = document.getElementById('contact-phone').value.trim();
    const title = document.getElementById('title').value;
    const firstName = document.getElementById('first-name').value.trim();
    const lastName = document.getElementById('last-name').value.trim();
    const dob = document.getElementById('dob').value;
    const nationality = document.getElementById('nationality').value;
    const passport = document.getElementById('passport').value.trim();
    
    // ดึงข้อมูลบริการเสริม
    const specialMeal = document.getElementById('addon-meal').checked;
    const extraBaggage = document.getElementById('addon-baggage').checked;
    const travelInsurance = document.getElementById('addon-insurance').checked;
    
    // คำนวณราคาเพิ่มเติม
    let additionalCost = 0;
    if (specialMeal) additionalCost += 150;
    if (extraBaggage) additionalCost += 350;
    if (travelInsurance) additionalCost += 200;
    
    // สร้างวัตถุข้อมูลผู้โดยสาร
    const passengerInfo = {
        contact: {
            email: contactEmail,
            phone: contactPhone
        },
        passenger: {
            title: title,
            firstName: firstName,
            lastName: lastName,
            dateOfBirth: dob,
            nationality: nationality,
            documentId: passport
        },
        addons: {
            specialMeal: specialMeal,
            extraBaggage: extraBaggage,
            travelInsurance: travelInsurance
        },
        additionalCost: additionalCost
    };
    
    // บันทึกข้อมูลผู้โดยสารใน session storage
    try {
        sessionStorage.setItem('passengerInfo', JSON.stringify(passengerInfo));
        console.log('บันทึกข้อมูลผู้โดยสารเรียบร้อยแล้ว');
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการบันทึกข้อมูลผู้โดยสาร:', error);
    }
}

/**
 * ตั้งค่า addon checkboxes
 */
function setupAddonCheckboxes() {
    const mealCheckbox = document.getElementById('addon-meal');
    const baggageCheckbox = document.getElementById('addon-baggage');
    const insuranceCheckbox = document.getElementById('addon-insurance');
    
    // ดึงข้อมูลเดิม (ถ้ามี)
    const savedPassengerInfo = sessionStorage.getItem('passengerInfo');
    
    if (savedPassengerInfo) {
        try {
            const passengerInfo = JSON.parse(savedPassengerInfo);
            
            // ตั้งค่า checkbox ตามข้อมูลที่บันทึกไว้
            if (mealCheckbox && passengerInfo.addons) {
                mealCheckbox.checked = passengerInfo.addons.specialMeal || false;
            }
            
            if (baggageCheckbox && passengerInfo.addons) {
                baggageCheckbox.checked = passengerInfo.addons.extraBaggage || false;
            }
            
            if (insuranceCheckbox && passengerInfo.addons) {
                insuranceCheckbox.checked = passengerInfo.addons.travelInsurance || false;
            }
        } catch (error) {
            console.error('เกิดข้อผิดพลาดในการอ่านข้อมูลบริการเสริม:', error);
        }
    }
}

/**
 * ตรวจสอบสถานะการเข้าสู่ระบบ
 */
function checkLoginStatus() {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (!token || !userData) {
        // แสดง alert เตือน
        setTimeout(() => {
            const shouldLogin = confirm('การเข้าสู่ระบบจะช่วยให้การจองตั๋วสะดวกยิ่งขึ้น และสามารถสะสมแต้มได้ คุณต้องการเข้าสู่ระบบหรือไม่?');
            
            if (shouldLogin) {
                // บันทึก URL ปัจจุบันเพื่อกลับมาหลังจากเข้าสู่ระบบ
                sessionStorage.setItem('redirectAfterLogin', window.location.href);
                
                // นำทางไปยังหน้าเข้าสู่ระบบ
                window.location.href = 'login.html';
            }
        }, 1000);
    }
}

/**
 * กลับไปยังหน้าค้นหาเที่ยวบิน
 */
function redirectToSearch() {
    alert('ไม่พบข้อมูลเที่ยวบิน กรุณาค้นหาเที่ยวบินใหม่');
    window.location.href = 'index.html';
}

/**
 * ตรวจสอบความถูกต้องของอีเมล
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}