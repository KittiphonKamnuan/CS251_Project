import { apiService } from './api-service.js';

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const searchForm = document.getElementById('flight-search-form');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const returnDateGroup = document.querySelector('.return-date');
    const departureInput = document.getElementById('departure');
    const arrivalInput = document.getElementById('arrival');
    const departureDateInput = document.getElementById('departure-date');
    const returnDateInput = document.getElementById('return-date');
    const passengersSelect = document.getElementById('passengers');
    const seatClassSelect = document.getElementById('seat-class');
    const flightResults = document.getElementById('flight-results');
    const resultsContainer = document.querySelector('.results-container');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    // Set min dates for departure and return date inputs
    setupDateInputs();
    
    // Tab switching
    setupTabSwitching();
    
    // Form submission
    setupSearchForm();
    
    // Popular destinations click handler
    setupDestinationCards();
    
    // Filter buttons
    setupFilterButtons();
    
    // City suggestions
    setupCitySuggestions(departureInput);
    setupCitySuggestions(arrivalInput);
    
    // Initialize page
    initializePage();
    
    // Function to set up date inputs
    function setupDateInputs() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        
        if (departureDateInput) {
            departureDateInput.min = formatDate(today);
            departureDateInput.value = formatDate(tomorrow);
        }
        
        if (returnDateInput) {
            const nextWeek = new Date(today);
            nextWeek.setDate(nextWeek.getDate() + 7);
            
            returnDateInput.min = formatDate(tomorrow);
            returnDateInput.value = formatDate(nextWeek);
        }
        
        // Departure date change handler
        if (departureDateInput && returnDateInput) {
            departureDateInput.addEventListener('change', function() {
                // Ensure return date is after departure date
                const departureDate = new Date(this.value);
                const returnDate = new Date(returnDateInput.value);
                
                if (returnDate <= departureDate) {
                    // Set return date to day after departure
                    const nextDay = new Date(departureDate);
                    nextDay.setDate(nextDay.getDate() + 1);
                    returnDateInput.value = formatDate(nextDay);
                }
                
                returnDateInput.min = formatDate(departureDate);
            });
        }
    }
    
    // Function to set up tab switching
    function setupTabSwitching() {
        if (!tabButtons || !returnDateGroup) return;
        
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all buttons
                tabButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                this.classList.add('active');
                
                // Toggle return date visibility based on selected tab
                if (this.dataset.tab === 'one-way') {
                    returnDateGroup.style.display = 'none';
                    returnDateInput.removeAttribute('required');
                } else if (this.dataset.tab === 'round-trip') {
                    returnDateGroup.style.display = 'block';
                    returnDateInput.setAttribute('required', '');
                } else if (this.dataset.tab === 'multi-city') {
                    // In a real app, we would show additional inputs for multi-city
                    returnDateGroup.style.display = 'none';
                    returnDateInput.removeAttribute('required');
                    alert('การค้นหาแบบหลายเมืองจะเพิ่มในอนาคต');
                }
            });
        });
    }
    
    // Function to set up search form
    function setupSearchForm() {
        if (!searchForm) return;
        
        searchForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Validate form
            if (!validateSearchForm()) {
                return;
            }
            
            // Show loading state
            const searchButton = this.querySelector('.search-btn');
            const originalButtonText = searchButton.innerHTML;
            searchButton.innerHTML = '<span class="loading-spinner"></span> กำลังค้นหา...';
            searchButton.disabled = true;
            
            // แสดงส่วนผลลัพธ์และเพิ่ม loading spinner
            if (flightResults && resultsContainer) {
                flightResults.style.display = 'block';
                resultsContainer.innerHTML = `
                    <div class="loading-results">
                        <div class="loading-spinner-large"></div>
                        <p>กำลังค้นหาเที่ยวบินที่ดีที่สุดสำหรับคุณ...</p>
                    </div>
                `;
                
                // เลื่อนไปที่ส่วนผลลัพธ์
                flightResults.scrollIntoView({ behavior: 'smooth' });
            }
            
            try {
                // Prepare search parameters
                const searchParams = prepareSearchParams();
                
                // Call API to search flights
                const flights = await searchFlights(searchParams);
                
                // Display results
                displayFlightResults(flights, searchParams);
            } catch (error) {
                console.error('Error searching flights:', error);
                showSearchError(error.message || 'ไม่สามารถค้นหาเที่ยวบินได้ กรุณาลองใหม่อีกครั้ง');
            } finally {
                // Reset button state
                searchButton.innerHTML = originalButtonText;
                searchButton.disabled = false;
            }
        });
    }
    
    // Function to validate search form
    function validateSearchForm() {
        // Check if departure and arrival are filled
        if (!departureInput.value || !arrivalInput.value) {
            alert('กรุณาระบุต้นทางและปลายทาง');
            return false;
        }
        
        // Check if departure date is filled
        if (!departureDateInput.value) {
            alert('กรุณาระบุวันที่เดินทาง');
            return false;
        }
        
        // Check if return date is filled (for round trip)
        const activeTab = document.querySelector('.tab-btn.active');
        if (activeTab && activeTab.dataset.tab === 'round-trip' && !returnDateInput.value) {
            alert('กรุณาระบุวันที่กลับ');
            return false;
        }
        
        // Check if departure and arrival are different
        const departureCode = extractAirportCode(departureInput.value);
        const arrivalCode = extractAirportCode(arrivalInput.value);
        
        if (departureCode === arrivalCode) {
            alert('ต้นทางและปลายทางต้องไม่เป็นสนามบินเดียวกัน');
            return false;
        }
        
        return true;
    }
    
    // Function to prepare search parameters
    function prepareSearchParams() {
        const departureCode = extractAirportCode(departureInput.value);
        const arrivalCode = extractAirportCode(arrivalInput.value);
        
        // แปลงวันที่เป็น LocalDateTime ตามรูปแบบที่ API ต้องการ (ISO-8601)
        const departureDateValue = departureDateInput.value;
        const departureDateTime = `${departureDateValue}T00:00:00`;
        const departureDateTimeTo = `${departureDateValue}T23:59:59`;
        
        const params = {
            from: departureCode,
            to: arrivalCode,
            departureFrom: departureDateTime,
            departureTo: departureDateTimeTo,
            passengers: passengersSelect.value,
            seatClass: seatClassSelect.value
        };
        
        // Add return date if round trip
        const activeTab = document.querySelector('.tab-btn.active');
        if (activeTab && activeTab.dataset.tab === 'round-trip') {
            const returnDateValue = returnDateInput.value;
            params.returnFrom = `${returnDateValue}T00:00:00`;
            params.returnTo = `${returnDateValue}T23:59:59`;
        }
        
        return params;
    }
    
    // Function to search flights via API - updated with better error handling
    async function searchFlights(searchParams) {
        try {
            console.log('Searching flights with params:', searchParams);
            
            // ใช้ API Service เพื่อค้นหาเที่ยวบิน
            const flights = await apiService.searchFlights(
                searchParams.from,
                searchParams.to,
                searchParams.departureFrom,
                searchParams.departureTo
            );
            
            console.log('Flights data received:', flights);
            
            // ตรวจสอบรูปแบบของข้อมูลที่ได้
            if (!flights) {
                return [];
            }
            
            if (Array.isArray(flights)) {
                return flights;
            } else {
                console.error('Invalid flight data format:', flights);
                throw new Error('ข้อมูลเที่ยวบินไม่อยู่ในรูปแบบที่ถูกต้อง');
            }
        } catch (error) {
            console.error('API search error:', error);
            throw error;
        }
    }
    
    // Function to display flight results
    function displayFlightResults(flights, searchParams) {
        if (!flightResults || !resultsContainer) return;
        
        // Format date for display
        const departureDate = new Date(searchParams.departureFrom);
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        const formattedDate = departureDate.toLocaleDateString('th-TH', options);
        
        // Create results header
        const resultsHeader = document.createElement('div');
        resultsHeader.className = 'results-header';
        resultsHeader.innerHTML = `
            <h2>เที่ยวบินจาก ${departureInput.value} ไป ${arrivalInput.value}</h2>
            <p>วันที่ ${formattedDate} | ผู้โดยสาร ${searchParams.passengers} คน | ${seatClassSelect.options[seatClassSelect.selectedIndex].text}</p>
        `;
        
        // Clear previous results
        resultsContainer.innerHTML = '';
        resultsContainer.appendChild(resultsHeader);
        
        // Save flights in a global variable for filtering
        window.currentFlights = flights;
        
        if (!flights || flights.length === 0) {
            // No flights found
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.innerHTML = `
                <i class="fas fa-search"></i>
                <h3>ไม่พบเที่ยวบิน</h3>
                <p>ไม่พบเที่ยวบินตามที่คุณค้นหา กรุณาลองค้นหาใหม่อีกครั้ง</p>
                <button class="btn btn-primary retry-search-btn">ค้นหาใหม่</button>
            `;
            resultsContainer.appendChild(noResults);
            
            // เพิ่ม event listener สำหรับปุ่มค้นหาใหม่
            const retryBtn = noResults.querySelector('.retry-search-btn');
            if (retryBtn) {
                retryBtn.addEventListener('click', function() {
                    // เลื่อนไปที่ฟอร์มค้นหา
                    searchForm.scrollIntoView({ behavior: 'smooth' });
                });
            }
        } else {
            // Show filter buttons
            const filtersSection = document.querySelector('.results-filters');
            if (filtersSection) {
                filtersSection.classList.add('active');
            }
            
            // Display flights
            flights.forEach(flight => {
                resultsContainer.appendChild(createFlightCard(flight, searchParams));
            });
            
            // แสดงจำนวนเที่ยวบินที่พบ
            const resultsCount = document.createElement('div');
            resultsCount.className = 'results-count';
            resultsCount.innerHTML = `
                <p>พบ ${flights.length} เที่ยวบิน</p>
            `;
            resultsContainer.insertBefore(resultsCount, resultsContainer.children[1]);
        }
    }
    
    // Function to create a flight card - UPDATED with fixed time handling
    function createFlightCard(flight, searchParams) {
        const card = document.createElement('div');
        card.className = 'flight-card';
        card.dataset.flightId = flight.flightId || '';
        
        // ตรวจสอบข้อมูลขาหายและตั้งค่าเริ่มต้น
        flight.departureCity = flight.departureCity || 'Unknown';
        flight.arrivalCity = flight.arrivalCity || 'Unknown';
        flight.aircraft = flight.aircraft || 'Aircraft';
        flight.flightNumber = flight.flightNumber || 'N/A';
        
        // ====== FIXED TIME HANDLING CODE ======
        // For departureTime
        let departureTimeStr;
        if (flight.departureTime) {
            // Directly extract the time portion without timezone conversion
            if (typeof flight.departureTime === 'string') {
                // Extract just the time portion (HH:MM) without creating a Date object
                if (flight.departureTime.includes(' ')) {
                    departureTimeStr = flight.departureTime.split(' ')[1].substring(0, 5);
                } else if (flight.departureTime.includes('T')) {
                    departureTimeStr = flight.departureTime.split('T')[1].substring(0, 5);
                } else {
                    departureTimeStr = flight.departureTime.substring(0, 5);
                }
            } else {
                // If it's a Date object, format it carefully
                const dt = new Date(flight.departureTime);
                // Use toTimeString() which gives the time in the local timezone
                departureTimeStr = dt.toTimeString().substring(0, 5);
            }
        } else {
            departureTimeStr = "00:00";
        }
        
        // For arrivalTime - same approach
        let arrivalTimeStr;
        if (flight.arrivalTime) {
            if (typeof flight.arrivalTime === 'string') {
                if (flight.arrivalTime.includes(' ')) {
                    arrivalTimeStr = flight.arrivalTime.split(' ')[1].substring(0, 5);
                } else if (flight.arrivalTime.includes('T')) {
                    arrivalTimeStr = flight.arrivalTime.split('T')[1].substring(0, 5);
                } else {
                    arrivalTimeStr = flight.arrivalTime.substring(0, 5);
                }
            } else {
                const at = new Date(flight.arrivalTime);
                arrivalTimeStr = at.toTimeString().substring(0, 5);
            }
        } else {
            arrivalTimeStr = "00:00";
        }
        
        // For duration calculation, use a more precise approach
        // that avoids timezone issues
        let durationHours, durationMinutes;
        
        if (typeof flight.departureTime === 'string' && typeof flight.arrivalTime === 'string') {
            // Extract hours and minutes directly from the strings
            let depHours, depMinutes, arrHours, arrMinutes;
            
            // Extract time components from departure
            if (flight.departureTime.includes(' ')) {
                const timePart = flight.departureTime.split(' ')[1];
                depHours = parseInt(timePart.split(':')[0]);
                depMinutes = parseInt(timePart.split(':')[1]);
            } else if (flight.departureTime.includes('T')) {
                const timePart = flight.departureTime.split('T')[1];
                depHours = parseInt(timePart.split(':')[0]);
                depMinutes = parseInt(timePart.split(':')[1]);
            }
            
            // Extract time components from arrival
            if (flight.arrivalTime.includes(' ')) {
                const timePart = flight.arrivalTime.split(' ')[1];
                arrHours = parseInt(timePart.split(':')[0]);
                arrMinutes = parseInt(timePart.split(':')[1]);
            } else if (flight.arrivalTime.includes('T')) {
                const timePart = flight.arrivalTime.split('T')[1];
                arrHours = parseInt(timePart.split(':')[0]);
                arrMinutes = parseInt(timePart.split(':')[1]);
            }
            
            // Calculate duration in minutes, handling day crossings
            let totalDepMinutes = depHours * 60 + depMinutes;
            let totalArrMinutes = arrHours * 60 + arrMinutes;
            
            // If arrival is earlier in the day than departure, assume next day arrival
            if (totalArrMinutes < totalDepMinutes) {
                totalArrMinutes += 24 * 60; // Add a day's worth of minutes
            }
            
            const durationTotalMinutes = totalArrMinutes - totalDepMinutes;
            durationHours = Math.floor(durationTotalMinutes / 60);
            durationMinutes = durationTotalMinutes % 60;
        } else {
            // Fallback to default duration if times aren't available
            durationHours = 1;
            durationMinutes = 15;
        }
        
        const duration = `${durationHours}h ${durationMinutes}m`;
        // ====== END OF FIXED TIME HANDLING CODE ======
        
        // แสดง debug log เพื่อตรวจสอบค่า
        console.log('Flight data:', flight);
        console.log('Original departureTime:', flight.departureTime);
        console.log('Formatted departureTime:', departureTimeStr);
        console.log('Original arrivalTime:', flight.arrivalTime);
        console.log('Formatted arrivalTime:', arrivalTimeStr);
        
        // Calculate price based on seat class and passengers
        const basePrice = flight.price || 1290;
        let adjustedPrice = basePrice;
        
        // Apply seat class multiplier
        if (searchParams.seatClass === 'premium-economy') {
            adjustedPrice *= 1.5;
        } else if (searchParams.seatClass === 'business') {
            adjustedPrice *= 2.5;
        } else if (searchParams.seatClass === 'first') {
            adjustedPrice *= 4;
        }
        
        // Round to nearest 10
        adjustedPrice = Math.round(adjustedPrice / 10) * 10;
        
        // ดึงรหัสเมือง (3 ตัว) โดยคำนึงถึงกรณีที่ข้อมูลอาจไม่ครบถ้วน
        const getDepartureCity = () => {
            // ถ้ารูปแบบเป็น "Bangkok (BKK)" ดึงเฉพาะส่วนในวงเล็บ
            if (flight.departureCity.includes('(') && flight.departureCity.includes(')')) {
                const match = flight.departureCity.match(/\(([A-Z]{3})\)/);
                if (match) return match[1];
            }
            // ถ้าเป็นรหัสเมืองอยู่แล้ว (3 ตัวอักษร)
            if (flight.departureCity.length === 3 && flight.departureCity === flight.departureCity.toUpperCase()) {
                return flight.departureCity;
            }
            // ถ้าไม่ใช่รูปแบบข้างต้น ใช้ 3 ตัวแรกแปลงเป็นตัวพิมพ์ใหญ่
            return flight.departureCity.substring(0, 3).toUpperCase();
        };
        
        const getArrivalCity = () => {
            // ถ้ารูปแบบเป็น "Chiang Mai (CNX)" ดึงเฉพาะส่วนในวงเล็บ
            if (flight.arrivalCity.includes('(') && flight.arrivalCity.includes(')')) {
                const match = flight.arrivalCity.match(/\(([A-Z]{3})\)/);
                if (match) return match[1];
            }
            // ถ้าเป็นรหัสเมืองอยู่แล้ว (3 ตัวอักษร)
            if (flight.arrivalCity.length === 3 && flight.arrivalCity === flight.arrivalCity.toUpperCase()) {
                return flight.arrivalCity;
            }
            // ถ้าไม่ใช่รูปแบบข้างต้น ใช้ 3 ตัวแรกแปลงเป็นตัวพิมพ์ใหญ่
            return flight.arrivalCity.substring(0, 3).toUpperCase();
        };
        
        // Create card HTML
        card.innerHTML = `
            <div class="airline-info">
                <img src="../assets/images/icons/airplane.png" alt="${flight.aircraft}" class="airline-logo">
                <div>
                    <div class="airline-name">${flight.aircraft}</div>
                    <div class="flight-number">${flight.flightNumber}</div>
                </div>
            </div>
            <div class="flight-times">
                <div class="departure">
                    <div class="time">${departureTimeStr}</div>
                    <div class="airport">${getDepartureCity()}</div>
                </div>
                <div class="flight-duration">
                    <div class="duration">${duration}</div>
                    <div class="flight-line"></div>
                </div>
                <div class="arrival">
                    <div class="time">${arrivalTimeStr}</div>
                    <div class="airport">${getArrivalCity()}</div>
                </div>
            </div>
            <div class="price-select">
                <div class="price">฿${adjustedPrice.toLocaleString()}</div>
                <a href="flight-details.html?flightId=${flight.flightId}&passengers=${searchParams.passengers}&class=${searchParams.seatClass}" class="btn btn-primary select-btn">เลือก</a>
            </div>
        `;
        
        // Add click handler for select button
        const selectBtn = card.querySelector('.select-btn');
        if (selectBtn) {
            selectBtn.addEventListener('click', function(e) {
                // Store selected flight in session storage
                sessionStorage.setItem('selectedFlight', JSON.stringify({
                    flightId: flight.flightId,
                    flightNumber: flight.flightNumber,
                    departureCity: flight.departureCity,
                    arrivalCity: flight.arrivalCity,
                    departureTime: flight.departureTime,
                    arrivalTime: flight.arrivalTime,
                    aircraft: flight.aircraft,
                    price: adjustedPrice,
                    passengers: searchParams.passengers,
                    seatClass: searchParams.seatClass
                }));
            });
        }
        
        return card;
    }
    
    // Function to set up destination cards
    function setupDestinationCards() {
        document.addEventListener('click', function(e) {
            // Check if clicked element is a destination card
            const card = e.target.closest('.destination-card');
            if (!card) return;
            
            const destination = card.dataset.destination;
            if (!destination) return;
            
            // Populate search form with clicked destination
            if (departureInput && arrivalInput) {
                departureInput.value = 'กรุงเทพฯ (BKK)';
                arrivalInput.value = destination;
                
                // Scroll to search form
                searchForm.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
    
    // Function to set up filter buttons
    function setupFilterButtons() {
        if (!filterButtons) return;
        
        filterButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove active class from all buttons
                filterButtons.forEach(b => b.classList.remove('active'));
                
                // Add active class to clicked button
                this.classList.add('active');
                
                // Apply filter
                applyFilter(this.textContent.trim());
            });
        });
    }
    
    // Function to apply filter
    function applyFilter(filterType) {
        // Check if we have flights to filter
        if (!window.currentFlights || window.currentFlights.length === 0) return;
        
        let filteredFlights = [...window.currentFlights];
        
        // Apply sorting based on filter type
        if (filterType === 'ราคาต่ำสุด') {
            filteredFlights.sort((a, b) => (a.price || 0) - (b.price || 0));
        } else if (filterType === 'เวลาออกเร็วสุด') {
            filteredFlights.sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));
        } else if (filterType === 'เวลาเดินทางสั้นสุด') {
            filteredFlights.sort((a, b) => {
                const durationA = new Date(a.arrivalTime) - new Date(a.departureTime);
                const durationB = new Date(b.arrivalTime) - new Date(b.departureTime);
                return durationA - durationB;
            });
        }
        
        // Re-render filtered flights
        if (resultsContainer) {
            // Keep the header
            const header = resultsContainer.querySelector('.results-header');
            const resultsCount = resultsContainer.querySelector('.results-count');
            resultsContainer.innerHTML = '';
            
            if (header) {
                resultsContainer.appendChild(header);
            }
            
            if (resultsCount) {
                resultsContainer.appendChild(resultsCount);
            }
            
            // Display filtered flights
            const searchParams = prepareSearchParams();
            filteredFlights.forEach(flight => {
                resultsContainer.appendChild(createFlightCard(flight, searchParams));
            });
        }
    }
    
    // Function to set up city suggestions
    async function setupCitySuggestions(input) {
        if (!input) return;
        
        try {
            // ดึงข้อมูลเมืองจาก API
            const cities = await fetchCities();
            
            // Create suggestions container
            let suggestionsContainer = document.createElement('div');
            suggestionsContainer.className = 'city-suggestions';
            suggestionsContainer.style.display = 'none';
            document.body.appendChild(suggestionsContainer);
            
            // Focus event
            input.addEventListener('focus', function() {
                showSuggestions(this.value);
            });
            
            // Input event
            input.addEventListener('input', function() {
                showSuggestions(this.value);
            });
            
            // Click outside
            document.addEventListener('click', function(e) {
                if (e.target !== input && e.target !== suggestionsContainer && !suggestionsContainer.contains(e.target)) {
                    suggestionsContainer.style.display = 'none';
                }
            });
            
            // Show suggestions function
            function showSuggestions(value) {
                // Position suggestions container
                const inputRect = input.getBoundingClientRect();
                suggestionsContainer.style.width = `${input.offsetWidth}px`;
                suggestionsContainer.style.left = `${inputRect.left}px`;
                suggestionsContainer.style.top = `${inputRect.bottom}px`;
                
                // Filter cities based on input value
                const filteredCities = cities.filter(city => 
                    city.toLowerCase().includes(value.toLowerCase())
                );
                
                // Populate suggestions
                suggestionsContainer.innerHTML = '';
                
                // Limit to first 10 suggestions for performance
                const limitedCities = filteredCities.slice(0, 10);
                
                limitedCities.forEach(city => {
                    const suggestion = document.createElement('div');
                    suggestion.className = 'suggestion';
                    suggestion.textContent = city;
                    
                    suggestion.addEventListener('click', function() {
                        input.value = city;
                        suggestionsContainer.style.display = 'none';
                    });
                    
                    suggestionsContainer.appendChild(suggestion);
                });
                
                // Show if there are suggestions
                if (limitedCities.length > 0) {
                    suggestionsContainer.style.display = 'block';
                } else {
                    suggestionsContainer.style.display = 'none';
                }
            }
        } catch (error) {
            console.error('Error loading cities:', error);
            setupCitySuggestionsWithFallback(input, getFallbackCities());
        }
    }
    
    // Function to fetch cities
    async function fetchCities() {
        try {
            const citiesResponse = await apiService.getCities();
            
            if (citiesResponse && Array.isArray(citiesResponse)) {
                return citiesResponse.map(city => `${city.name} (${city.code})`);
            } else {
                throw new Error('Invalid cities data format');
            }
        } catch (error) {
            console.error('Error fetching cities:', error);
            return getFallbackCities();
        }
    }
    
    // Function to get fallback cities
    function getFallbackCities() {
        return [
            'กรุงเทพฯ (BKK)',
            'เชียงใหม่ (CNX)',
            'ภูเก็ต (HKT)',
            'กระบี่ (KBV)',
            'เชียงราย (CEI)',
            'หาดใหญ่ (HDY)',
            'สุราษฎร์ธานี (URT)',
            'อุดรธานี (UTH)',
            'ขอนแก่น (KKC)',
            'อุบลราชธานี (UBP)'
        ];
    }
    
    // Function to set up city suggestions with fallback data
    function setupCitySuggestionsWithFallback(input, cities) {
        // Create suggestions container
        let suggestionsContainer = document.createElement('div');
        suggestionsContainer.className = 'city-suggestions';
        suggestionsContainer.style.display = 'none';
        document.body.appendChild(suggestionsContainer);
        
        // Focus event
        input.addEventListener('focus', function() {
            showSuggestions(this.value);
        });
        
        // Input event
        input.addEventListener('input', function() {
            showSuggestions(this.value);
        });
        
        // Click outside
        document.addEventListener('click', function(e) {
            if (e.target !== input && e.target !== suggestionsContainer && !suggestionsContainer.contains(e.target)) {
                suggestionsContainer.style.display = 'none';
            }
        });
        
        // Show suggestions function
        function showSuggestions(value) {
            // Position suggestions container
            const inputRect = input.getBoundingClientRect();
            suggestionsContainer.style.width = `${input.offsetWidth}px`;
            suggestionsContainer.style.left = `${inputRect.left}px`;
            suggestionsContainer.style.top = `${inputRect.bottom}px`;
            
            // Filter cities based on input value
            const filteredCities = cities.filter(city => 
                city.toLowerCase().includes(value.toLowerCase())
            );
            
            // Populate suggestions
            suggestionsContainer.innerHTML = '';
            
            filteredCities.forEach(city => {
                const suggestion = document.createElement('div');
                suggestion.className = 'suggestion';
                suggestion.textContent = city;
                
                suggestion.addEventListener('click', function() {
                    input.value = city;
                    suggestionsContainer.style.display = 'none';
                });
                
                suggestionsContainer.appendChild(suggestion);
            });
            
            // Show if there are suggestions
            if (filteredCities.length > 0) {
                suggestionsContainer.style.display = 'block';
            } else {
                suggestionsContainer.style.display = 'none';
            }
        }
    }
    
    // Function to initialize page
    function initializePage() {
        // Hide return date field by default (for one-way)
        if (returnDateGroup) {
            returnDateGroup.style.display = 'none';
            if (returnDateInput) {
                returnDateInput.removeAttribute('required');
            }
        }
        
        // Add styles for suggestions and loading
        const style = document.createElement('style');
        style.textContent = `
            .city-suggestions {
                position: absolute;
                background-color: white;
                border: 1px solid #ddd;
                border-top: none;
                border-radius: 0 0 4px 4px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                z-index: 1000;
                max-height: 200px;
                overflow-y: auto;
            }
            
            .suggestion {
                padding: 10px;
                cursor: pointer;
            }
            
            .suggestion:hover {
                background-color: #f5f5f5;
            }
            
            .loading-spinner {
                display: inline-block;
                width: 20px;
                height: 20px;
                border: 2px solid rgba(255,255,255,0.3);
                border-radius: 50%;
                border-top-color: white;
                animation: spin 1s linear infinite;
                margin-right: 8px;
                vertical-align: middle;
            }
            
            .loading-spinner-large {
                display: inline-block;
                width: 40px;
                height: 40px;
                border: 3px solid rgba(0,0,0,0.1);
                border-radius: 50%;
                border-top-color: var(--primary-color);
                animation: spin 1s linear infinite;
                margin-bottom: 16px;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            
            .loading-results {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 60px 0;
                text-align: center;
            }
            
            .loading-results p {
                font-size: 1.1rem;
                color: #555;
                margin-top: 10px;
            }
            
            .no-results {
                text-align: center;
                padding: 40px 20px;
                background-color: #f8f8f8;
                border-radius: 8px;
                margin: 20px 0;
            }
            
            .no-results i {
                font-size: 3rem;
                color: #ccc;
                margin-bottom: 1rem;
            }
            
            .results-filters {
                display: none;
            }
            
            .results-filters.active {
                display: flex;
            }
            
            .results-count {
                margin: 10px 0 20px;
                font-size: 0.9rem;
                color: #777;
            }
            
            .search-error {
                text-align: center;
                padding: 40px 20px;
                background-color: #fff5f5;
                border: 1px solid #ffebee;
                border-radius: 8px;
                margin: 20px 0;
                color: #d32f2f;
            }
            
            .search-error i {
                font-size: 2.5rem;
                margin-bottom: 1rem;
            }
            
            .search-error h3 {
                margin-bottom: 0.5rem;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Helper function to show search error
    function showSearchError(message) {
        if (!flightResults || !resultsContainer) return;
        
        // Show results section
        flightResults.style.display = 'block';
        
        // Create error message
        resultsContainer.innerHTML = `
            <div class="search-error">
                <i class="fas fa-exclamation-circle"></i>
                <h3>เกิดข้อผิดพลาดในการค้นหา</h3>
                <p>${message}</p>
                <button class="btn btn-primary retry-search-btn">ลองใหม่อีกครั้ง</button>
            </div>
        `;
        
        // เพิ่ม event listener สำหรับปุ่มลองใหม่
        const retryBtn = resultsContainer.querySelector('.retry-search-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', function() {
                // เลื่อนไปที่ฟอร์มค้นหา
                searchForm.scrollIntoView({ behavior: 'smooth' });
            });
        }
        
        // Scroll to results
        flightResults.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Helper function to extract airport code
    function extractAirportCode(cityString) {
        // Expecting format like "กรุงเทพฯ (BKK)"
        const matches = cityString.match(/\(([A-Z]{3})\)/);
        return matches ? matches[1] : cityString;
    }
});