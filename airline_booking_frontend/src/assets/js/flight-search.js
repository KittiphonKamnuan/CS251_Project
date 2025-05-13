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
            
            try {
                // Prepare search parameters
                const searchParams = prepareSearchParams();
                
                // Call API to search flights
                const flights = await searchFlights(searchParams);
                
                // Display results
                displayFlightResults(flights, searchParams);
            } catch (error) {
                console.error('Error searching flights:', error);
                showSearchError('ไม่สามารถค้นหาเที่ยวบินได้ กรุณาลองใหม่อีกครั้ง');
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
        const departureDate = departureDateInput.value;
        
        const params = {
            from: departureCode,
            to: arrivalCode,
            departureFrom: departureDate,
            departureTo: departureDate,
            passengers: passengersSelect.value,
            seatClass: seatClassSelect.value
        };
        
        // Add return date if round trip
        const activeTab = document.querySelector('.tab-btn.active');
        if (activeTab && activeTab.dataset.tab === 'round-trip') {
            params.returnFrom = returnDateInput.value;
            params.returnTo = returnDateInput.value;
        }
        
        return params;
    }
    
    // Function to search flights via API
    async function searchFlights(searchParams) {
        try {
            // We're using the advanced search API endpoint
            return await apiService.searchFlights(
                searchParams.from,
                searchParams.to,
                searchParams.departureFrom,
                searchParams.departureTo
            );
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
        
        if (flights.length === 0) {
            // No flights found
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.innerHTML = `
                <i class="fas fa-search"></i>
                <h3>ไม่พบเที่ยวบิน</h3>
                <p>ไม่พบเที่ยวบินตามที่คุณค้นหา กรุณาลองค้นหาใหม่อีกครั้ง</p>
            `;
            resultsContainer.appendChild(noResults);
        } else {
            // Show filter buttons
            document.querySelector('.results-filters')?.classList.add('active');
            
            // Display flights
            flights.forEach(flight => {
                resultsContainer.appendChild(createFlightCard(flight, searchParams));
            });
        }
        
        // Show results section
        flightResults.style.display = 'block';
        
        // Scroll to results
        flightResults.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Function to create a flight card
    function createFlightCard(flight, searchParams) {
        const card = document.createElement('div');
        card.className = 'flight-card';
        card.dataset.flightId = flight.flightId;
        
        // Format times and calculate duration
        const departureTime = new Date(flight.departureTime);
        const arrivalTime = new Date(flight.arrivalTime);
        
        const formattedDepartureTime = departureTime.toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const formattedArrivalTime = arrivalTime.toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Calculate duration
        const durationMs = arrivalTime - departureTime;
        const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
        const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        const duration = `${durationHours}h ${durationMinutes}m`;
        
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
        
        // Create card HTML
        card.innerHTML = `
            <div class="airline-info">
                <img src="../assets/images/icons/airplane.svg" alt="${flight.aircraft}" class="airline-logo">
                <div>
                    <div class="airline-name">${flight.aircraft}</div>
                    <div class="flight-number">${flight.flightNumber}</div>
                </div>
            </div>
            <div class="flight-times">
                <div class="departure">
                    <div class="time">${formattedDepartureTime}</div>
                    <div class="airport">${flight.departureCity.substring(0, 3).toUpperCase()}</div>
                </div>
                <div class="flight-duration">
                    <div class="duration">${duration}</div>
                    <div class="flight-line"></div>
                </div>
                <div class="arrival">
                    <div class="time">${formattedArrivalTime}</div>
                    <div class="airport">${flight.arrivalCity.substring(0, 3).toUpperCase()}</div>
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
            resultsContainer.innerHTML = '';
            
            if (header) {
                resultsContainer.appendChild(header);
            }
            
            // Display filtered flights
            const searchParams = prepareSearchParams();
            filteredFlights.forEach(flight => {
                resultsContainer.appendChild(createFlightCard(flight, searchParams));
            });
        }
    }
    
    // Function to set up city suggestions
    function setupCitySuggestions(input) {
        if (!input) return;
        
        // List of cities to suggest
        const cities = [
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
            if (e.target !== input && e.target !== suggestionsContainer) {
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
            
            @keyframes spin {
                to { transform: rotate(360deg); }
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
            </div>
        `;
        
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