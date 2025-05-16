import { apiService } from './api-service.js';



// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    checkAuthAndAccess();
    setupEventListeners();
    loadAllInitialData();
});

async function loadAllInitialData() {
    try {
        console.log("เริ่มโหลดข้อมูลเบื้องต้น...");
        
        // โหลดข้อมูลทั้งหมดตามลำดับ
        const loadTasks = [
            { name: 'Dashboard', loader: loadDashboardData },
            { name: 'ผู้ใช้', loader: loadUsersData },
            { name: 'พนักงาน', loader: loadStaffUsersData },
            { name: 'ผู้ดูแลระบบ', loader: loadAdminUsersData },
            { name: 'ลูกค้า', loader: loadCustomerUsersData },
            { name: 'เที่ยวบิน', loader: loadFlightsData },
            { name: 'ที่นั่ง', loader: loadSeatsData },
            { name: 'การจอง', loader: loadBookingsData },
            { name: 'การชำระเงิน', loader: loadPaymentsData },
            { name: 'โปรโมชั่น', loader: loadPromotionsData },
            { name: 'ส่วนลด', loader: loadDiscountsData },
            { name: 'คะแนนสะสม', loader: loadLoyaltyData }
        ];
        
        for (const task of loadTasks) {
            try {
                console.log(`กำลังโหลดข้อมูล ${task.name}...`);
                await task.loader();
                console.log(`โหลดข้อมูล ${task.name} สำเร็จ`);
            } catch (error) {
                console.error(`เกิดข้อผิดพลาดในการโหลดข้อมูล ${task.name}:`, error);
                
                // แสดงข้อความแจ้งเตือนใน Container ที่เกี่ยวข้อง
                let containerId;
                
                // ตรวจสอบประเภทข้อมูลเพื่อหา container ที่เหมาะสม
                switch(task.name.toLowerCase()) {
                    case 'ผู้ใช้':
                        containerId = 'usersTableContainer';
                        break;
                    case 'พนักงาน':
                        containerId = 'staffUsersTableContainer';
                        break;
                    case 'ผู้ดูแลระบบ':
                        containerId = 'adminUsersTableContainer';
                        break;
                    case 'ลูกค้า':
                        containerId = 'customerUsersTableContainer';
                        break;
                    case 'เที่ยวบิน':
                        containerId = 'flightsTableContainer';
                        break;
                    case 'ที่นั่ง':
                        containerId = 'seatsTableContainer';
                        break;
                    case 'การจอง':
                        containerId = 'bookingsTableContainer';
                        break;
                    case 'การชำระเงิน':
                        containerId = 'paymentsTableContainer';
                        break;
                    case 'โปรโมชั่น':
                        containerId = 'promotionsTableContainer';
                        break;
                    case 'ส่วนลด':
                        containerId = 'discountsTableContainer';
                        break;
                    case 'คะแนนสะสม':
                        containerId = 'loyaltyPointsTableContainer';
                        break;
                    default:
                        containerId = '';
                }
                
                const container = document.getElementById(containerId);
                if (container) {
                    // กรณี 404 คือ API ยังไม่มี
                    if (error.message && error.message.includes('404')) {
                        container.innerHTML = `
                            <div class="no-data-message">
                                <i class="fas fa-info-circle"></i>
                                <h3>ฟีเจอร์ ${task.name} ยังไม่พร้อมใช้งาน</h3>
                                <p>ฟีเจอร์นี้อยู่ระหว่างการพัฒนา กรุณาลองใหม่ในภายหลัง</p>
                            </div>
                        `;
                    } else {
                        container.innerHTML = `
                            <div class="alert alert-warning">
                                <i class="fas fa-exclamation-circle"></i>
                                <span>ไม่สามารถโหลดข้อมูล ${task.name} ได้: ${error.message}</span>
                                <button class="btn btn-sm btn-outline-warning ml-2" onclick="reload${task.name.replace(/[^a-zA-Z0-9]/g, '')}Data()">ลองใหม่</button>
                            </div>
                        `;
                    }
                }
            }
        }
        
        console.log('โหลดข้อมูลทั้งหมดเรียบร้อยแล้ว');
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการโหลดข้อมูลเบื้องต้น:', error);
    }

    // อัปเดตสถานะฟีเจอร์
    function updateFeatureStatus(feature, status) {
        const element = document.getElementById(`feature-${feature}`);
        if (element) {
            element.className = `feature-status-item ${status}`;
        }
    }

    // อัปเดตสถานะฟีเจอร์ต่างๆ
    try {
        updateFeatureStatus('dashboard', await checkApiEndpoint('/admin/dashboard/stats') ? 'active' : 'error');
        updateFeatureStatus('users', await checkApiEndpoint('/admin/users') ? 'active' : 'error');
        updateFeatureStatus('flights', await checkApiEndpoint('/admin/flights') ? 'active' : 'error');
        updateFeatureStatus('bookings', await checkApiEndpoint('/admin/bookings') ? 'active' : 'error');
        updateFeatureStatus('promotions', await checkApiEndpoint('/admin/promotions') ? 'active' : 'pending');
        updateFeatureStatus('discounts', await checkApiEndpoint('/admin/discounts') ? 'active' : 'pending');
        updateFeatureStatus('loyalty', await checkApiEndpoint('/admin/loyalty-points') ? 'active' : 'pending');
    } catch (e) {
        console.warn('Error updating feature status:', e);
    }
}

// เพิ่มฟังก์ชันสำหรับโหลดข้อมูลแต่ละประเภทใหม่
function reloadDashboardData() {
    loadDashboardData();
}

function reloadUsersData() {
    loadUsersData();
}

function reloadStaffUsersData() {
    loadStaffUsersData();
}

function reloadAdminUsersData() {
    loadAdminUsersData();
}

function reloadCustomerUsersData() {
    loadCustomerUsersData();
}

function reloadFlightsData() {
    loadFlightsData();
}

function reloadSeatsData() {
    loadSeatsData();
}

function reloadBookingsData() {
    loadBookingsData();
}

function reloadPaymentsData() {
    loadPaymentsData();
}

function reloadPromotionsData() {
    loadPromotionsData();
}

function reloadDiscountsData() {
    loadDiscountsData();
}

function reloadLoyaltyData() {
    loadLoyaltyData();
}

// เพิ่มฟังก์ชัน loadStaffUsersData


// ===== STAFF USERS =====
async function loadStaffUsersData() {
    try {
        const users = await apiService.request('/admin/users/role/Staff');
        const container = document.getElementById('staffUsersTableContainer');
        
        if (!container) {
            console.warn('ไม่พบ element staffUsersTableContainer');
            return; // ออกจากฟังก์ชันถ้าไม่พบ container
        }
        
        if (users && users.length > 0) {
            let tableHtml = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>รหัสผู้ใช้</th>
                            <th>ชื่อผู้ใช้</th>
                            <th>ชื่อ-นามสกุล</th>
                            <th>อีเมล</th>
                            <th>เบอร์โทรศัพท์</th>
                            <th>สถานะ</th>
                            <th>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            users.forEach(user => {
                tableHtml += `
                    <tr>
                        <td>${user.userId || '-'}</td>
                        <td>${user.username || '-'}</td>
                        <td>${user.firstName || ''} ${user.lastName || ''}</td>
                        <td>${user.email || '-'}</td>
                        <td>${user.phone || '-'}</td>
                        <td>
                            <span class="status-badge status-${user.status === 'Active' ? 'confirmed' : 'cancelled'}">${user.status === 'Active' ? 'ใช้งานอยู่' : 'ไม่ได้ใช้งาน'}</span>
                        </td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn btn-view" title="ดูรายละเอียด" onclick="viewUser('${user.userId}')">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="action-btn btn-edit" title="แก้ไข" onclick="editUser('${user.userId}')">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="action-btn btn-delete" title="ลบ" onclick="deleteUser('${user.userId}')">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });
            
            tableHtml += `
                    </tbody>
                </table>
            `;
            
            container.innerHTML = tableHtml;
        } else {
            container.innerHTML = `
                <div class="no-data-message">
                    <i class="fas fa-user-tie"></i>
                    <h3>ไม่พบข้อมูลพนักงาน</h3>
                    <p>ยังไม่มีผู้ใช้ที่เป็นพนักงานในระบบ</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading staff users:', error);
        const container = document.getElementById('staffUsersTableContainer');
        if (container) {
            container.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle"></i>
                    <span>เกิดข้อผิดพลาดในการโหลดข้อมูลพนักงาน: ${error.message}</span>
                </div>
            `;
        }
    }
}

// เพิ่มฟังก์ชัน loadAdminUsersData


// ===== ADMIN USERS =====
async function loadAdminUsersData() {
    try {
        const users = await apiService.request('/admin/users/role/Admin');
        const container = document.getElementById('adminUsersTableContainer');
        
        if (!container) {
            console.warn('ไม่พบ element adminUsersTableContainer');
            return;
        }
        
        if (users && users.length > 0) {
            let tableHtml = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>รหัสผู้ใช้</th>
                            <th>ชื่อผู้ใช้</th>
                            <th>ชื่อ-นามสกุล</th>
                            <th>อีเมล</th>
                            <th>เบอร์โทรศัพท์</th>
                            <th>สถานะ</th>
                            <th>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            users.forEach(user => {
                tableHtml += `
                    <tr>
                        <td>${user.userId || '-'}</td>
                        <td>${user.username || '-'}</td>
                        <td>${user.firstName || ''} ${user.lastName || ''}</td>
                        <td>${user.email || '-'}</td>
                        <td>${user.phone || '-'}</td>
                        <td>
                            <span class="status-badge status-${user.status === 'Active' ? 'confirmed' : 'cancelled'}">${user.status === 'Active' ? 'ใช้งานอยู่' : 'ไม่ได้ใช้งาน'}</span>
                        </td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn btn-view" title="ดูรายละเอียด" onclick="viewUser('${user.userId}')">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="action-btn btn-edit" title="แก้ไข" onclick="editUser('${user.userId}')">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="action-btn btn-delete" title="ลบ" onclick="deleteUser('${user.userId}')">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });
            
            tableHtml += `
                    </tbody>
                </table>
            `;
            
            container.innerHTML = tableHtml;
        } else {
            container.innerHTML = `
                <div class="no-data-message">
                    <i class="fas fa-user-shield"></i>
                    <h3>ไม่พบข้อมูลผู้ดูแลระบบ</h3>
                    <p>ยังไม่มีผู้ใช้ที่เป็นผู้ดูแลระบบ</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading admin users:', error);
        const container = document.getElementById('adminUsersTableContainer');
        if (container) {
            container.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle"></i>
                    <span>เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ดูแลระบบ: ${error.message}</span>
                </div>
            `;
        }
    }
}

// เพิ่มฟังก์ชัน loadCustomerUsersData


// ===== CUSTOMER USERS =====
async function loadCustomerUsersData() {
    try {
        const users = await apiService.request('/admin/users/role/Customer');
        const container = document.getElementById('customerUsersTableContainer');
        
        if (!container) {
            console.warn('ไม่พบ element customerUsersTableContainer');
            return;
        }
        
        if (users && users.length > 0) {
            let tableHtml = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>รหัสผู้ใช้</th>
                            <th>ชื่อผู้ใช้</th>
                            <th>ชื่อ-นามสกุล</th>
                            <th>อีเมล</th>
                            <th>เบอร์โทรศัพท์</th>
                            <th>สถานะ</th>
                            <th>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            users.forEach(user => {
                tableHtml += `
                    <tr>
                        <td>${user.userId || '-'}</td>
                        <td>${user.username || '-'}</td>
                        <td>${user.firstName || ''} ${user.lastName || ''}</td>
                        <td>${user.email || '-'}</td>
                        <td>${user.phone || '-'}</td>
                        <td>
                            <span class="status-badge status-${user.status === 'Active' ? 'confirmed' : 'cancelled'}">${user.status === 'Active' ? 'ใช้งานอยู่' : 'ไม่ได้ใช้งาน'}</span>
                        </td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn btn-view" title="ดูรายละเอียด" onclick="viewUser('${user.userId}')">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="action-btn btn-edit" title="แก้ไข" onclick="editUser('${user.userId}')">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="action-btn btn-delete" title="ลบ" onclick="deleteUser('${user.userId}')">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });
            
            tableHtml += `
                    </tbody>
                </table>
            `;
            
            container.innerHTML = tableHtml;
        } else {
            container.innerHTML = `
                <div class="no-data-message">
                    <i class="fas fa-users"></i>
                    <h3>ไม่พบข้อมูลลูกค้า</h3>
                    <p>ยังไม่มีผู้ใช้ที่เป็นลูกค้าในระบบ</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading customer users:', error);
        const container = document.getElementById('customerUsersTableContainer');
        if (container) {
            container.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle"></i>
                    <span>เกิดข้อผิดพลาดในการโหลดข้อมูลลูกค้า: ${error.message}</span>
                </div>
            `;
        }
    }
}

// เพิ่มฟังก์ชัน loadSeatsData


// ===== SEATS =====
async function loadSeatsData() {
    try {
        const seats = await apiService.request('/admin/seats');
        const container = document.getElementById('seatsTableContainer');
        
        if (!container) {
            console.warn('ไม่พบ element seatsTableContainer');
            return;
        }
        
        if (seats && seats.length > 0) {
            let tableHtml = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>รหัสที่นั่ง</th>
                            <th>หมายเลขที่นั่ง</th>
                            <th>เที่ยวบิน</th>
                            <th>ชั้นโดยสาร</th>
                            <th>ราคา</th>
                            <th>สถานะ</th>
                            <th>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            seats.forEach(seat => {
                tableHtml += `
                    <tr>
                        <td>${seat.seatId || '-'}</td>
                        <td>${seat.seatNumber || '-'}</td>
                        <td>${seat.flight ? seat.flight.flightNumber : '-'}</td>
                        <td>${seat.seatClass || '-'}</td>
                        <td>฿${formatNumber(seat.price || 0)}</td>
                        <td>
                            <span class="status-badge status-${getStatusClass(seat.seatStatus)}">${getSeatStatusLabel(seat.seatStatus)}</span>
                        </td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn btn-view" title="ดูรายละเอียด" onclick="viewSeat('${seat.seatId}')">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="action-btn btn-edit" title="แก้ไข" onclick="editSeat('${seat.seatId}')">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="action-btn btn-delete" title="ลบ" onclick="deleteSeat('${seat.seatId}')">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });
            
            tableHtml += `
                    </tbody>
                </table>
            `;
            
            container.innerHTML = tableHtml;
        } else {
            container.innerHTML = `
                <div class="no-data-message">
                    <i class="fas fa-chair"></i>
                    <h3>ไม่พบข้อมูลที่นั่ง</h3>
                    <p>ยังไม่มีที่นั่งในระบบ</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading seats:', error);
        const container = document.getElementById('seatsTableContainer');
        if (container) {
            container.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle"></i>
                    <span>เกิดข้อผิดพลาดในการโหลดข้อมูลที่นั่ง: ${error.message}</span>
                </div>
            `;
        }
    }
}

// Helper functions
function getSeatStatusLabel(status) {
    switch (status) {
        case 'Available':
            return 'ว่าง';
        case 'Booked':
            return 'จองแล้ว';
        case 'Reserved':
            return 'สำรอง';
        case 'Unavailable':
            return 'ไม่พร้อมใช้งาน';
        default:
            return status || 'ไม่ระบุ';
    }
}

// เพิ่มฟังก์ชัน loadPaymentsData


// ===== PAYMENTS =====
async function loadPaymentsData() {
    try {
        const payments = await apiService.request('/admin/payments');
        const container = document.getElementById('paymentsTableContainer');
        
        if (!container) {
            console.warn('ไม่พบ element paymentsTableContainer');
            return;
        }
        
        if (payments && payments.length > 0) {
            let tableHtml = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>รหัสการชำระเงิน</th>
                            <th>รหัสการจอง</th>
                            <th>จำนวนเงิน</th>
                            <th>วิธีการชำระเงิน</th>
                            <th>วันที่ชำระเงิน</th>
                            <th>สถานะ</th>
                            <th>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            payments.forEach(payment => {
                const paymentDate = new Date(payment.paymentDate);
                const formattedDate = paymentDate.toLocaleDateString('th-TH');
                
                tableHtml += `
                    <tr>
                        <td>${payment.paymentId || '-'}</td>
                        <td>${payment.booking ? payment.booking.bookingId : '-'}</td>
                        <td>฿${formatNumber(payment.amount || 0)}</td>
                        <td>${payment.paymentMethod || '-'}</td>
                        <td>${formattedDate}</td>
                        <td>
                            <span class="status-badge status-${getStatusClass(payment.paymentStatus)}">${getPaymentStatusLabel(payment.paymentStatus)}</span>
                        </td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn btn-view" title="ดูรายละเอียด" onclick="viewPayment('${payment.paymentId}')">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="action-btn btn-edit" title="แก้ไข" onclick="editPayment('${payment.paymentId}')">
                                    <i class="fas fa-edit"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });
            
            tableHtml += `
                    </tbody>
                </table>
            `;
            
            container.innerHTML = tableHtml;
        } else {
            container.innerHTML = `
                <div class="no-data-message">
                    <i class="fas fa-money-bill-wave"></i>
                    <h3>ไม่พบข้อมูลการชำระเงิน</h3>
                    <p>ยังไม่มีการชำระเงินในระบบ</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading payments:', error);
        const container = document.getElementById('paymentsTableContainer');
        if (container) {
            container.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle"></i>
                    <span>เกิดข้อผิดพลาดในการโหลดข้อมูลการชำระเงิน: ${error.message}</span>
                </div>
            `;
        }
    }
}

function getPaymentStatusLabel(status) {
    switch (status) {
        case 'Pending':
            return 'รอดำเนินการ';
        case 'Completed':
            return 'เสร็จสิ้น';
        case 'Failed':
            return 'ล้มเหลว';
        case 'Refunded':
            return 'คืนเงินแล้ว';
        default:
            return status || 'ไม่ระบุ';
    }
}



// ===== PROMOTIONS =====
async function loadPromotionsData() {
    try {
        let container = document.getElementById('promotionsTableContainer');
        
        if (!container) {
            console.warn('ไม่พบ element promotionsTableContainer');
            return;
        }
        
        try {
            // ลองตรวจสอบว่า API พร้อมใช้งานหรือไม่
            const isEndpointAvailable = await checkApiEndpoint('/admin/promotions');
            
            if (!isEndpointAvailable) {
                throw new Error('API endpoint not available');
            }
            
            const promotions = await apiService.request('/admin/promotions');
            
            if (promotions && promotions.length > 0) {
                // แสดงข้อมูลโปรโมชั่น (โค้ดเดิม)
                let tableHtml = `
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>รหัสโปรโมชั่น</th>
                                <th>ชื่อโปรโมชั่น</th>
                                <th>โค้ดส่วนลด</th>
                                <th>ส่วนลด</th>
                                <th>วันเริ่มต้น</th>
                                <th>วันสิ้นสุด</th>
                                <th>สถานะ</th>
                                <th>จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                
                // โค้ดส่วน loop แสดงข้อมูล...
                
                tableHtml += `
                        </tbody>
                    </table>
                `;
                
                container.innerHTML = tableHtml;
            } else {
                container.innerHTML = `
                    <div class="no-data-message">
                        <i class="fas fa-percentage"></i>
                        <h3>ไม่พบข้อมูลโปรโมชั่น</h3>
                        <p>ยังไม่มีโปรโมชั่นในระบบ</p>
                    </div>
                `;
            }
        } catch (error) {
            // กรณี API ยังไม่พร้อม
            if (error.message.includes('404') || error.message.includes('not available')) {
                container.innerHTML = `
                    <div class="no-data-message">
                        <i class="fas fa-tools"></i>
                        <h3>ฟีเจอร์โปรโมชั่นยังไม่พร้อมใช้งาน</h3>
                        <p>ฟีเจอร์นี้อยู่ระหว่างการพัฒนา กรุณาลองใหม่ในภายหลัง</p>
                    </div>
                `;
            } else {
                throw error; // ส่งต่อ error อื่นๆ
            }
        }
    } catch (error) {
        console.error('Error loading promotions:', error);
        const container = document.getElementById('promotionsTableContainer');
        if (container) {
            container.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle"></i>
                    <span>เกิดข้อผิดพลาดในการโหลดข้อมูลโปรโมชั่น: ${error.message}</span>
                </div>
            `;
        }
    }
}

// เพิ่มฟังก์ชัน loadDiscountsData


// ===== DISCOUNTS =====
async function loadDiscountsData() {
    try {
        const discounts = await apiService.request('/admin/discounts');
        const container = document.getElementById('discountsTableContainer');
        
        if (!container) {
            console.warn('ไม่พบ element discountsTableContainer');
            return;
        }
        
        if (discounts && discounts.length > 0) {
            let tableHtml = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>รหัสส่วนลด</th>
                            <th>มูลค่าส่วนลด</th>
                            <th>คะแนนที่ต้องใช้</th>
                            <th>วันหมดอายุ</th>
                            <th>สถานะ</th>
                            <th>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            discounts.forEach(discount => {
                const expiryDate = new Date(discount.expiryDate);
                const formattedExpiryDate = expiryDate.toLocaleDateString('th-TH');
                
                const today = new Date();
                const isActive = today <= expiryDate;
                
                tableHtml += `
                    <tr>
                        <td>${discount.discountId || '-'}</td>
                        <td>฿${formatNumber(discount.discountValue || 0)}</td>
                        <td>${discount.pointRequired || 0}</td>
                        <td>${formattedExpiryDate}</td>
                        <td>
                            <span class="status-badge status-${isActive ? 'confirmed' : 'cancelled'}">${isActive ? 'ใช้งานได้' : 'หมดอายุ'}</span>
                        </td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn btn-view" title="ดูรายละเอียด" onclick="viewDiscount('${discount.discountId}')">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="action-btn btn-edit" title="แก้ไข" onclick="editDiscount('${discount.discountId}')">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="action-btn btn-delete" title="ลบ" onclick="deleteDiscount('${discount.discountId}')">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });
            
            tableHtml += `
                    </tbody>
                </table>
            `;
            
            container.innerHTML = tableHtml;
        } else {
            container.innerHTML = `
                <div class="no-data-message">
                    <i class="fas fa-tags"></i>
                    <h3>ไม่พบข้อมูลส่วนลด</h3>
                    <p>ยังไม่มีส่วนลดในระบบ</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading discounts:', error);
        const container = document.getElementById('discountsTableContainer');
        if (container) {
            container.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle"></i>
                    <span>เกิดข้อผิดพลาดในการโหลดข้อมูลส่วนลด: ${error.message}</span>
                </div>
            `;
        }
    }
}



// ===== LOYALTY =====
async function loadLoyaltyData() {
    try {
        let container = document.getElementById('loyaltyPointsTableContainer');
        
        if (!container) {
            console.warn('ไม่พบ element loyaltyPointsTableContainer');
            return;
        }
        
        try {
            // ลองตรวจสอบว่า API พร้อมใช้งานหรือไม่
            const isEndpointAvailable = await checkApiEndpoint('/admin/loyalty-points');
            
            if (!isEndpointAvailable) {
                throw new Error('API endpoint not available');
            }
            
            const loyaltyPoints = await apiService.request('/admin/loyalty-points');
            
            if (loyaltyPoints && loyaltyPoints.length > 0) {
                // แสดงข้อมูลคะแนนสะสม (โค้ดเดิม)
                let tableHtml = `
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>รหัสผู้ใช้</th>
                                <th>ชื่อผู้ใช้</th>
                                <th>คะแนนสะสมทั้งหมด</th>
                                <th>คะแนนที่ใช้แล้ว</th>
                                <th>คะแนนคงเหลือ</th>
                                <th>จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                
                // โค้ดส่วน loop แสดงข้อมูล...
                
                tableHtml += `
                        </tbody>
                    </table>
                `;
                
                container.innerHTML = tableHtml;
            } else {
                container.innerHTML = `
                    <div class="no-data-message">
                        <i class="fas fa-gift"></i>
                        <h3>ไม่พบข้อมูลคะแนนสะสม</h3>
                        <p>ยังไม่มีข้อมูลคะแนนสะสมในระบบ</p>
                    </div>
                `;
            }
        } catch (error) {
            // กรณี API ยังไม่พร้อม
            if (error.message.includes('404') || error.message.includes('not available')) {
                container.innerHTML = `
                    <div class="no-data-message">
                        <i class="fas fa-tools"></i>
                        <h3>ฟีเจอร์คะแนนสะสมยังไม่พร้อมใช้งาน</h3>
                        <p>ฟีเจอร์นี้อยู่ระหว่างการพัฒนา กรุณาลองใหม่ในภายหลัง</p>
                    </div>
                `;
            } else {
                throw error; // ส่งต่อ error อื่นๆ
            }
        }
    } catch (error) {
        console.error('Error loading loyalty points:', error);
        const container = document.getElementById('loyaltyPointsTableContainer');
        if (container) {
            container.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle"></i>
                    <span>เกิดข้อผิดพลาดในการโหลดข้อมูลคะแนนสะสม: ${error.message}</span>
                </div>
            `;
        }
    }
}

// เพิ่มฟังก์ชัน loadReportsData


// ===== REPORTS =====
async function loadReportsData() {
    try {
        // แสดงรายงานตามแท็บที่กำลังแสดงอยู่
        const activeTab = document.querySelector('.tab-content.active');
        if (activeTab) {
            const tabId = activeTab.id;
            loadTabData(tabId);
        } else {
            // ถ้าไม่มีแท็บที่กำลังแสดงอยู่ ให้โหลดแท็บแรก
            document.getElementById('sales-report').classList.add('active');
            loadSalesReportData();
        }
    } catch (error) {
        console.error('Error loading reports data:', error);
    }
}

// เพิ่มฟังก์ชัน loadSalesReportData
async function loadSalesReportData() {
    try {
        const fromDate = document.getElementById('salesFromDate')?.value || formatDateForInput(new Date(new Date().setMonth(new Date().getMonth() - 1))).split('T')[0];
        const toDate = document.getElementById('salesToDate')?.value || formatDateForInput(new Date()).split('T')[0];
        
        const report = await apiService.request(`/admin/reports/revenue?fromDate=${fromDate}&toDate=${toDate}`);
        const container = document.getElementById('salesReportContent');
        
        if (!container) {
            console.warn('ไม่พบ element salesReportContent');
            return;
        }
        
        if (report) {
            // สร้าง HTML สำหรับแสดงรายงานยอดขาย
            let reportHtml = `
                <div class="report-summary">
                    <div class="summary-item">
                        <h3>รายได้ทั้งหมด</h3>
                        <div class="summary-value">฿${formatNumber(report.totalRevenue || 0)}</div>
                    </div>
                    <div class="summary-item">
                        <h3>จำนวนการจอง</h3>
                        <div class="summary-value">${report.totalBookings || 0}</div>
                    </div>
                    <div class="summary-item">
                        <h3>ราคาเฉลี่ยต่อการจอง</h3>
                        <div class="summary-value">฿${formatNumber(report.averageBookingPrice || 0)}</div>
                    </div>
                </div>
                
                <div class="report-chart">
                    <canvas id="salesReportChart" height="300"></canvas>
                </div>
            `;
            
            if (report.salesByDate && report.salesByDate.length > 0) {
                reportHtml += `
                    <div class="report-table">
                        <h3>รายได้ตามวันที่</h3>
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>วันที่</th>
                                    <th>รายได้</th>
                                    <th>จำนวนการจอง</th>
                                </tr>
                            </thead>
                            <tbody>
                `;
                
                report.salesByDate.forEach(item => {
                    const date = new Date(item.date);
                    const formattedDate = date.toLocaleDateString('th-TH');
                    
                    reportHtml += `
                        <tr>
                            <td>${formattedDate}</td>
                            <td>฿${formatNumber(item.revenue || 0)}</td>
                            <td>${item.bookings || 0}</td>
                        </tr>
                    `;
                });
                
                reportHtml += `
                            </tbody>
                        </table>
                    </div>
                `;
            }
            
            container.innerHTML = reportHtml;
            
            // สร้างกราฟแสดงรายงานยอดขาย
            if (report.salesByDate && report.salesByDate.length > 0) {
                const ctx = document.getElementById('salesReportChart').getContext('2d');
                const dates = report.salesByDate.map(item => {
                    const date = new Date(item.date);
                    return date.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit' });
                });
                const revenues = report.salesByDate.map(item => item.revenue || 0);
                
                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: dates,
                        datasets: [{
                            label: 'รายได้ (บาท)',
                            data: revenues,
                            backgroundColor: 'rgba(0, 123, 255, 0.2)',
                            borderColor: 'rgba(0, 123, 255, 1)',
                            borderWidth: 2,
                            tension: 0.1,
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    callback: function(value) {
                                        return '฿' + value.toLocaleString('en-US');
                                    }
                                }
                            }
                        },
                        plugins: {
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return '฿' + context.raw.toLocaleString('en-US');
                                    }
                                }
                            }
                        }
                    }
                });
            }
        } else {
            container.innerHTML = `
                <div class="no-data-message">
                    <i class="fas fa-chart-line"></i>
                    <h3>ไม่พบข้อมูลรายงานยอดขาย</h3>
                    <p>ไม่มีข้อมูลรายงานยอดขายในช่วงเวลาที่เลือก</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading sales report data:', error);
        const container = document.getElementById('salesReportContent');
        if (container) {
            container.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle"></i>
                    <span>เกิดข้อผิดพลาดในการโหลดข้อมูลรายงานยอดขาย: ${error.message}</span>
                </div>
            `;
        }
    }
}

// เพิ่มฟังก์ชัน loadBookingReportData
async function loadBookingReportData() {
    try {
        const fromDate = document.getElementById('bookingFromDate')?.value || formatDateForInput(new Date(new Date().setMonth(new Date().getMonth() - 1))).split('T')[0];
        const toDate = document.getElementById('bookingToDate')?.value || formatDateForInput(new Date()).split('T')[0];
        
        const report = await apiService.request(`/admin/reports/bookings?fromDate=${fromDate}&toDate=${toDate}`);
        const container = document.getElementById('bookingReportContent');
        
        if (!container) {
            console.warn('ไม่พบ element bookingReportContent');
            return;
        }
        
        if (report) {
            // สร้าง HTML สำหรับแสดงรายงานการจอง
            let reportHtml = `
                <div class="report-summary">
                    <div class="summary-item">
                        <h3>จำนวนการจองทั้งหมด</h3>
                        <div class="summary-value">${report.totalBookings || 0}</div>
                    </div>
                    <div class="summary-item">
                        <h3>จำนวนผู้โดยสารทั้งหมด</h3>
                        <div class="summary-value">${report.totalPassengers || 0}</div>
                    </div>
                    <div class="summary-item">
                        <h3>อัตราการเต็มที่นั่ง</h3>
                        <div class="summary-value">${report.occupancyRate || 0}%</div>
                    </div>
                </div>
                
                <div class="report-chart">
                    <canvas id="bookingReportChart" height="300"></canvas>
                </div>
            `;
            
            if (report.bookingsByStatus && Object.keys(report.bookingsByStatus).length > 0) {
                reportHtml += `
                    <div class="report-table">
                        <h3>จำนวนการจองตามสถานะ</h3>
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>สถานะ</th>
                                    <th>จำนวน</th>
                                </tr>
                            </thead>
                            <tbody>
                `;
                
                for (const [status, count] of Object.entries(report.bookingsByStatus)) {
                    reportHtml += `
                        <tr>
                            <td>${getStatusLabel(status)}</td>
                            <td>${count}</td>
                        </tr>
                    `;
                }
                
                reportHtml += `
                            </tbody>
                        </table>
                    </div>
                `;
            }
            
            container.innerHTML = reportHtml;
            
            // สร้างกราฟแสดงรายงานการจอง
            if (report.bookingsByDate && report.bookingsByDate.length > 0) {
                const ctx = document.getElementById('bookingReportChart').getContext('2d');
                const dates = report.bookingsByDate.map(item => {
                    const date = new Date(item.date);
                    return date.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit' });
                });
                const bookings = report.bookingsByDate.map(item => item.bookings || 0);
                
                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: dates,
                        datasets: [{
                            label: 'จำนวนการจอง',
                            data: bookings,
                            backgroundColor: 'rgba(40, 167, 69, 0.2)',
                            borderColor: 'rgba(40, 167, 69, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    stepSize: 1
                                }
                            }
                        }
                    }
                });
            }
        } else {
            container.innerHTML = `
                <div class="no-data-message">
                    <i class="fas fa-ticket-alt"></i>
                    <h3>ไม่พบข้อมูลรายงานการจอง</h3>
                    <p>ไม่มีข้อมูลรายงานการจองในช่วงเวลาที่เลือก</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading booking report data:', error);
        const container = document.getElementById('bookingReportContent');
        if (container) {
            container.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle"></i>
                    <span>เกิดข้อผิดพลาดในการโหลดข้อมูลรายงานการจอง: ${error.message}</span>
                </div>
            `;
        }
    }
}

// เพิ่มฟังก์ชัน loadUserReportData
async function loadUserReportData() {
    try {
        const report = await apiService.request('/admin/reports/users');
        const container = document.getElementById('userReportContent');
        
        if (!container) {
            console.warn('ไม่พบ element userReportContent');
            return;
        }
        
        if (report) {
            // สร้าง HTML สำหรับแสดงรายงานผู้ใช้
            let reportHtml = `
                <div class="report-summary">
                    <div class="summary-item">
                        <h3>จำนวนผู้ใช้ทั้งหมด</h3>
                        <div class="summary-value">${report.totalUsers || 0}</div>
                    </div>
                    <div class="summary-item">
                        <h3>ผู้ใช้ที่ลงทะเบียนใหม่</h3>
                        <div class="summary-value">${report.newUsers || 0}</div>
                    </div>
                    <div class="summary-item">
                        <h3>ผู้ใช้ที่มีการจอง</h3>
                        <div class="summary-value">${report.activeUsers || 0}</div>
                    </div>
                </div>
                
                <div class="report-chart">
                    <canvas id="userReportChart" height="300"></canvas>
                </div>
            `;
            
            if (report.usersByRole && Object.keys(report.usersByRole).length > 0) {
                reportHtml += `
                    <div class="report-table">
                        <h3>จำนวนผู้ใช้ตามบทบาท</h3>
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>บทบาท</th>
                                    <th>จำนวน</th>
                                </tr>
                            </thead>
                            <tbody>
                `;
                
                for (const [role, count] of Object.entries(report.usersByRole)) {
                    reportHtml += `
                        <tr>
                            <td>${role}</td>
                            <td>${count}</td>
                        </tr>
                    `;
                }
                
                reportHtml += `
                            </tbody>
                        </table>
                    </div>
                `;
            }
            
            container.innerHTML = reportHtml;
            
            // สร้างกราฟแสดงรายงานผู้ใช้
            if (report.usersByRole && Object.keys(report.usersByRole).length > 0) {
                const ctx = document.getElementById('userReportChart').getContext('2d');
                const roles = Object.keys(report.usersByRole);
                const counts = Object.values(report.usersByRole);
                
                new Chart(ctx, {
                    type: 'pie',
                    data: {
                        labels: roles,
                        datasets: [{
                            data: counts,
                            backgroundColor: [
                                'rgba(255, 99, 132, 0.2)',
                                'rgba(54, 162, 235, 0.2)',
                                'rgba(255, 206, 86, 0.2)',
                                'rgba(75, 192, 192, 0.2)',
                                'rgba(153, 102, 255, 0.2)'
                            ],
                            borderColor: [
                                'rgba(255, 99, 132, 1)',
                                'rgba(54, 162, 235, 1)',
                                'rgba(255, 206, 86, 1)',
                                'rgba(75, 192, 192, 1)',
                                'rgba(153, 102, 255, 1)'
                            ],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                            legend: {
                                position: 'right'
                            }
                        }
                    }
                });
            }
        } else {
            container.innerHTML = `
                <div class="no-data-message">
                    <i class="fas fa-users"></i>
                    <h3>ไม่พบข้อมูลรายงานผู้ใช้</h3>
                    <p>ไม่มีข้อมูลรายงานผู้ใช้ในระบบ</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading user report data:', error);
        const container = document.getElementById('userReportContent');
        if (container) {
            container.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle"></i>
                    <span>เกิดข้อผิดพลาดในการโหลดข้อมูลรายงานผู้ใช้: ${error.message}</span>
                </div>
            `;
        }
    }
}

// Helper Functions


// ===== HELPER FUNCTIONS =====
function formatDateForInput(date) {
    return date.toISOString().slice(0, 19);
}

function formatNumber(number) {
    return parseFloat(number).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}



// ===== SETTINGS & AUTH =====
function checkAuthAndAccess() {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (!token || !userData) {
        window.location.href = 'login.html?redirect=admin';
        return;
    }
    
    try {
        const user = JSON.parse(userData);
        
        if (user.role !== 'Admin' && user.role !== 'Staff') {
            showAccessDenied();
            return;
        }
        
        document.getElementById('adminName').textContent = `${user.firstName || ''} ${user.lastName || ''}`;
        document.getElementById('adminRole').textContent = user.role;
        document.getElementById('adminContent').style.display = 'block';
    } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        window.location.href = 'login.html?session_expired=true';
    }
}

function showAccessDenied() {
    document.getElementById('adminContent').innerHTML = `
        <div class="access-denied">
            <div class="container">
                <div class="access-denied-container">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h2>การเข้าถึงถูกปฏิเสธ</h2>
                    <p>คุณไม่มีสิทธิ์เข้าถึงหน้านี้ เฉพาะผู้ดูแลระบบและพนักงานเท่านั้นที่สามารถเข้าถึงได้</p>
                    <div class="access-denied-actions">
                        <a href="index.html" class="btn btn-primary">กลับไปยังหน้าหลัก</a>
                        <a href="login.html" class="btn btn-outline">เข้าสู่ระบบใหม่</a>
                    </div>
                </div>
            </div>
        </div>
    `;
}



// ===== EVENT LISTENERS =====
function setupEventListeners() {
    document.getElementById('logoutBtn').addEventListener('click', function() {
        apiService.logout();
    });
    
    document.getElementById('toggleSidebar').addEventListener('click', function() {
        document.getElementById('adminSidebar').classList.toggle('active');
    });
    
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const pageName = this.getAttribute('data-page');
            window.location.hash = pageName;
            changePage(pageName);
        });
    });
    
    window.addEventListener('hashchange', function() {
        const pageName = window.location.hash.substr(1);
        if (pageName) {
            changePage(pageName);
        }
    });
    
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabGroup = this.closest('.content-tabs');
            const tabName = this.getAttribute('data-tab');
            
            tabGroup.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active');
            });
            
            this.classList.add('active');
            
            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(content => {
                content.classList.remove('active');
            });
            
            document.getElementById(tabName).classList.add('active');
            loadTabData(tabName);
        });
    });
    
    setupSearchForms();
    setupAddButtons();
    setupModals();
    
    // เพิ่ม event listener สำหรับ form ตั้งค่าระบบ
    document.getElementById('settingsForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        saveSettings();
    });
    
    // เพิ่ม event listener สำหรับปุ่มในรายงาน
    document.getElementById('generateSalesReportBtn')?.addEventListener('click', generateSalesReport);
    document.getElementById('generateBookingReportBtn')?.addEventListener('click', generateBookingReport);
    document.getElementById('generateUserReportBtn')?.addEventListener('click', generateUserReport);
    
    // เพิ่ม event listener สำหรับการ refresh ข้อมูล
    document.getElementById('refreshRecentBookings')?.addEventListener('click', loadRecentBookings);
    document.getElementById('refreshRecentUsers')?.addEventListener('click', loadRecentUsers);
}

function changePage(pageName) {
    document.querySelectorAll('.admin-page').forEach(page => {
        page.classList.remove('active');
    });
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    document.getElementById(`${pageName}-page`).classList.add('active');
    document.querySelector(`.menu-item[data-page="${pageName}"]`).classList.add('active');
    loadPageData(pageName);
    if (window.innerWidth <= 992) {
        document.getElementById('adminSidebar').classList.remove('active');
    }
}

function loadPageData(pageName) {
    switch (pageName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'users':
            loadUsersData();
            break;
        case 'staff':
            loadStaffData();
            break;
        case 'flights':
            loadFlightsData();
            break;
        case 'seats':
            loadSeatsData();
            break;
        case 'bookings':
            loadBookingsData();
            break;
        case 'payments':
            loadPaymentsData();
            break;
        case 'promotions':
            loadPromotionsData();
            break;
        case 'discounts':
            loadDiscountsData();
            break;
        case 'loyalty':
            loadLoyaltyData();
            break;
        case 'reports':
            loadReportsData();
            break;
        case 'settings':
            loadSettingsData();
            break;
        default:
            console.warn(`No data loader for page: ${pageName}`);
    }
}

function loadTabData(tabName) {
    switch (tabName) {
        case 'all-users':
            loadAllUsersData();
            break;
        case 'admin-users':
            loadAdminUsersData();
            break;
        case 'staff-users':
            loadStaffUsersData();
            break;
        case 'customer-users':
            loadCustomerUsersData();
            break;
        case 'all-flights':
            loadAllFlightsData();
            break;
        case 'upcoming-flights':
            loadUpcomingFlightsData();
            break;
        case 'completed-flights':
            loadCompletedFlightsData();
            break;
        case 'cancelled-flights':
            loadCancelledFlightsData();
            break;
        case 'sales-report':
            loadSalesReportData();
            break;
        case 'booking-report':
            loadBookingReportData();
            break;
        case 'user-report':
            loadUserReportData();
            break;
        default:
            console.warn(`No data loader for tab: ${tabName}`);
    }
}

// เพิ่มฟังก์ชันสำหรับตรวจสอบความพร้อมใช้งานของ API endpoint
async function checkApiEndpoint(endpoint) {
    try {
        const response = await fetch(`http://localhost:8080/api${endpoint}`, {
            method: 'HEAD',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            // ตั้งค่า timeout เพื่อไม่ให้รอนานเกินไป
            signal: AbortSignal.timeout(2000) // 2 วินาที (ต้องการ modern browser)
        });
        
        return response.ok;
    } catch (error) {
        console.warn(`API endpoint ${endpoint} ไม่พร้อมใช้งาน:`, error.message);
        return false;
    }
}

function setupSearchForms() {
    // User search
    document.getElementById('userSearchBtn').addEventListener('click', function() {
        const searchTerm = document.getElementById('userSearchInput').value.trim();
        searchUsers(searchTerm);
    });
    
    document.getElementById('userSearchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const searchTerm = this.value.trim();
            searchUsers(searchTerm);
        }
    });
    
    // Flight search
    document.getElementById('flightSearchBtn').addEventListener('click', function() {
        const searchTerm = document.getElementById('flightSearchInput').value.trim();
        searchFlights(searchTerm);
    });
    
    document.getElementById('flightSearchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const searchTerm = this.value.trim();
            searchFlights(searchTerm);
        }
    });
    
    // Booking search
    document.getElementById('bookingSearchBtn').addEventListener('click', function() {
        const searchTerm = document.getElementById('bookingSearchInput').value.trim();
        searchBookings(searchTerm);
    });
    
    document.getElementById('bookingSearchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const searchTerm = this.value.trim();
            searchBookings(searchTerm);
        }
    });
    
    // Seat search
    document.getElementById('seatSearchBtn')?.addEventListener('click', function() {
        const searchTerm = document.getElementById('seatSearchInput').value.trim();
        searchSeats(searchTerm);
    });
    
    document.getElementById('seatSearchInput')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const searchTerm = this.value.trim();
            searchSeats(searchTerm);
        }
    });
    
    // Payment search
    document.getElementById('paymentSearchBtn').addEventListener('click', function() {
        const searchTerm = document.getElementById('paymentSearchInput').value.trim();
        searchPayments(searchTerm);
    });
    
    document.getElementById('paymentSearchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const searchTerm = this.value.trim();
            searchPayments(searchTerm);
        }
    });
    
    // Promotion search
    document.getElementById('promotionSearchBtn')?.addEventListener('click', function() {
        const searchTerm = document.getElementById('promotionSearchInput').value.trim();
        searchPromotions(searchTerm);
    });
    
    document.getElementById('promotionSearchInput')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const searchTerm = this.value.trim();
            searchPromotions(searchTerm);
        }
    });
    
    // Discount search
    document.getElementById('discountSearchBtn')?.addEventListener('click', function() {
        const searchTerm = document.getElementById('discountSearchInput').value.trim();
        searchDiscounts(searchTerm);
    });
    
    document.getElementById('discountSearchInput')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const searchTerm = this.value.trim();
            searchDiscounts(searchTerm);
        }
    });
    
    // Loyalty search
    document.getElementById('loyaltySearchBtn')?.addEventListener('click', function() {
        const searchTerm = document.getElementById('loyaltySearchInput').value.trim();
        searchLoyalty(searchTerm);
    });
    
    document.getElementById('loyaltySearchInput')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const searchTerm = this.value.trim();
            searchLoyalty(searchTerm);
        }
    });
    
    // Status filters
    document.getElementById('bookingStatusFilter').addEventListener('change', function() {
        const status = this.value;
        filterBookingsByStatus(status);
    });
    
    document.getElementById('paymentStatusFilter').addEventListener('change', function() {
        const status = this.value;
        filterPaymentsByStatus(status);
    });
}

function setupAddButtons() {
    document.getElementById('addUserBtn').addEventListener('click', function() {
        openUserModal('add');
    });
    
    document.getElementById('addFlightBtn').addEventListener('click', function() {
        openFlightModal('add');
    });
    
    document.getElementById('addBookingBtn').addEventListener('click', function() {
        openBookingModal('add');
    });
    
    document.getElementById('addSeatBtn')?.addEventListener('click', function() {
        openSeatModal('add');
    });
    
    document.getElementById('addPromotionBtn')?.addEventListener('click', function() {
        openPromotionModal('add');
    });
    
    document.getElementById('addDiscountBtn')?.addEventListener('click', function() {
        openDiscountModal('add');
    });
    
    document.getElementById('addLoyaltyBtn')?.addEventListener('click', function() {
        openLoyaltyModal('add');
    });
}

function setupModals() {
    // User Modal
    document.getElementById('closeUserModal').addEventListener('click', function() {
        closeUserModal();
    });
    
    document.getElementById('cancelUserBtn').addEventListener('click', function() {
        closeUserModal();
    });
    
    document.getElementById('saveUserBtn').addEventListener('click', function() {
        saveUser();
    });
    
    // Flight Modal
    document.getElementById('closeFlightModal').addEventListener('click', function() {
        closeFlightModal();
    });
    
    document.getElementById('cancelFlightBtn').addEventListener('click', function() {
        closeFlightModal();
    });
    
    document.getElementById('saveFlightBtn').addEventListener('click', function() {
        saveFlight();
    });
    
    // Booking Modal
    document.getElementById('closeBookingModal').addEventListener('click', function() {
        closeBookingModal();
    });
    
    document.getElementById('cancelBookingBtn').addEventListener('click', function() {
        closeBookingModal();
    });
    
    document.getElementById('saveBookingBtn').addEventListener('click', function() {
        saveBooking();
    });
    
    // Seat Modal - ถ้ามี
    document.getElementById('closeSeatModal')?.addEventListener('click', function() {
        closeSeatModal();
    });
    
    document.getElementById('cancelSeatBtn')?.addEventListener('click', function() {
        closeSeatModal();
    });
    
    document.getElementById('saveSeatBtn')?.addEventListener('click', function() {
        saveSeat();
    });
    
    // Promotion Modal - ถ้ามี
    document.getElementById('closePromotionModal')?.addEventListener('click', function() {
        closePromotionModal();
    });
    
    document.getElementById('cancelPromotionBtn')?.addEventListener('click', function() {
        closePromotionModal();
    });
    
    document.getElementById('savePromotionBtn')?.addEventListener('click', function() {
        savePromotion();
    });
    
    // Discount Modal - ถ้ามี
    document.getElementById('closeDiscountModal')?.addEventListener('click', function() {
        closeDiscountModal();
    });
    
    document.getElementById('cancelDiscountBtn')?.addEventListener('click', function() {
        closeDiscountModal();
    });
    
    document.getElementById('saveDiscountBtn')?.addEventListener('click', function() {
        saveDiscount();
    });
    
    // Loyalty Modal - ถ้ามี
    document.getElementById('closeLoyaltyModal')?.addEventListener('click', function() {
        closeLoyaltyModal();
    });
    
    document.getElementById('cancelLoyaltyBtn')?.addEventListener('click', function() {
        closeLoyaltyModal();
    });
    
    document.getElementById('saveLoyaltyBtn')?.addEventListener('click', function() {
        saveLoyalty();
    });
}

// ============ DASHBOARD FUNCTIONS ============



// ===== DASHBOARD FUNCTIONS =====
async function loadDashboardData() {
    try {
        const stats = await apiService.request('/admin/dashboard/stats');
        const statsContainer = document.getElementById('dashboardStats');
        
        if (stats) {
            statsContainer.innerHTML = `
                <div class="stat-card card-blue">
                    <div class="stat-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="stat-value">${stats.totalUsers || 0}</div>
                    <div class="stat-label">ผู้ใช้ทั้งหมด</div>
                    ${stats.userChange > 0 ? 
                        `<div class="stat-change">
                            <i class="fas fa-arrow-up"></i> เพิ่มขึ้น ${stats.userChange}%
                        </div>` : 
                        stats.userChange < 0 ? 
                        `<div class="stat-change negative">
                            <i class="fas fa-arrow-down"></i> ลดลง ${Math.abs(stats.userChange)}%
                        </div>` : 
                        ''}
                </div>
                
                <div class="stat-card card-green">
                    <div class="stat-icon">
                        <i class="fas fa-ticket-alt"></i>
                    </div>
                    <div class="stat-value">${stats.totalBookings || 0}</div>
                    <div class="stat-label">การจองทั้งหมดในเดือนนี้</div>
                    ${stats.bookingChange > 0 ? 
                        `<div class="stat-change">
                            <i class="fas fa-arrow-up"></i> เพิ่มขึ้น ${stats.bookingChange}%
                        </div>` : 
                        stats.bookingChange < 0 ? 
                        `<div class="stat-change negative">
                            <i class="fas fa-arrow-down"></i> ลดลง ${Math.abs(stats.bookingChange)}%
                        </div>` : 
                        ''}
                </div>
                
                <div class="stat-card card-orange">
                    <div class="stat-icon">
                        <i class="fas fa-money-bill-wave"></i>
                    </div>
                    <div class="stat-value">฿${formatNumber(stats.totalRevenue || 0)}</div>
                    <div class="stat-label">รายได้ทั้งหมดในเดือนนี้</div>
                    ${stats.revenueChange > 0 ? 
                        `<div class="stat-change">
                            <i class="fas fa-arrow-up"></i> เพิ่มขึ้น ${stats.revenueChange}%
                        </div>` : 
                        stats.revenueChange < 0 ? 
                        `<div class="stat-change negative">
                            <i class="fas fa-arrow-down"></i> ลดลง ${Math.abs(stats.revenueChange)}%
                        </div>` : 
                        ''}
                </div>
                
                <div class="stat-card card-red">
                    <div class="stat-icon">
                        <i class="fas fa-plane-departure"></i>
                    </div>
                    <div class="stat-value">${stats.totalFlights || 0}</div>
                    <div class="stat-label">เที่ยวบินในวันนี้</div>
                    ${stats.flightChange > 0 ? 
                        `<div class="stat-change">
                            <i class="fas fa-arrow-up"></i> เพิ่มขึ้น ${stats.flightChange}%
                        </div>` : 
                        stats.flightChange < 0 ? 
                        `<div class="stat-change negative">
                            <i class="fas fa-arrow-down"></i> ลดลง ${Math.abs(stats.flightChange)}%
                        </div>` : 
                        ''}
                </div>
            `;
        } else {
            statsContainer.innerHTML = `
                <div class="no-data-message">
                    <i class="fas fa-chart-area"></i>
                    <h3>ไม่พบข้อมูลสถิติ</h3>
                    <p>ไม่สามารถโหลดข้อมูลสถิติได้ในขณะนี้</p>
                </div>
            `;
        }
        
        const revenueData = await apiService.request('/admin/dashboard/revenue-chart');
        const ctx = document.getElementById('revenueChart').getContext('2d');
        
        if (revenueData && revenueData.labels && revenueData.data) {
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: revenueData.labels,
                    datasets: [{
                        label: 'รายได้ (บาท)',
                        data: revenueData.data,
                        backgroundColor: 'rgba(0, 102, 204, 0.2)',
                        borderColor: 'rgba(0, 102, 204, 1)',
                        borderWidth: 2,
                        tension: 0.1,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return '฿' + value.toLocaleString();
                                }
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return '฿' + context.raw.toLocaleString();
                                }
                            }
                        }
                    }
                }
            });
        } else {
            document.querySelector('.chart-container').innerHTML = `
                <div class="no-data-message">
                    <i class="fas fa-chart-line"></i>
                    <h3>ไม่พบข้อมูลกราฟ</h3>
                    <p>ไม่สามารถโหลดข้อมูลกราฟรายได้ได้ในขณะนี้</p>
                </div>
            `;
        }
        
        await loadRecentBookings();
        await loadRecentUsers();
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        document.getElementById('dashboardStats').innerHTML = `
            <div class="alert alert-danger" style="grid-column: 1 / -1;">
                <i class="fas fa-exclamation-circle"></i>
                <span>เกิดข้อผิดพลาดในการโหลดข้อมูลแดชบอร์ด: ${error.message}</span>
            </div>
        `;
    }
}

async function loadRecentBookings() {
    try {
        const bookings = await apiService.request('/admin/dashboard/recent-bookings');
        const container = document.getElementById('recentBookingsContainer');
        
        if (bookings && bookings.length > 0) {
            let tableHtml = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>รหัสการจอง</th>
                            <th>ชื่อผู้โดยสาร</th>
                            <th>เที่ยวบิน</th>
                            <th>สถานะ</th>
                            <th>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            bookings.forEach(booking => {
                tableHtml += `
                    <tr>
                        <td>${booking.BookingID || '-'}</td>
                        <td>${booking.PassengerName || '-'}</td>
                        <td>${booking.FlightNumber || '-'} ${booking.DepartureCity || '-'}-${booking.ArrivalCity || '-'}</td>
                        <td>
                            <span class="status-badge status-${getStatusClass(booking.BookingStatus)}">${getStatusLabel(booking.BookingStatus)}</span>
                        </td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn btn-view" title="ดูรายละเอียด" onclick="viewBooking('${booking.BookingID}')">
                                    <i class="fas fa-eye"></i>
                                </button>
                                ${booking.BookingStatus !== 'Cancelled' ? `
                                    <button class="action-btn btn-edit" title="แก้ไข" onclick="editBooking('${booking.BookingID}')">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                ` : ''}
                            </div>
                        </td>
                    </tr>
                `;
            });
            
            tableHtml += `
                    </tbody>
                </table>
            `;
            
            container.innerHTML = tableHtml;
        } else {
            container.innerHTML = `
                <div class="no-data-message">
                    <i class="fas fa-ticket-alt"></i>
                    <h3>ไม่พบข้อมูลการจอง</h3>
                    <p>ยังไม่มีการจองล่าสุด</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading recent bookings:', error);
        document.getElementById('recentBookingsContainer').innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle"></i>
                <span>เกิดข้อผิดพลาดในการโหลดข้อมูลการจองล่าสุด: ${error.message}</span>
            </div>
        `;
    }
}

async function loadRecentUsers() {
    try {
        const users = await apiService.request('/admin/dashboard/recent-users');
        const container = document.getElementById('recentUsersContainer');
        
        if (users && users.length > 0) {
            let tableHtml = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ชื่อผู้ใช้</th>
                            <th>อีเมล</th>
                            <th>สถานะ</th>
                            <th>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            users.forEach(user => {
                tableHtml += `
                    <tr>
                        <td>${user.Username || '-'}</td>
                        <td>${user.Email || '-'}</td>
                        <td>
                            <span class="status-badge status-${user.Status === 'Active' ? 'confirmed' : 'cancelled'}">${user.Status === 'Active' ? 'ใช้งานอยู่' : 'ไม่ได้ใช้งาน'}</span>
                        </td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn btn-view" title="ดูรายละเอียด" onclick="viewUser('${user.UserID}')">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="action-btn btn-edit" title="แก้ไข" onclick="editUser('${user.UserID}')">
                                    <i class="fas fa-edit"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });
            
            tableHtml += `
                    </tbody>
                </table>
            `;
            
            container.innerHTML = tableHtml;
        } else {
            container.innerHTML = `
                <div class="no-data-message">
                    <i class="fas fa-users"></i>
                    <h3>ไม่พบข้อมูลผู้ใช้</h3>
                    <p>ยังไม่มีผู้ใช้ล่าสุด</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading recent users:', error);
        document.getElementById('recentUsersContainer').innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle"></i>
                <span>เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้ล่าสุด: ${error.message}</span>
            </div>
        `;
    }
}

// ============ USER FUNCTIONS ============



// ===== USERS =====
async function loadUsersData() {
    try {
        await loadAllUsersData();
        const totalUsers = await apiService.request('/admin/users/count');
        if (totalUsers && totalUsers.count) {
            renderPagination('usersPagination', totalUsers.count, 10, 1, loadUsersByPage);
        }
    } catch (error) {
        console.error('Error loading users data:', error);
        document.getElementById('usersTableContainer').innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle"></i>
                <span>เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้: ${error.message}</span>
            </div>
        `;
    }
}

async function loadAllUsersData() {
    try {
        const users = await apiService.request('/admin/users');
        const container = document.getElementById('usersTableContainer');
        
        if (users && users.length > 0) {
            let tableHtml = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>รหัสผู้ใช้</th>
                            <th>ชื่อผู้ใช้</th>
                            <th>ชื่อ-นามสกุล</th>
                            <th>อีเมล</th>
                            <th>เบอร์โทรศัพท์</th>
                            <th>บทบาท</th>
                            <th>สถานะ</th>
                            <th>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            users.forEach(user => {
                tableHtml += `
                    <tr>
                        <td>${user.UserID || '-'}</td>
                        <td>${user.Username || '-'}</td>
                        <td>${user.FirstName || ''} ${user.LastName || ''}</td>
                        <td>${user.Email || '-'}</td>
                        <td>${user.Phone || '-'}</td>
                        <td>${user.Role || '-'}</td>
                        <td>
                            <span class="status-badge status-${user.Status === 'Active' ? 'confirmed' : 'cancelled'}">${user.Status === 'Active' ? 'ใช้งานอยู่' : 'ไม่ได้ใช้งาน'}</span>
                        </td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn btn-view" title="ดูรายละเอียด" onclick="viewUser('${user.UserID}')">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="action-btn btn-edit" title="แก้ไข" onclick="editUser('${user.UserID}')">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="action-btn btn-delete" title="ลบ" onclick="deleteUser('${user.UserID}')">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });
            
            tableHtml += `
                    </tbody>
                </table>
            `;
            
            container.innerHTML = tableHtml;
        } else {
            container.innerHTML = `
                <div class="no-data-message">
                    <i class="fas fa-users"></i>
                    <h3>ไม่พบข้อมูลผู้ใช้</h3>
                    <p>ยังไม่มีผู้ใช้ในระบบ</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading all users:', error);
        document.getElementById('usersTableContainer').innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle"></i>
                <span>เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้ทั้งหมด: ${error.message}</span>
            </div>
        `;
    }
}

function openUserModal(mode, userData = null) {
    document.getElementById('userModalTitle').textContent = mode === 'add' ? 'เพิ่มผู้ใช้ใหม่' : 'แก้ไขข้อมูลผู้ใช้';
    document.getElementById('userForm').reset();
    
    if (mode === 'edit' && userData) {
        document.getElementById('userId').value = userData.UserID;
        document.getElementById('username').value = userData.Username || '';
        document.getElementById('email').value = userData.Email || '';
        document.getElementById('firstName').value = userData.FirstName || '';
        document.getElementById('lastName').value = userData.LastName || '';
        document.getElementById('phone').value = userData.Phone || '';
        document.getElementById('address').value = userData.Address || '';
        document.getElementById('role').value = userData.Role || 'Customer';
        document.getElementById('passwordHelp').style.display = 'block';
    } else {
        document.getElementById('userId').value = '';
        document.getElementById('passwordHelp').style.display = 'none';
    }
    
    document.getElementById('userModal').classList.add('active');
}

function closeUserModal() {
    document.getElementById('userModal').classList.remove('active');
}

async function saveUser() {
    try {
        if (!validateUserForm()) {
            return;
        }
        
        const userId = document.getElementById('userId').value;
        const userData = {
            username: document.getElementById('username').value,
            email: document.getElementById('email').value,
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            role: document.getElementById('role').value,
            status: 'Active'
        };

        const password = document.getElementById('password').value;
        if (password) {
            userData.password = password;
        }
        
        if (userId) {
            // UPDATE
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(userData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update user');
            }
            
            showNotification('แก้ไขข้อมูลผู้ใช้สำเร็จ', 'success');
        } else {
            // CREATE
            if (!password) {
                showNotification('กรุณากรอกรหัสผ่าน', 'error');
                return;
            }
            
            const response = await fetch('/api/admin/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(userData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create user');
            }
            
            showNotification('เพิ่มผู้ใช้ใหม่สำเร็จ', 'success');
        }
        
        closeUserModal();
        await loadUsersData();
    } catch (error) {
        console.error('Error saving user:', error);
        showNotification(`ไม่สามารถบันทึกข้อมูลผู้ใช้ได้: ${error.message}`, 'error');
    }
}

// ============ FLIGHT FUNCTIONS ============



// ===== FLIGHTS =====
async function loadFlightsData() {
    try {
        await loadAllFlightsData();
        const totalFlights = await apiService.request('/admin/flights/count');
        if (totalFlights && totalFlights.count) {
            renderPagination('flightsPagination', totalFlights.count, 10, 1, loadFlightsByPage);
        }
    } catch (error) {
        console.error('Error loading flights data:', error);
        document.getElementById('flightsTableContainer').innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle"></i>
                <span>เกิดข้อผิดพลาดในการโหลดข้อมูลเที่ยวบิน: ${error.message}</span>
            </div>
        `;
    }
}

async function loadAllFlightsData() {
    try {
        const flights = await apiService.request('/admin/flights');
        const container = document.getElementById('flightsTableContainer');
        
        if (flights && flights.length > 0) {
            let tableHtml = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>รหัสเที่ยวบิน</th>
                            <th>หมายเลขเที่ยวบิน</th>
                            <th>ต้นทาง</th>
                            <th>ปลายทาง</th>
                            <th>วันที่ออกเดินทาง</th>
                            <th>เวลาออกเดินทาง</th>
                            <th>สถานะ</th>
                            <th>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            flights.forEach(flight => {
                const departureDateTime = new Date(flight.DepartureTime);
                const departureDate = departureDateTime.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' });
                const departureTime = departureDateTime.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
                
                tableHtml += `
                    <tr>
                        <td>${flight.FlightID || '-'}</td>
                        <td>${flight.FlightNumber || '-'}</td>
                        <td>${flight.DepartureCity || '-'}</td>
                        <td>${flight.ArrivalCity || '-'}</td>
                        <td>${departureDate}</td>
                        <td>${departureTime}</td>
                        <td>
                            <span class="status-badge status-${getStatusClass(flight.FlightStatus)}">${getFlightStatusLabel(flight.FlightStatus)}</span>
                        </td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn btn-view" title="ดูรายละเอียด" onclick="viewFlight('${flight.FlightID}')">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="action-btn btn-edit" title="แก้ไข" onclick="editFlight('${flight.FlightID}')">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="action-btn btn-delete" title="ลบ" onclick="deleteFlight('${flight.FlightID}')">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });
            
            tableHtml += `
                    </tbody>
                </table>
            `;
            
            container.innerHTML = tableHtml;
        } else {
            container.innerHTML = `
                <div class="no-data-message">
                    <i class="fas fa-plane"></i>
                    <h3>ไม่พบข้อมูลเที่ยวบิน</h3>
                    <p>ยังไม่มีเที่ยวบินในระบบ</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading all flights:', error);
        document.getElementById('flightsTableContainer').innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle"></i>
                <span>เกิดข้อผิดพลาดในการโหลดข้อมูลเที่ยวบินทั้งหมด: ${error.message}</span>
            </div>
        `;
    }
}

async function loadUpcomingFlightsData() {
    try {
        const flights = await apiService.request('/admin/flights/status/Scheduled');
        const container = document.getElementById('upcomingFlightsTableContainer');
        
        if (flights && flights.length > 0) {
            let tableHtml = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>รหัสเที่ยวบิน</th>
                            <th>หมายเลขเที่ยวบิน</th>
                            <th>ต้นทาง</th>
                            <th>ปลายทาง</th>
                            <th>วันที่ออกเดินทาง</th>
                            <th>เวลาออกเดินทาง</th>
                            <th>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            flights.forEach(flight => {
                const departureDateTime = new Date(flight.DepartureTime);
                const departureDate = departureDateTime.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' });
                const departureTime = departureDateTime.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
                
                tableHtml += `
                    <tr>
                        <td>${flight.FlightID || '-'}</td>
                        <td>${flight.FlightNumber || '-'}</td>
                        <td>${flight.DepartureCity || '-'}</td>
                        <td>${flight.ArrivalCity || '-'}</td>
                        <td>${departureDate}</td>
                        <td>${departureTime}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn btn-view" title="ดูรายละเอียด" onclick="viewFlight('${flight.FlightID}')">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="action-btn btn-edit" title="แก้ไข" onclick="editFlight('${flight.FlightID}')">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="action-btn btn-delete" title="ลบ" onclick="deleteFlight('${flight.FlightID}')">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });
            
            tableHtml += `
                    </tbody>
                </table>
            `;
            
            container.innerHTML = tableHtml;
        } else {
            container.innerHTML = `
                <div class="no-data-message">
                    <i class="fas fa-plane-departure"></i>
                    <h3>ไม่พบข้อมูลเที่ยวบินที่กำลังจะมาถึง</h3>
                    <p>ยังไม่มีเที่ยวบินที่กำลังจะมาถึงในระบบ</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading upcoming flights:', error);
        document.getElementById('upcomingFlightsTableContainer').innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle"></i>
                <span>เกิดข้อผิดพลาดในการโหลดข้อมูลเที่ยวบินที่กำลังจะมาถึง: ${error.message}</span>
            </div>
        `;
    }
}

function openFlightModal(mode, flightData = null) {
    document.getElementById('flightModalTitle').textContent = mode === 'add' ? 'เพิ่มเที่ยวบินใหม่' : 'แก้ไขข้อมูลเที่ยวบิน';
    document.getElementById('flightForm').reset();
    
    if (mode === 'edit' && flightData) {
        document.getElementById('hiddenFlightId').value = flightData.flightId;
        document.getElementById('selectFlightId').value = flightData.flightId;
        document.getElementById('flightNumber').value = flightData.FlightNumber || '';
        document.getElementById('departureCity').value = flightData.DepartureCity || '';
        document.getElementById('arrivalCity').value = flightData.ArrivalCity || '';
        
        // แปลง ISO string เป็นรูปแบบที่ input datetime-local ต้องการ
        if (flightData.DepartureTime) {
            const departureTime = new Date(flightData.DepartureTime);
            document.getElementById('departureTime').value = formatDateForInput(departureTime);
        }
        
        if (flightData.ArrivalTime) {
            const arrivalTime = new Date(flightData.ArrivalTime);
            document.getElementById('arrivalTime').value = formatDateForInput(arrivalTime);
        }
        
        document.getElementById('aircraft').value = flightData.Aircraft || '';
        document.getElementById('flightStatus').value = flightData.FlightStatus || 'Scheduled';
    } else {
        document.getElementById('flightId').value = '';
        
        // ตั้งค่าเริ่มต้นสำหรับการสร้างเที่ยวบินใหม่
        const now = new Date();
        const later = new Date(now.getTime() + (2 * 60 * 60 * 1000)); // +2 ชั่วโมง
        document.getElementById('departureTime').value = formatDateForInput(now);
        document.getElementById('arrivalTime').value = formatDateForInput(later);
        document.getElementById('flightStatus').value = 'Scheduled';
    }
    
    document.getElementById('flightModal').classList.add('active');
}

function closeFlightModal() {
    document.getElementById('flightModal').classList.remove('active');
}

async function saveFlight() {
    try {
        if (!validateFlightForm()) {
            return;
        }
        
        const flightId = document.getElementById('flightId').value;
        const flightData = {
            flightNumber: document.getElementById('flightNumber').value,
            departureCity: document.getElementById('departureCity').value,
            arrivalCity: document.getElementById('arrivalCity').value,
            departureTime: new Date(document.getElementById('departureTime').value).toISOString(),
            arrivalTime: new Date(document.getElementById('arrivalTime').value).toISOString(),
            aircraft: document.getElementById('aircraft').value,
            flightStatus: document.getElementById('flightStatus').value
        };
        
        if (flightId) {
            // UPDATE
            await apiService.request(`/admin/flights/${flightId}`, 'PUT', flightData);
            showNotification('แก้ไขข้อมูลเที่ยวบินสำเร็จ', 'success');
        } else {
            // CREATE
            await apiService.request('/admin/flights', 'POST', flightData);
            showNotification('เพิ่มเที่ยวบินใหม่สำเร็จ', 'success');
        }
        
        closeFlightModal();
        await loadFlightsData();
    } catch (error) {
        console.error('Error saving flight:', error);
        showNotification(`ไม่สามารถบันทึกข้อมูลเที่ยวบินได้: ${error.message}`, 'error');
    }
}

// ============ BOOKING FUNCTIONS ============



// ===== BOOKINGS =====
async function loadBookingsData() {
    try {
        const bookings = await apiService.request('/admin/bookings');
        const container = document.getElementById('bookingsTableContainer');
        
        if (bookings && bookings.length > 0) {
            let tableHtml = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>รหัสการจอง</th>
                            <th>ชื่อผู้โดยสาร</th>
                            <th>เที่ยวบิน</th>
                            <th>วันที่จอง</th>
                            <th>ราคารวม</th>
                            <th>สถานะ</th>
                            <th>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            bookings.forEach(booking => {
                const bookingDate = new Date(booking.BookingDate);
                const formattedDate = bookingDate.toLocaleDateString('th-TH');
                
                tableHtml += `
                    <tr>
                        <td>${booking.BookingID || '-'}</td>
                        <td>${booking.PassengerName || '-'}</td>
                        <td>${booking.FlightNumber || '-'} ${booking.DepartureCity || '-'}-${booking.ArrivalCity || '-'}</td>
                        <td>${formattedDate}</td>
                        <td>฿${formatNumber(booking.TotalPrice || 0)}</td>
                        <td>
                            <span class="status-badge status-${getStatusClass(booking.BookingStatus)}">${getStatusLabel(booking.BookingStatus)}</span>
                        </td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn btn-view" title="ดูรายละเอียด" onclick="viewBooking('${booking.BookingID}')">
                                    <i class="fas fa-eye"></i>
                                </button>
                                ${booking.BookingStatus !== 'Cancelled' ? `
                                    <button class="action-btn btn-edit" title="แก้ไข" onclick="editBooking('${booking.BookingID}')">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="action-btn btn-delete" title="ลบ" onclick="deleteBooking('${booking.BookingID}')">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                ` : ''}
                            </div>
                        </td>
                    </tr>
                `;
            });
            
            tableHtml += `
                    </tbody>
                </table>
            `;
            
            container.innerHTML = tableHtml;
            
            // Load pagination
            const totalBookings = await apiService.request('/admin/bookings/count');
            if (totalBookings && totalBookings.count) {
                renderPagination('bookingsPagination', totalBookings.count, 10, 1, loadBookingsByPage);
            }
        } else {
            container.innerHTML = `
                <div class="no-data-message">
                    <i class="fas fa-ticket-alt"></i>
                    <h3>ไม่พบข้อมูลการจอง</h3>
                    <p>ยังไม่มีการจองในระบบ</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading bookings:', error);
        document.getElementById('bookingsTableContainer').innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle"></i>
                <span>เกิดข้อผิดพลาดในการโหลดข้อมูลการจอง: ${error.message}</span>
            </div>
        `;
    }
}

async function openBookingModal(mode, bookingData = null) {
    document.getElementById('bookingModalTitle').textContent = mode === 'add' ? 'เพิ่มการจองใหม่' : 'แก้ไขข้อมูลการจอง';
    document.getElementById('bookingForm').reset();
    
    // โหลดรายชื่อผู้ใช้ทั้งหมด
    const users = await apiService.request('/admin/users');
    const userSelect = document.getElementById('userId');
    userSelect.innerHTML = '<option value="">-- เลือกผู้ใช้ --</option>';
    
    if (users && users.length > 0) {
        users.forEach(user => {
            userSelect.innerHTML += `<option value="${user.UserID}">${user.FirstName} ${user.LastName} (${user.Email})</option>`;
        });
    }
    
    // โหลดรายการเที่ยวบินทั้งหมด
    const flights = await apiService.request('/admin/flights');
    const flightSelect = document.getElementById('flightId');
    flightSelect.innerHTML = '<option value="">-- เลือกเที่ยวบิน --</option>';
    
    if (flights && flights.length > 0) {
        flights.forEach(flight => {
            const departureTime = new Date(flight.DepartureTime);
            const formattedDate = departureTime.toLocaleDateString('th-TH');
            const formattedTime = departureTime.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
            
            flightSelect.innerHTML += `<option value="${flight.FlightID}">${flight.FlightNumber} ${flight.DepartureCity}-${flight.ArrivalCity} (${formattedDate} ${formattedTime})</option>`;
        });
    }
    
    if (mode === 'edit' && bookingData) {
        document.getElementById('bookingId').value = bookingData.BookingID;
        document.getElementById('userId').value = bookingData.UserID || '';
        document.getElementById('flightId').value = bookingData.FlightID || '';
        
        if (bookingData.BookingDate) {
            const bookingDate = new Date(bookingData.BookingDate);
            document.getElementById('bookingDate').value = formatDateForInput(bookingDate).split('T')[0];
        }
        
        document.getElementById('bookingStatus').value = bookingData.BookingStatus || 'Pending';
        document.getElementById('totalPrice').value = bookingData.TotalPrice || 0;
        document.getElementById('contactEmail').value = bookingData.ContactEmail || '';
        document.getElementById('contactPhone').value = bookingData.ContactPhone || '';
    } else {
        document.getElementById('bookingId').value = '';
        
        // ตั้งค่าเริ่มต้นสำหรับการสร้างการจองใหม่
        const today = new Date();
        document.getElementById('bookingDate').value = formatDateForInput(today).split('T')[0];
        document.getElementById('bookingStatus').value = 'Pending';
    }
    
    document.getElementById('bookingModal').classList.add('active');
}

function closeBookingModal() {
    document.getElementById('bookingModal').classList.remove('active');
}

async function saveBooking() {
    try {
        if (!validateBookingForm()) {
            return;
        }
        
        const bookingId = document.getElementById('bookingId').value;
        const bookingData = {
            userId: document.getElementById('userId').value,
            flightId: document.getElementById('flightId').value,
            bookingDate: document.getElementById('bookingDate').value,
            bookingStatus: document.getElementById('bookingStatus').value,
            totalPrice: parseFloat(document.getElementById('totalPrice').value),
            contactEmail: document.getElementById('contactEmail').value,
            contactPhone: document.getElementById('contactPhone').value
        };
        
        if (bookingId) {
            // UPDATE
            await apiService.request(`/admin/bookings/${bookingId}`, 'PUT', bookingData);
            showNotification('แก้ไขข้อมูลการจองสำเร็จ', 'success');
        } else {
            // CREATE
            await apiService.request('/admin/bookings', 'POST', bookingData);
            showNotification('เพิ่มการจองใหม่สำเร็จ', 'success');
        }
        
        closeBookingModal();
        await loadBookingsData();
    } catch (error) {
        console.error('Error saving booking:', error);
        showNotification(`ไม่สามารถบันทึกข้อมูลการจองได้: ${error.message}`, 'error');
    }
}

// ============ UTILITY FUNCTIONS ============



// ===== STATUS HELPERS =====
function getStatusLabel(status) {
    switch (status) {
        case 'Pending':
            return 'รอดำเนินการ';
        case 'Confirmed':
            return 'ยืนยันแล้ว';
        case 'Cancelled':
            return 'ยกเลิก';
        case 'Completed':
            return 'เสร็จสิ้น';
        case 'Active':
            return 'ใช้งานอยู่';
        case 'Inactive':
            return 'ไม่ได้ใช้งาน';
        default:
            return status || 'ไม่ระบุ';
    }
}

function getFlightStatusLabel(status) {
    switch (status) {
        case 'Scheduled':
            return 'กำหนดการ';
        case 'OnTime':
            return 'ตรงเวลา';
        case 'Delayed':
            return 'ล่าช้า';
        case 'Cancelled':
            return 'ยกเลิก';
        case 'Completed':
            return 'เสร็จสิ้น';
        case 'InFlight':
            return 'กำลังบิน';
        default:
            return status || 'ไม่ระบุ';
    }
}

function getStatusClass(status) {
    switch (status) {
        case 'Pending':
            return 'pending';
        case 'Confirmed':
        case 'Completed':
        case 'Active':
        case 'OnTime':
        case 'Scheduled':
            return 'confirmed';
        case 'Cancelled':
        case 'Inactive':
        case 'Delayed':
            return 'cancelled';
        default:
            return 'pending';
    }
}

// ============ VALIDATION FUNCTIONS ============


// ===== VALIDATION =====
function validateUserForm() {
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    
    if (!username) {
        showNotification('กรุณากรอกชื่อผู้ใช้', 'error');
        return false;
    }
    
    if (!email) {
        showNotification('กรุณากรอกอีเมล', 'error');
       return false;
   }
   
   if (!isValidEmail(email)) {
       showNotification('กรุณากรอกอีเมลให้ถูกต้อง', 'error');
       return false;
   }
   
   if (!firstName) {
       showNotification('กรุณากรอกชื่อจริง', 'error');
       return false;
   }
   
   if (!lastName) {
       showNotification('กรุณากรอกนามสกุล', 'error');
       return false;
   }
   
   return true;
}

function validateFlightForm() {
   const flightNumber = document.getElementById('flightNumber').value.trim();
   const departureCity = document.getElementById('departureCity').value.trim();
   const arrivalCity = document.getElementById('arrivalCity').value.trim();
   const departureTime = document.getElementById('departureTime').value;
   const arrivalTime = document.getElementById('arrivalTime').value;
   const aircraft = document.getElementById('aircraft').value.trim();
   
   if (!flightNumber) {
       showNotification('กรุณากรอกหมายเลขเที่ยวบิน', 'error');
       return false;
   }
   
   if (!departureCity) {
       showNotification('กรุณากรอกเมืองต้นทาง', 'error');
       return false;
   }
   
   if (!arrivalCity) {
       showNotification('กรุณากรอกเมืองปลายทาง', 'error');
       return false;
   }
   
   if (!departureTime) {
       showNotification('กรุณากรอกวันและเวลาออกเดินทาง', 'error');
       return false;
   }
   
   if (!arrivalTime) {
       showNotification('กรุณากรอกวันและเวลาถึงปลายทาง', 'error');
       return false;
   }
   
   const departureDate = new Date(departureTime);
   const arrivalDate = new Date(arrivalTime);
   
   if (arrivalDate <= departureDate) {
       showNotification('เวลาถึงปลายทางต้องมากกว่าเวลาออกเดินทาง', 'error');
       return false;
   }
   
   if (!aircraft) {
       showNotification('กรุณากรอกข้อมูลเครื่องบิน', 'error');
       return false;
   }
   
   return true;
}

function validateBookingForm() {
   const userId = document.getElementById('userId').value;
   const flightId = document.getElementById('flightId').value;
   const bookingDate = document.getElementById('bookingDate').value;
   const totalPrice = document.getElementById('totalPrice').value;
   const contactEmail = document.getElementById('contactEmail').value.trim();
   const contactPhone = document.getElementById('contactPhone').value.trim();
   
   if (!userId) {
       showNotification('กรุณาเลือกผู้ใช้', 'error');
       return false;
   }
   
   if (!flightId) {
       showNotification('กรุณาเลือกเที่ยวบิน', 'error');
       return false;
   }
   
   if (!bookingDate) {
       showNotification('กรุณากรอกวันที่จอง', 'error');
       return false;
   }
   
   if (!totalPrice || isNaN(totalPrice) || parseFloat(totalPrice) < 0) {
       showNotification('กรุณากรอกราคารวมที่ถูกต้อง', 'error');
       return false;
   }
   
   if (!contactEmail) {
       showNotification('กรุณากรอกอีเมลติดต่อ', 'error');
       return false;
   }
   
   if (!isValidEmail(contactEmail)) {
       showNotification('กรุณากรอกอีเมลติดต่อให้ถูกต้อง', 'error');
       return false;
   }
   
   if (!contactPhone) {
       showNotification('กรุณากรอกเบอร์โทรติดต่อ', 'error');
       return false;
   }
   
   return true;
}

function isValidEmail(email) {
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   return emailRegex.test(email);
}

// Add these functions to your admin.js file

// Seat Modal function


// ===== MODALS =====
function openSeatModal(seatId = null) {
    const modal = document.getElementById('seatModal');
    const form = document.getElementById('seatForm');
    
    if (modal === null) {
        console.error('Seat modal element not found');
        return;
    }
    
    // Reset form
    form.reset();
    
    if (seatId) {
        // Editing existing seat
        document.getElementById('seatModalTitle').textContent = 'Edit Seat';
        
        // Fetch seat details and populate form
        fetchSeatDetails(seatId).then(seat => {
            document.getElementById('seatId').value = seat.seatId;
            document.getElementById('seatNumber').value = seat.seatNumber;
            document.getElementById('seatClass').value = seat.seatClass;
            // Set other fields as needed
        });
    } else {
        // Adding new seat
        document.getElementById('seatModalTitle').textContent = 'Add New Seat';
        document.getElementById('seatId').value = '';
    }
    
    // Show the modal
    $(modal).modal('show');
}

// Promotion Modal function
function openPromotionModal(promotionId = null) {
    const modal = document.getElementById('promotionModal');
    const form = document.getElementById('promotionForm');
    
    if (modal === null) {
        console.error('Promotion modal element not found');
        return;
    }
    
    // Reset form
    form.reset();
    
    if (promotionId) {
        // Editing existing promotion
        document.getElementById('promotionModalTitle').textContent = 'Edit Promotion';
        
        // Fetch promotion details and populate form
        fetchPromotionDetails(promotionId).then(promotion => {
            document.getElementById('promotionId').value = promotion.promotionId;
            document.getElementById('promotionCode').value = promotion.promotionCode;
            document.getElementById('discountAmount').value = promotion.discountAmount;
            // Set other fields as needed
        });
    } else {
        // Adding new promotion
        document.getElementById('promotionModalTitle').textContent = 'Add New Promotion';
        document.getElementById('promotionId').value = '';
    }
    
    // Show the modal
    $(modal).modal('show');
}

// Discount Modal function
function openDiscountModal(discountId = null) {
    const modal = document.getElementById('discountModal');
    const form = document.getElementById('discountForm');
    
    if (modal === null) {
        console.error('Discount modal element not found');
        return;
    }
    
    // Reset form
    form.reset();
    
    if (discountId) {
        // Editing existing discount
        document.getElementById('discountModalTitle').textContent = 'Edit Discount';
        
        // Fetch discount details and populate form
        fetchDiscountDetails(discountId).then(discount => {
            document.getElementById('discountId').value = discount.discountId;
            document.getElementById('discountValue').value = discount.discountValue;
            document.getElementById('pointRequired').value = discount.pointRequired;
            document.getElementById('expiryDate').value = discount.expiryDate;
            // Set other fields as needed
        });
    } else {
        // Adding new discount
        document.getElementById('discountModalTitle').textContent = 'Add New Discount';
        document.getElementById('discountId').value = '';
    }
    
    // Show the modal
    $(modal).modal('show');
}

// Loyalty Modal function
function openLoyaltyModal(userId = null) {
    const modal = document.getElementById('loyaltyModal');
    const detailsContainer = document.getElementById('loyaltyDetails');
    
    if (modal === null) {
        console.error('Loyalty modal element not found');
        return;
    }
    
    if (detailsContainer === null) {
        console.error('Loyalty details container not found');
        return;
    }
    
    if (userId) {
        // View loyalty points details
        document.getElementById('loyaltyModalTitle').textContent = 'Loyalty Points Details';
        
        // Fetch loyalty points details
        fetchUserLoyaltyPoints(userId).then(points => {
            // Create HTML to display loyalty points details
            let html = `
                <div class="card mb-3">
                    <div class="card-header">
                        <h5 class="card-title">Loyalty Points for User #${userId}</h5>
                    </div>
                    <div class="card-body">
                        <p><strong>Total Points:</strong> ${points.total || 0}</p>
                    </div>
                </div>
            `;
            
            // Add points history if available
            if (points.history && points.history.length > 0) {
                html += `<h5>Points History</h5><div class="table-responsive"><table class="table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Points</th>
                            <th>Description</th>
                            <th>Expiry</th>
                        </tr>
                    </thead>
                    <tbody>`;
                
                points.history.forEach(entry => {
                    html += `<tr>
                        <td>${entry.date}</td>
                        <td>${entry.points}</td>
                        <td>${entry.description}</td>
                        <td>${entry.expiryDate || 'N/A'}</td>
                    </tr>`;
                });
                
                html += `</tbody></table></div>`;
            } else {
                html += '<p>No points history available</p>';
            }
            
            detailsContainer.innerHTML = html;
        });
    } else {
        detailsContainer.innerHTML = '<p>No user selected</p>';
    }
    
    // Show the modal
    $(modal).modal('show');
}

// Helper functions to fetch details from API


// ===== API FETCH HELPERS =====
async function fetchFlightDetails(flightId) {
    const response = await fetch(`/api/admin/flights/${flightId}`);
    if (!response.ok) throw new Error('Failed to fetch flight details');
    return await response.json();
}

async function fetchSeatDetails(seatId) {
    const response = await fetch(`/api/admin/seats/${seatId}`);
    if (!response.ok) throw new Error('Failed to fetch seat details');
    return await response.json();
}

async function fetchBookingDetails(bookingId) {
    const response = await fetch(`/api/admin/bookings/${bookingId}`);
    if (!response.ok) throw new Error('Failed to fetch booking details');
    return await response.json();
}

async function fetchPromotionDetails(promotionId) {
    const response = await fetch(`/api/admin/promotions/${promotionId}`);
    if (!response.ok) throw new Error('Failed to fetch promotion details');
    return await response.json();
}

async function fetchDiscountDetails(discountId) {
    const response = await fetch(`/api/admin/discounts/${discountId}`);
    if (!response.ok) throw new Error('Failed to fetch discount details');
    return await response.json();
}

async function fetchUserLoyaltyPoints(userId) {
    const response = await fetch(`/api/admin/users/${userId}/loyalty-points`);
    if (!response.ok) throw new Error('Failed to fetch loyalty points');
    return await response.json();
}

// ============ NOTIFICATION FUNCTION ============


// ===== NOTIFICATIONS =====
function showNotification(message, type = 'info') {
   let notificationContainer = document.getElementById('notificationContainer');
   if (!notificationContainer) {
       notificationContainer = document.createElement('div');
       notificationContainer.id = 'notificationContainer';
       notificationContainer.className = 'notification-container';
       document.body.appendChild(notificationContainer);
       
       const style = document.createElement('style');
       style.textContent = `
           .notification-container {
               position: fixed;
               top: 20px;
               right: 20px;
               z-index: 9999;
           }
           
           .notification {
               padding: 15px 20px;
               margin-bottom: 10px;
               border-radius: 4px;
               box-shadow: 0 3px 6px rgba(0,0,0,0.16);
               display: flex;
               align-items: center;
               min-width: 300px;
               max-width: 400px;
               animation: notification-in 0.3s ease-out forwards;
           }
           
           .notification i {
               margin-right: 10px;
               font-size: 1.2rem;
           }
           
           .notification-success {
               background-color: #d4edda;
               color: #155724;
               border-left: 4px solid #28a745;
           }
           
           .notification-error {
               background-color: #f8d7da;
               color: #721c24;
               border-left: 4px solid #dc3545;
           }
           
           .notification-warning {
               background-color: #fff3cd;
               color: #856404;
               border-left: 4px solid #ffc107;
           }
           
           .notification-info {
               background-color: #d1ecf1;
               color: #0c5460;
               border-left: 4px solid #17a2b8;
           }
           
           .notification-close {
               margin-left: auto;
               background: none;
               border: none;
               color: inherit;
               font-size: 1rem;
               cursor: pointer;
               opacity: 0.5;
               transition: opacity 0.3s;
           }
           
           .notification-close:hover {
               opacity: 1;
           }
           
           @keyframes notification-in {
               from {
                   transform: translateX(100%);
                   opacity: 0;
               }
               to {
                   transform: translateX(0);
                   opacity: 1;
               }
           }
           
           @keyframes notification-out {
               from {
                   transform: translateX(0);
                   opacity: 1;
               }
               to {
                   transform: translateX(100%);
                   opacity: 0;
               }
           }
       `;
       document.head.appendChild(style);
   }
   
   let icon = 'fa-info-circle';
   if (type === 'success') icon = 'fa-check-circle';
   if (type === 'error') icon = 'fa-exclamation-circle';
   if (type === 'warning') icon = 'fa-exclamation-triangle';
   
   const notification = document.createElement('div');
   notification.className = `notification notification-${type}`;
   notification.innerHTML = `
       <i class="fas ${icon}"></i>
       <span>${message}</span>
       <button class="notification-close">×</button>
   `;
   
   notificationContainer.appendChild(notification);
   
   const closeBtn = notification.querySelector('.notification-close');
   closeBtn.addEventListener('click', function() {
       notification.style.animation = 'notification-out 0.3s forwards';
       setTimeout(() => {
           notificationContainer.removeChild(notification);
       }, 300);
   });
   
   setTimeout(() => {
       if (notification.parentElement) {
           notification.style.animation = 'notification-out 0.3s forwards';
           setTimeout(() => {
               if (notification.parentElement) {
                   notificationContainer.removeChild(notification);
               }
           }, 300);
       }
   }, 5000);
}

// ============ PAGINATION FUNCTION ============


// ===== PAGINATION =====
function renderPagination(containerId, totalItems, itemsPerPage, currentPage, callback) {
   const container = document.getElementById(containerId);
   if (!container) return;
   
   const totalPages = Math.ceil(totalItems / itemsPerPage);
   
   if (totalPages <= 1) {
       container.innerHTML = '';
       return;
   }
   
   let paginationHtml = '';
   
   // Previous button
   paginationHtml += `
       <button class="pagination-btn ${currentPage === 1 ? 'disabled' : ''}" 
           ${currentPage === 1 ? 'disabled' : `onclick="${callback.name}(${currentPage - 1})"`}>
           <i class="fas fa-chevron-left"></i>
       </button>
   `;
   
   // Page buttons
   const maxButtons = 5;
   const startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
   const endPage = Math.min(totalPages, startPage + maxButtons - 1);
   
   for (let i = startPage; i <= endPage; i++) {
       paginationHtml += `
           <button class="pagination-btn ${i === currentPage ? 'active' : ''}" 
               onclick="${callback.name}(${i})">
               ${i}
           </button>
       `;
   }
   
   // Next button
   paginationHtml += `
       <button class="pagination-btn ${currentPage === totalPages ? 'disabled' : ''}" 
           ${currentPage === totalPages ? 'disabled' : `onclick="${callback.name}(${currentPage + 1})"`}>
           <i class="fas fa-chevron-right"></i>
       </button>
   `;
   
   container.innerHTML = paginationHtml;
}

// ============ LOAD BY PAGE FUNCTIONS ============


// ===== LOAD BY PAGE =====
async function loadUsersByPage(page) {
   try {
       const users = await apiService.request(`/admin/users?page=${page}&limit=10`);
       const container = document.getElementById('usersTableContainer');
       
       if (users && users.length > 0) {
           let tableHtml = `
               <table class="data-table">
                   <thead>
                       <tr>
                           <th>รหัสผู้ใช้</th>
                           <th>ชื่อผู้ใช้</th>
                           <th>ชื่อ-นามสกุล</th>
                           <th>อีเมล</th>
                           <th>เบอร์โทรศัพท์</th>
                           <th>บทบาท</th>
                           <th>สถานะ</th>
                           <th>จัดการ</th>
                       </tr>
                   </thead>
                   <tbody>
           `;
           
           users.forEach(user => {
               tableHtml += `
                   <tr>
                       <td>${user.UserID || '-'}</td>
                       <td>${user.Username || '-'}</td>
                       <td>${user.FirstName || ''} ${user.LastName || ''}</td>
                       <td>${user.Email || '-'}</td>
                       <td>${user.Phone || '-'}</td>
                       <td>${user.Role || '-'}</td>
                       <td>
                           <span class="status-badge status-${user.Status === 'Active' ? 'confirmed' : 'cancelled'}">${user.Status === 'Active' ? 'ใช้งานอยู่' : 'ไม่ได้ใช้งาน'}</span>
                       </td>
                       <td>
                           <div class="action-buttons">
                               <button class="action-btn btn-view" title="ดูรายละเอียด" onclick="viewUser('${user.UserID}')">
                                   <i class="fas fa-eye"></i>
                               </button>
                               <button class="action-btn btn-edit" title="แก้ไข" onclick="editUser('${user.UserID}')">
                                   <i class="fas fa-edit"></i>
                               </button>
                               <button class="action-btn btn-delete" title="ลบ" onclick="deleteUser('${user.UserID}')">
                                   <i class="fas fa-trash-alt"></i>
                               </button>
                           </div>
                       </td>
                   </tr>
               `;
           });
           
           tableHtml += `
                   </tbody>
               </table>
           `;
           
           container.innerHTML = tableHtml;
           const totalUsers = await apiService.request('/admin/users/count');
           if (totalUsers && totalUsers.count) {
               renderPagination('usersPagination', totalUsers.count, 10, page, loadUsersByPage);
           }
       } else {
           container.innerHTML = `
               <div class="no-data-message">
                   <i class="fas fa-users"></i>
                   <h3>ไม่พบข้อมูลผู้ใช้</h3>
                   <p>ไม่มีผู้ใช้ในหน้านี้</p>
               </div>
           `;
       }
   } catch (error) {
       console.error('Error loading users by page:', error);
       document.getElementById('usersTableContainer').innerHTML = `
           <div class="alert alert-danger">
               <i class="fas fa-exclamation-circle"></i>
               <span>เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้: ${error.message}</span>
           </div>
       `;
   }
}

async function loadFlightsByPage(page) {
   try {
       const flights = await apiService.request(`/admin/flights?page=${page}&limit=10`);
       const container = document.getElementById('flightsTableContainer');
       
       if (flights && flights.length > 0) {
           let tableHtml = `
               <table class="data-table">
                   <thead>
                       <tr>
                           <th>รหัสเที่ยวบิน</th>
                           <th>หมายเลขเที่ยวบิน</th>
                           <th>ต้นทาง</th>
                           <th>ปลายทาง</th>
                           <th>วันที่ออกเดินทาง</th>
                           <th>เวลาออกเดินทาง</th>
                           <th>สถานะ</th>
                           <th>จัดการ</th>
                       </tr>
                   </thead>
                   <tbody>
           `;
           
           flights.forEach(flight => {
               const departureDateTime = new Date(flight.DepartureTime);
               const departureDate = departureDateTime.toLocaleDateString('th-TH');
               const departureTime = departureDateTime.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
               
               tableHtml += `
                   <tr>
                       <td>${flight.FlightID || '-'}</td>
                       <td>${flight.FlightNumber || '-'}</td>
                       <td>${flight.DepartureCity || '-'}</td>
                       <td>${flight.ArrivalCity || '-'}</td>
                       <td>${departureDate}</td>
                       <td>${departureTime}</td>
                       <td>
                           <span class="status-badge status-${getStatusClass(flight.FlightStatus)}">
                               ${getFlightStatusLabel(flight.FlightStatus)}
                           </span>
                       </td>
                       <td>
                           <div class="action-buttons">
                               <button class="action-btn btn-view" title="ดูรายละเอียด" onclick="viewFlight('${flight.FlightID}')">
                                   <i class="fas fa-eye"></i>
                               </button>
                               <button class="action-btn btn-edit" title="แก้ไข" onclick="editFlight('${flight.FlightID}')">
                                   <i class="fas fa-edit"></i>
                               </button>
                               <button class="action-btn btn-delete" title="ลบ" onclick="deleteFlight('${flight.FlightID}')">
                                   <i class="fas fa-trash-alt"></i>
                               </button>
                           </div>
                       </td>
                   </tr>
               `;
           });
           
           tableHtml += `
                   </tbody>
               </table>
           `;
           
           container.innerHTML = tableHtml;
           const totalFlights = await apiService.request('/admin/flights/count');
           if (totalFlights && totalFlights.count) {
               renderPagination('flightsPagination', totalFlights.count, 10, page, loadFlightsByPage);
           }
       } else {
           container.innerHTML = `
               <div class="no-data-message">
                   <i class="fas fa-plane"></i>
                   <h3>ไม่พบข้อมูลเที่ยวบิน</h3>
                   <p>ไม่มีเที่ยวบินในหน้านี้</p>
               </div>
           `;
       }
   } catch (error) {
       console.error('Error loading flights by page:', error);
       document.getElementById('flightsTableContainer').innerHTML = `
           <div class="alert alert-danger">
               <i class="fas fa-exclamation-circle"></i>
               <span>เกิดข้อผิดพลาดในการโหลดข้อมูลเที่ยวบิน: ${error.message}</span>
           </div>
       `;
   }
}

async function loadBookingsByPage(page) {
   try {
       const bookings = await apiService.request(`/admin/bookings?page=${page}&limit=10`);
       const container = document.getElementById('bookingsTableContainer');
       
       if (bookings && bookings.length > 0) {
           let tableHtml = `
               <table class="data-table">
                   <thead>
                       <tr>
                           <th>รหัสการจอง</th>
                           <th>ชื่อผู้โดยสาร</th>
                           <th>เที่ยวบิน</th>
                           <th>สถานะ</th>
                           <th>จัดการ</th>
                       </tr>
                   </thead>
                   <tbody>
           `;
           
           bookings.forEach(booking => {
               tableHtml += `
                   <tr>
                       <td>${booking.BookingID || '-'}</td>
                       <td>${booking.PassengerName || '-'}</td>
                       <td>${booking.FlightNumber || '-'} ${booking.DepartureCity || '-'} - ${booking.ArrivalCity || '-'}</td>
                       <td>
                           <span class="status-badge status-${getStatusClass(booking.BookingStatus)}">
                               ${getStatusLabel(booking.BookingStatus)}
                           </span>
                       </td>
                       <td>
                           <div class="action-buttons">
                               <button class="action-btn btn-view" title="ดูรายละเอียด" onclick="viewBooking('${booking.BookingID}')">
                                   <i class="fas fa-eye"></i>
                               </button>
                               ${booking.BookingStatus !== 'Cancelled' ? `
                                   <button class="action-btn btn-edit" title="แก้ไข" onclick="editBooking('${booking.BookingID}')">
                                       <i class="fas fa-edit"></i>
                                   </button>
                                   <button class="action-btn btn-delete" title="ลบ" onclick="deleteBooking('${booking.BookingID}')">
                                       <i class="fas fa-trash-alt"></i>
                                   </button>
                               ` : ''}
                           </div>
                       </td>
                   </tr>
               `;
           });
           
           tableHtml += `
                   </tbody>
               </table>
           `;
           
           container.innerHTML = tableHtml;
           const totalBookings = await apiService.request('/admin/bookings/count');
           if (totalBookings && totalBookings.count) {
               renderPagination('bookingsPagination', totalBookings.count, 10, page, loadBookingsByPage);
           }
       } else {
           container.innerHTML = `
               <div class="no-data-message">
                   <i class="fas fa-ticket-alt"></i>
                   <h3>ไม่พบข้อมูลการจอง</h3>
                   <p>ไม่มีการจองในหน้านี้</p>
               </div>
           `;
       }
   } catch (error) {
       console.error('Error loading bookings by page:', error);
       document.getElementById('bookingsTableContainer').innerHTML = `
           <div class="alert alert-danger">
               <i class="fas fa-exclamation-circle"></i>
               <span>เกิดข้อผิดพลาดในการโหลดข้อมูลการจอง: ${error.message}</span>
           </div>
       `;
   }
   // เพิ่มฟังก์ชัน viewUser


// ===== VIEW/EDIT/DELETE =====
async function viewUser(userId) {
    try {
        const user = await apiService.request(`/admin/users/${userId}`);
        if (user) {
            const modalHtml = `
                <div class="modal-overlay active" id="viewUserModal">
                    <div class="modal-container">
                        <div class="modal-header">
                            <h2>รายละเอียดผู้ใช้</h2>
                            <button class="modal-close" onclick="closeViewUserModal()">×</button>
                        </div>
                        <div class="modal-body">
                            <table class="data-table">
                                <tr><td><strong>รหัสผู้ใช้:</strong></td><td>${user.userId || '-'}</td></tr>
                                <tr><td><strong>ชื่อผู้ใช้:</strong></td><td>${user.username || '-'}</td></tr>
                                <tr><td><strong>อีเมล:</strong></td><td>${user.email || '-'}</td></tr>
                                <tr><td><strong>ชื่อ-นามสกุล:</strong></td><td>${user.firstName || ''} ${user.lastName || ''}</td></tr>
                                <tr><td><strong>เบอร์โทรศัพท์:</strong></td><td>${user.phone || '-'}</td></tr>
                                <tr><td><strong>ที่อยู่:</strong></td><td>${user.address || '-'}</td></tr>
                                <tr><td><strong>บทบาท:</strong></td><td>${user.role || '-'}</td></tr>
                                <tr>
                                    <td><strong>สถานะ:</strong></td>
                                    <td><span class="status-badge status-${user.status === 'Active' ? 'confirmed' : 'cancelled'}">${user.status === 'Active' ? 'ใช้งานอยู่' : 'ไม่ได้ใช้งาน'}</span></td>
                                </tr>
                            </table>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-primary" onclick="closeViewUserModal()">ปิด</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            window.closeViewUserModal = function() {
                const modal = document.getElementById('viewUserModal');
                if (modal) modal.remove();
            };
        } else {
            showNotification('ไม่พบข้อมูลผู้ใช้', 'error');
        }
    } catch (error) {
        console.error('Error viewing user:', error);
        showNotification(`ไม่สามารถดูรายละเอียดผู้ใช้ได้: ${error.message}`, 'error');
    }
}

// เพิ่มฟังก์ชัน loadStaffUsersData
async function loadStaffUsersData() {
    try {
        const users = await apiService.request('/admin/users/role/Staff');
        const container = document.getElementById('staffUsersTableContainer');
        
        if (users && users.length > 0) {
            let tableHtml = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>รหัสผู้ใช้</th>
                            <th>ชื่อผู้ใช้</th>
                            <th>ชื่อ-นามสกุล</th>
                            <th>อีเมล</th>
                            <th>เบอร์โทรศัพท์</th>
                            <th>สถานะ</th>
                            <th>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            users.forEach(user => {
                tableHtml += `
                    <tr>
                        <td>${user.userId || '-'}</td>
                        <td>${user.username || '-'}</td>
                        <td>${user.firstName || ''} ${user.lastName || ''}</td>
                        <td>${user.email || '-'}</td>
                        <td>${user.phone || '-'}</td>
                        <td>
                            <span class="status-badge status-${user.status === 'Active' ? 'confirmed' : 'cancelled'}">${user.status === 'Active' ? 'ใช้งานอยู่' : 'ไม่ได้ใช้งาน'}</span>
                        </td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn btn-view" title="ดูรายละเอียด" onclick="viewUser('${user.userId}')">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="action-btn btn-edit" title="แก้ไข" onclick="editUser('${user.userId}')">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="action-btn btn-delete" title="ลบ" onclick="deleteUser('${user.userId}')">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });
            
            tableHtml += `
                    </tbody>
                </table>
            `;
            
            container.innerHTML = tableHtml;
        } else {
            container.innerHTML = `
                <div class="no-data-message">
                    <i class="fas fa-user-tie"></i>
                    <h3>ไม่พบข้อมูลพนักงาน</h3>
                    <p>ยังไม่มีผู้ใช้ที่เป็นพนักงานในระบบ</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading staff users:', error);
        document.getElementById('staffUsersTableContainer').innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle"></i>
                <span>เกิดข้อผิดพลาดในการโหลดข้อมูลพนักงาน: ${error.message}</span>
            </div>
        `;
    }
}
}

// ============ USER FUNCTIONS ============

async function viewUser(userId) {
    try {
        const user = await apiService.request(`/admin/users/${userId}`);
        if (user) {
            const modalHtml = `
                <div class="modal-overlay active" id="viewUserModal">
                    <div class="modal-container">
                        <div class="modal-header">
                            <h2>รายละเอียดผู้ใช้</h2>
                            <button class="modal-close" onclick="closeViewUserModal()">×</button>
                        </div>
                        <div class="modal-body">
                            <table class="data-table">
                                <tr><td><strong>รหัสผู้ใช้:</strong></td><td>${user.userId || '-'}</td></tr>
                                <tr><td><strong>ชื่อผู้ใช้:</strong></td><td>${user.username || '-'}</td></tr>
                                <tr><td><strong>อีเมล:</strong></td><td>${user.email || '-'}</td></tr>
                                <tr><td><strong>ชื่อ-นามสกุล:</strong></td><td>${user.firstName || ''} ${user.lastName || ''}</td></tr>
                                <tr><td><strong>เบอร์โทรศัพท์:</strong></td><td>${user.phone || '-'}</td></tr>
                                <tr><td><strong>ที่อยู่:</strong></td><td>${user.address || '-'}</td></tr>
                                <tr><td><strong>บทบาท:</strong></td><td>${user.role || '-'}</td></tr>
                                <tr>
                                    <td><strong>สถานะ:</strong></td>
                                    <td><span class="status-badge status-${user.status === 'Active' ? 'confirmed' : 'cancelled'}">${user.status === 'Active' ? 'ใช้งานอยู่' : 'ไม่ได้ใช้งาน'}</span></td>
                                </tr>
                                <tr><td><strong>วันที่สร้าง:</strong></td><td>${user.createdAt ? new Date(user.createdAt).toLocaleString('th-TH') : '-'}</td></tr>
                                <tr><td><strong>อัปเดตล่าสุด:</strong></td><td>${user.updatedAt ? new Date(user.updatedAt).toLocaleString('th-TH') : '-'}</td></tr>
                            </table>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-primary" onclick="closeViewUserModal()">ปิด</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            window.closeViewUserModal = function() {
                const modal = document.getElementById('viewUserModal');
                if (modal) modal.remove();
            };
        } else {
            showNotification('ไม่พบข้อมูลผู้ใช้', 'error');
        }
    } catch (error) {
        console.error('Error viewing user:', error);
        showNotification(`ไม่สามารถโหลดข้อมูลผู้ใช้ได้: ${error.message}`, 'error');
    }
}

async function editUser(userId) {
    try {
        const user = await apiService.request(`/admin/users/${userId}`);
        if (user) {
            openUserModal('edit', user);
        } else {
            showNotification('ไม่พบข้อมูลผู้ใช้', 'error');
        }
    } catch (error) {
        console.error('Error editing user:', error);
        showNotification(`ไม่สามารถแก้ไขข้อมูลผู้ใช้ได้: ${error.message}`, 'error');
    }
}

async function deleteUser(userId) {
    try {
        if (confirm('คุณต้องการลบผู้ใช้นี้หรือไม่?')) {
            await apiService.request(`/admin/users/${userId}`, 'DELETE');
            showNotification('ลบผู้ใช้สำเร็จ', 'success');
            await loadUsersData();
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        showNotification(`ไม่สามารถลบผู้ใช้ได้: ${error.message}`, 'error');
    }
}

// ============ FLIGHT FUNCTIONS ============

async function viewFlight(flightId) {
    try {
        const flight = await apiService.request(`/admin/flights/${flightId}`);
        if (flight) {
            const departureDateTime = new Date(flight.departureTime);
            const arrivalDateTime = new Date(flight.arrivalTime);
            
            const departureDateFormatted = departureDateTime.toLocaleDateString('th-TH', { 
                day: '2-digit', month: '2-digit', year: 'numeric' 
            });
            const departureTimeFormatted = departureDateTime.toLocaleTimeString('th-TH', { 
                hour: '2-digit', minute: '2-digit' 
            });
            
            const arrivalDateFormatted = arrivalDateTime.toLocaleDateString('th-TH', { 
                day: '2-digit', month: '2-digit', year: 'numeric' 
            });
            const arrivalTimeFormatted = arrivalDateTime.toLocaleTimeString('th-TH', { 
                hour: '2-digit', minute: '2-digit' 
            });
            
            const modalHtml = `
                <div class="modal-overlay active" id="viewFlightModal">
                    <div class="modal-container">
                        <div class="modal-header">
                            <h2>รายละเอียดเที่ยวบิน</h2>
                            <button class="modal-close" onclick="closeViewFlightModal()">×</button>
                        </div>
                        <div class="modal-body">
                            <table class="data-table">
                                <tr><td><strong>รหัสเที่ยวบิน:</strong></td><td>${flight.flightId || '-'}</td></tr>
                                <tr><td><strong>หมายเลขเที่ยวบิน:</strong></td><td>${flight.flightNumber || '-'}</td></tr>
                                <tr><td><strong>ต้นทาง:</strong></td><td>${flight.departureCity || '-'}</td></tr>
                                <tr><td><strong>ปลายทาง:</strong></td><td>${flight.arrivalCity || '-'}</td></tr>
                                <tr><td><strong>วันเวลาออกเดินทาง:</strong></td><td>${departureDateFormatted} ${departureTimeFormatted}</td></tr>
                                <tr><td><strong>วันเวลาถึงปลายทาง:</strong></td><td>${arrivalDateFormatted} ${arrivalTimeFormatted}</td></tr>
                                <tr><td><strong>เครื่องบิน:</strong></td><td>${flight.aircraft || '-'}</td></tr>
                                <tr><td><strong>สถานะ:</strong></td><td>
                                    <span class="status-badge status-${getStatusClass(flight.flightStatus)}">
                                        ${getFlightStatusLabel(flight.flightStatus)}
                                    </span>
                                </td></tr>
                                <tr><td><strong>จำนวนที่นั่งทั้งหมด:</strong></td><td>${flight.seats ? flight.seats.length : 0} ที่นั่ง</td></tr>
                                <tr><td><strong>ที่นั่งว่าง:</strong></td><td>${flight.availableSeats || '-'} ที่นั่ง</td></tr>
                            </table>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-primary" onclick="closeViewFlightModal()">ปิด</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            window.closeViewFlightModal = function() {
                const modal = document.getElementById('viewFlightModal');
                if (modal) modal.remove();
            };
        } else {
            showNotification('ไม่พบข้อมูลเที่ยวบิน', 'error');
        }
    } catch (error) {
        console.error('Error viewing flight:', error);
        showNotification(`ไม่สามารถโหลดข้อมูลเที่ยวบินได้: ${error.message}`, 'error');
    }
}

async function editFlight(flightId) {
    try {
        const flight = await apiService.request(`/admin/flights/${flightId}`);
        if (flight) {
            openFlightModal('edit', flight);
        } else {
            showNotification('ไม่พบข้อมูลเที่ยวบิน', 'error');
        }
    } catch (error) {
        console.error('Error editing flight:', error);
        showNotification(`ไม่สามารถแก้ไขข้อมูลเที่ยวบินได้: ${error.message}`, 'error');
    }
}

async function deleteFlight(flightId) {
    try {
        if (confirm(`คุณต้องการลบเที่ยวบิน ${flightId} หรือไม่?`)) {
            await apiService.request(`/admin/flights/${flightId}`, 'DELETE');
            showNotification(`ลบเที่ยวบิน ${flightId} สำเร็จ`, 'success');
            await loadFlightsData();
        }
    } catch (error) {
        console.error('Error deleting flight:', error);
        showNotification(`ไม่สามารถลบเที่ยวบินได้: ${error.message}`, 'error');
    }
}

// ============ BOOKING FUNCTIONS ============

async function viewBooking(bookingId) {
    try {
        const booking = await apiService.request(`/admin/bookings/${bookingId}`);
        if (booking) {
            // หาข้อมูลวันที่และเวลาเดินทาง
            let departureTime;
            if (booking.flight && booking.flight.departureTime) {
                departureTime = new Date(booking.flight.departureTime);
            } else {
                departureTime = new Date(); // ใช้เวลาปัจจุบันถ้าไม่มีข้อมูล
            }
            
            const dateStr = departureTime.toLocaleDateString('th-TH', { 
                day: '2-digit', month: '2-digit', year: 'numeric' 
            });
            const timeStr = departureTime.toLocaleTimeString('th-TH', { 
                hour: '2-digit', minute: '2-digit' 
            });
            
            // ผู้โดยสาร (ถ้ามีข้อมูล)
            let passengersList = '';
            if (booking.passengers && booking.passengers.length > 0) {
                passengersList = '<tr><td><strong>รายชื่อผู้โดยสาร:</strong></td><td><ul>';
                booking.passengers.forEach(passenger => {
                    passengersList += `<li>${passenger.firstName} ${passenger.lastName}${passenger.seatNumber ? ` (ที่นั่ง: ${passenger.seatNumber})` : ''}</li>`;
                });
                passengersList += '</ul></td></tr>';
            }
            
            const modalHtml = `
                <div class="modal-overlay active" id="viewBookingModal">
                    <div class="modal-container">
                        <div class="modal-header">
                            <h2>รายละเอียดการจอง</h2>
                            <button class="modal-close" onclick="closeViewBookingModal()">×</button>
                        </div>
                        <div class="modal-body">
                            <table class="data-table">
                                <tr><td><strong>รหัสการจอง:</strong></td><td>${booking.bookingId || '-'}</td></tr>
                                <tr><td><strong>ผู้จอง:</strong></td><td>${booking.user ? (booking.user.firstName + ' ' + booking.user.lastName) : '-'}</td></tr>
                                <tr><td><strong>เที่ยวบิน:</strong></td><td>${booking.flight ? booking.flight.flightNumber : '-'} (${booking.flight ? booking.flight.departureCity : '-'} → ${booking.flight ? booking.flight.arrivalCity : '-'})</td></tr>
                                <tr><td><strong>วันเวลาเดินทาง:</strong></td><td>${dateStr} เวลา ${timeStr}</td></tr>
                                <tr><td><strong>วันที่จอง:</strong></td><td>${booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString('th-TH') : '-'}</td></tr>
                                <tr><td><strong>สถานะ:</strong></td><td>
                                    <span class="status-badge status-${getStatusClass(booking.bookingStatus)}">
                                        ${getStatusLabel(booking.bookingStatus)}
                                    </span>
                                </td></tr>
                                <tr><td><strong>จำนวนผู้โดยสาร:</strong></td><td>${booking.passengers ? booking.passengers.length : 0} คน</td></tr>
                                ${passengersList}
                                <tr><td><strong>ราคารวม:</strong></td><td>฿${formatNumber(booking.totalPrice || 0)}</td></tr>
                                <tr><td><strong>อีเมลติดต่อ:</strong></td><td>${booking.contactEmail || '-'}</td></tr>
                                <tr><td><strong>เบอร์โทรติดต่อ:</strong></td><td>${booking.contactPhone || '-'}</td></tr>
                            </table>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-primary" onclick="closeViewBookingModal()">ปิด</button>
                            ${booking.bookingStatus !== 'Cancelled' ? `
                                <button class="btn btn-danger" onclick="cancelBookingFromModal('${booking.bookingId}')">ยกเลิกการจอง</button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            
            window.closeViewBookingModal = function() {
                const modal = document.getElementById('viewBookingModal');
                if (modal) modal.remove();
            };
            
            window.cancelBookingFromModal = async function(bookingId) {
                if (confirm('คุณต้องการยกเลิกการจองนี้หรือไม่?')) {
                    try {
                        await apiService.request(`/admin/bookings/${bookingId}/status`, 'PATCH', { status: 'Cancelled' });
                        showNotification('ยกเลิกการจองเรียบร้อยแล้ว', 'success');
                        closeViewBookingModal();
                        loadBookingsData(); // โหลดข้อมูลการจองใหม่
                    } catch (error) {
                        showNotification(`ไม่สามารถยกเลิกการจองได้: ${error.message}`, 'error');
                    }
                }
            };
        } else {
            showNotification('ไม่พบข้อมูลการจอง', 'error');
        }
    } catch (error) {
        console.error('Error viewing booking:', error);
        showNotification(`ไม่สามารถโหลดข้อมูลการจองได้: ${error.message}`, 'error');
    }
}

async function editBooking(bookingId) {
    try {
        const booking = await apiService.request(`/admin/bookings/${bookingId}`);
        if (booking) {
            openBookingModal('edit', booking);
        } else {
            showNotification(`ไม่พบข้อมูลการจองรหัส ${bookingId}`, 'error');
        }
    } catch (error) {
        console.error('Error editing booking:', error);
        showNotification(`ไม่สามารถโหลดข้อมูลการจองได้: ${error.message}`, 'error');
    }
}

async function deleteBooking(bookingId) {
    try {
        if (confirm(`คุณต้องการลบการจองหมายเลข ${bookingId} หรือไม่?`)) {
            await apiService.request(`/admin/bookings/${bookingId}`, 'DELETE');
            showNotification(`ลบการจอง ${bookingId} สำเร็จ`, 'success');
            await loadBookingsData();
        }
    } catch (error) {
        console.error('Error deleting booking:', error);
        showNotification(`ไม่สามารถลบการจองได้: ${error.message}`, 'error');
    }
}

// Export the functions to window
window.viewUser = viewUser;
window.editUser = editUser;
window.deleteUser = deleteUser;
window.viewFlight = viewFlight;
window.editFlight = editFlight;
window.deleteFlight = deleteFlight;
window.viewBooking = viewBooking;
window.editBooking = editBooking;
window.deleteBooking = deleteBooking;
window.loadUsersByPage = loadUsersByPage;
window.loadFlightsByPage = loadFlightsByPage;
window.loadBookingsByPage = loadBookingsByPage;
window.changePage = changePage;