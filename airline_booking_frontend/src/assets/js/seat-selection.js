import { apiService } from './api-service.js';

document.addEventListener('DOMContentLoaded', async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const flightId = urlParams.get('flightId');
    const passengersCount = parseInt(urlParams.get('passengers') || '1');
    const seatClass = urlParams.get('class') || 'economy';

    const selectedFlightData = sessionStorage.getItem('selectedFlight') ? 
        JSON.parse(sessionStorage.getItem('selectedFlight')) : null;

    const passengerInfo = sessionStorage.getItem('passengerInfo') ? 
        JSON.parse(sessionStorage.getItem('passengerInfo')) : null;

    if (!flightId && !selectedFlightData) {
        alert('ไม่พบข้อมูลเที่ยวบิน กรุณาเลือกเที่ยวบินก่อน');
        window.location.href = 'index.html';
        return;
    }

    const effectiveFlightId = flightId || selectedFlightData.flightId;

    updateFlightSummary(selectedFlightData);
    updatePassengerInfo(passengerInfo);

    const seatContainer = document.querySelector('.airplane-body');
    const selectedSeatDisplay = document.getElementById('selected-seat-display');
    const seatPriceDisplay = document.getElementById('seat-price-display');
    const continueBtn = document.getElementById('continue-btn');
    const backButton = document.getElementById('backButton');

    const selectedSeats = [];
    let totalSeatPrice = 0;
    let allSeats = [];
    let seatMap = {}; // ✅ เพิ่ม seatMap ที่ global scope

    try {
        await loadSeatData(effectiveFlightId);
    } catch (error) {
        console.error('Error loading seat data:', error);
        alert('ไม่สามารถโหลดข้อมูลที่นั่งได้ กรุณาลองใหม่อีกครั้ง');
        if (seatContainer) {
            seatContainer.innerHTML = '<div class="error-message">ไม่สามารถโหลดข้อมูลที่นั่งได้</div>';
        }
    }

    if (continueBtn) {
        continueBtn.addEventListener('click', function(e) {
            if (selectedSeats.length < passengersCount) {
                e.preventDefault();
                alert(`กรุณาเลือกที่นั่งให้ครบสำหรับผู้โดยสารทั้ง ${passengersCount} คน`);
                return;
            }

            sessionStorage.setItem('selectedSeats', JSON.stringify(selectedSeats));
            sessionStorage.setItem('additionalSeatPrice', totalSeatPrice.toString());
            window.location.href = 'payment.html';
        });
    }

    if (backButton) {
        backButton.addEventListener('click', function() {
            window.location.href = 'flight-details.html';
        });
    }

    function updateFlightSummary(flightData) {
        if (!flightData) return;
        const routeTitle = document.getElementById('routeTitle');
        const routeInfo = document.getElementById('routeInfo');

        if (routeTitle && routeInfo) {
            routeTitle.textContent = `${flightData.departureCity} (${flightData.departureCity.substring(0, 3).toUpperCase()}) → ${flightData.arrivalCity} (${flightData.arrivalCity.substring(0, 3).toUpperCase()})`;
            const departureDate = new Date(flightData.departureTime);
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const formattedDate = departureDate.toLocaleDateString('th-TH', options);

            let seatClassText = 'ชั้นประหยัด';
            if (flightData.seatClass === 'premium-economy') seatClassText = 'ชั้นประหยัดพิเศษ';
            else if (flightData.seatClass === 'business') seatClassText = 'ชั้นธุรกิจ';
            else if (flightData.seatClass === 'first') seatClassText = 'ชั้นหนึ่ง';

            routeInfo.textContent = `${formattedDate} | ผู้โดยสาร ${flightData.passengers} คน | ${seatClassText} | ${flightData.flightNumber}`;
        }
    }

    function updatePassengerInfo(passengerData) {
        if (!passengerData) return;
        const passengerInfoElement = document.getElementById('passengerInfo');
        if (passengerInfoElement) {
            if (passengerData.passenger && passengerData.passenger.firstName && passengerData.passenger.lastName) {
                let title = '';
                if (passengerData.passenger.title === 'mr') title = 'นาย';
                else if (passengerData.passenger.title === 'mrs') title = 'นาง';
                else if (passengerData.passenger.title === 'ms') title = 'นางสาว';

                passengerInfoElement.textContent = `กรุณาเลือกที่นั่งสำหรับผู้โดยสาร: ${title} ${passengerData.passenger.firstName} ${passengerData.passenger.lastName}`;
            }
        }
    }

    async function loadSeatData(flightId) {
        if (seatContainer) {
            seatContainer.innerHTML = '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> กำลังโหลดข้อมูลที่นั่ง...</div>';
        }

        try {
            const seats = await apiService.getFlightSeats(flightId);
            allSeats = seats;
            seatMap = {};
            seats.forEach(seat => seatMap[seat.seatNumber] = seat);
            renderSeats(seats);
        } catch (error) {
            console.error('Error fetching seat data:', error);
            throw error;
        }
    }

    function renderSeats(seats) {
        if (!seatContainer) return;

        const businessSeats = seats.filter(seat => seat.seatClass.toLowerCase() === 'business');
        const economySeats = seats.filter(seat => seat.seatClass.toLowerCase() === 'economy');
        const premiumSeats = seats.filter(seat => seat.seatClass.toLowerCase().includes('premium'));
        const firstClassSeats = seats.filter(seat => seat.seatClass.toLowerCase() === 'first');

        let html = '';
        if (firstClassSeats.length > 0) {
            html += `<div class="seat-class-label">ชั้นหนึ่ง</div>${generateSeatRows(firstClassSeats, 'First')}`;
            html += `<div class="class-divider"></div>`;
        }
        if (businessSeats.length > 0) {
            html += `<div class="seat-class-label">ชั้นธุรกิจ</div>${generateSeatRows(businessSeats, 'Business')}`;
            html += `<div class="class-divider"></div>`;
        }
        if (premiumSeats.length > 0) {
            html += `<div class="seat-class-label">ชั้นประหยัดพิเศษ</div>${generateSeatRows(premiumSeats, 'Premium Economy')}`;
            html += `<div class="class-divider"></div>`;
        }
        if (economySeats.length > 0) {
            html += `<div class="seat-class-label">ชั้นประหยัด</div>${generateSeatRows(economySeats, 'Economy')}`;
        }

        seatContainer.innerHTML = html;
        addSeatClickListeners();
    }

    function generateSeatRows(seats, seatClass) {
        const rowMap = {};
        seats.forEach(seat => {
            const rowNumber = seat.seatNumber.replace(/[A-Z]/g, '');
            if (!rowMap[rowNumber]) rowMap[rowNumber] = [];
            rowMap[rowNumber].push(seat);
        });

        let html = '';
        Object.keys(rowMap).sort((a, b) => parseInt(a) - parseInt(b)).forEach(rowNumber => {
            const rowSeats = rowMap[rowNumber];
            const isExitRow = ['8', '15', '16', '30'].includes(rowNumber);

            html += `<div class="seat-row">`;
            html += `<div class="row-number">${rowNumber}</div>`;

            rowSeats.sort((a, b) => {
                const letterA = a.seatNumber.replace(/[0-9]/g, '');
                const letterB = b.seatNumber.replace(/[0-9]/g, '');
                return letterA.localeCompare(letterB);
            });

            rowSeats.forEach((seat, index) => {
                const seatLetter = seat.seatNumber.replace(/[0-9]/g, '');
                let seatClassName = 'seat';
                // แก้ไขเป็น:
                if (seat.seatStatus === 'Occupied' || seat.seatStatus === 'Booked') {
                    seatClassName += ' occupied';
                }
                else if (isExitRow) seatClassName += ' exit-row';
                else if (seat.price > 0) seatClassName += ' premium';
        
                html += `<div class="${seatClassName}" data-seat="${seat.seatNumber}" data-price="${seat.price || 0}">${seatLetter}</div>`;

                if (seatClass.toLowerCase() === 'business' && index === 1) html += `<div class="aisle"></div>`;
                else if (seatClass.toLowerCase() === 'economy' && index === 2) html += `<div class="aisle"></div>`;
            });

            html += `<div class="row-number">${rowNumber}</div>`;
            html += `</div>`;

            if (isExitRow) html += `<div class="seat-row"><div class="aisle exit-row-marker">แถวทางออกฉุกเฉิน</div></div>`;
        });

        return html;
    }

    function addSeatClickListeners() {
        const seatElements = document.querySelectorAll('.seat:not(.occupied)');

        seatElements.forEach(seatEl => {
            seatEl.addEventListener('click', function() {
                const seatNumber = this.getAttribute('data-seat');
                const seatPrice = parseInt(this.getAttribute('data-price') || '0');
                const seatData = seatMap[seatNumber];

                if (this.classList.contains('selected')) {
                    this.classList.remove('selected');
                    const index = selectedSeats.findIndex(s => s.seatNumber === seatNumber);
                    if (index !== -1) {
                        totalSeatPrice -= selectedSeats[index].price;
                        selectedSeats.splice(index, 1);
                    }
                } else if (selectedSeats.length < passengersCount) {
                    this.classList.add('selected');
                    const seatId = seatData?.seatId || null;
                    selectedSeats.push({ seatNumber, price: seatPrice, seatId });
                    totalSeatPrice += seatPrice;
                } else {
                    alert(`คุณสามารถเลือกได้เพียง ${passengersCount} ที่นั่งเท่านั้น กรุณายกเลิกที่นั่งที่เลือกไว้ก่อนหากต้องการเลือกที่นั่งอื่น`);
                }

                updateSelectedSeatsDisplay();
                if (continueBtn) {
                    continueBtn.disabled = selectedSeats.length < passengersCount;
                }
            });
        });
    }

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