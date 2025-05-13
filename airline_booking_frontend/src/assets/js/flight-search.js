/**
 * Flight Search JavaScript
 */

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
    
    // Set min dates for departure and return date inputs
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    
    departureDateInput.min = formatDate(today);
    returnDateInput.min = formatDate(tomorrow);
    
    // Set default values for date inputs
    departureDateInput.value = formatDate(tomorrow);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    returnDateInput.value = formatDate(nextWeek);
    
    // Tab switching
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
    
    // Departure date change handler
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
    
    // Form submission
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Show loading state
        const searchButton = this.querySelector('.search-btn');
        const originalButtonText = searchButton.innerHTML;
        searchButton.innerHTML = '<span class="loading-spinner"></span> กำลังค้นหา...';
        searchButton.disabled = true;
        
        // For demo purposes, simulate an API call with a delay
        setTimeout(() => {
            // Reset button state
            searchButton.innerHTML = originalButtonText;
            searchButton.disabled = false;
            
            // Show flight results
            showFlightResults();
        }, 1500);
    });
    
    // Popular destinations click handler
    document.addEventListener('click', function(e) {
        // Check if clicked element is a destination card
        if (e.target.closest('.destination-card')) {
            const card = e.target.closest('.destination-card');
            const destination = card.dataset.destination;
            
            // Populate search form with clicked destination
            if (destination) {
                departureInput.value = 'กรุงเทพฯ (BKK)';
                arrivalInput.value = destination;
                
                // Scroll to search form
                searchForm.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
    
    // Function to show flight results
    function showFlightResults() {
        // Get form values
        const departure = departureInput.value;
        const arrival = arrivalInput.value;
        const departureDate = new Date(departureDateInput.value);
        const passengers = passengersSelect.value;
        const seatClass = seatClassSelect.options[seatClassSelect.selectedIndex].text;
        
        // Format date for display
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        const formattedDate = departureDate.toLocaleDateString('th-TH', options);
        
        // Update flight results section header
        const resultsHeader = document.createElement('div');
        resultsHeader.className = 'results-header';
        resultsHeader.innerHTML = `
            <h2>เที่ยวบินจาก ${departure} ไป ${arrival}</h2>
            <p>วันที่ ${formattedDate} | ผู้โดยสาร ${passengers} คน | ${seatClass}</p>
        `;
        
        // Generate mock flight results
        const resultsContainer = document.querySelector('.results-container');
        resultsContainer.innerHTML = '';
        resultsContainer.appendChild(resultsHeader);
        
        // Generate mock flight cards
        generateMockFlights(departure, arrival, departureDate).forEach(flight => {
            resultsContainer.appendChild(createFlightCard(flight));
        });
        
        // Show results section
        flightResults.style.display = 'block';
        
        // Scroll to results
        flightResults.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Function to generate mock flights
    function generateMockFlights(departure, arrival, date) {
        const airlines = [
            { name: 'Thai Airways', code: 'TG', logo: '../assets/images/icons/airplane.svg' },
            { name: 'Bangkok Airways', code: 'PG', logo: '../assets/images/icons/airplane.svg' },
            { name: 'AirAsia', code: 'FD', logo: '../assets/images/icons/airplane.svg' },
            { name: 'Nok Air', code: 'DD', logo: '../assets/images/icons/airplane.svg' }
        ];
        
        const flights = [];
        
        // Generate 5-8 random flights
        const numFlights = Math.floor(Math.random() * 4) + 5;
        
        for (let i = 0; i < numFlights; i++) {
            const airline = airlines[Math.floor(Math.random() * airlines.length)];
            const flightNumber = `${airline.code}${Math.floor(Math.random() * 900) + 100}`;
            
            // Generate random departure time (between 6:00 and 22:00)
            const departureHour = Math.floor(Math.random() * 16) + 6;
            const departureMinute = Math.floor(Math.random() * 12) * 5; // 0, 5, 10, ..., 55
            
            const departureTime = `${String(departureHour).padStart(2, '0')}:${String(departureMinute).padStart(2, '0')}`;
            
            // Generate random flight duration (between 1h 15m and 2h 30m)
            const durationMinutes = Math.floor(Math.random() * 75) + 75;
            const durationHours = Math.floor(durationMinutes / 60);
            const durationRemainder = durationMinutes % 60;
            const duration = `${durationHours}h ${durationRemainder}m`;
            
            // Calculate arrival time
            const arrivalDateTime = new Date(date);
            arrivalDateTime.setHours(departureHour);
            arrivalDateTime.setMinutes(departureMinute + durationMinutes);
            
            const arrivalHour = arrivalDateTime.getHours();
            const arrivalMinute = arrivalDateTime.getMinutes();
            const arrivalTime = `${String(arrivalHour).padStart(2, '0')}:${String(arrivalMinute).padStart(2, '0')}`;
            
            // Generate random price (between 1,200 and 4,500 THB)
            const price = Math.floor(Math.random() * 3300) + 1200;
            
            flights.push({
                airline: airline.name,
                airlineLogo: airline.logo,
                flightNumber,
                departureTime,
                arrivalTime,
                duration,
                price
            });
        }
        
        // Sort flights by departure time
        flights.sort((a, b) => {
            return a.departureTime.localeCompare(b.departureTime);
        });
        
        return flights;
    }
    
    // Function to create flight card
    function createFlightCard(flight) {
        const flightCard = document.createElement('div');
        flightCard.className = 'flight-card';
        
        flightCard.innerHTML = `
            <div class="airline-info">
                <img src="${flight.airlineLogo}" alt="${flight.airline}" class="airline-logo">
                <div>
                    <div class="airline-name">${flight.airline}</div>
                    <div class="flight-number">${flight.flightNumber}</div>
                </div>
            </div>
            <div class="flight-times">
                <div class="departure">
                    <div class="time">${flight.departureTime}</div>
                    <div class="airport">BKK</div>
                </div>
                <div class="flight-duration">
                    <div class="duration">${flight.duration}</div>
                    <div class="flight-line"></div>
                </div>
                <div class="arrival">
                    <div class="time">${flight.arrivalTime}</div>
                    <div class="airport">CNX</div>
                </div>
            </div>
            <div class="price-select">
                <div class="price">฿${flight.price.toLocaleString()}</div>
                <a href="flight-details.html" class="btn btn-primary select-btn">เลือก</a>
            </div>
        `;
        
        return flightCard;
    }
    
    // Initialize page
    // Hide return date field by default (for one-way)
    returnDateGroup.style.display = 'none';
    returnDateInput.removeAttribute('required');
    
    // Set up city suggestions
    setupCitySuggestions(departureInput);
    setupCitySuggestions(arrivalInput);
    
    // City suggestions function
    function setupCitySuggestions(input) {
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
        
        input.addEventListener('focus', function() {
            // Create suggestions container
            let suggestionsContainer = document.querySelector('.city-suggestions');
            
            if (!suggestionsContainer) {
                suggestionsContainer = document.createElement('div');
                suggestionsContainer.className = 'city-suggestions';
                document.body.appendChild(suggestionsContainer);
            }
            
            // Position suggestions container
            const inputRect = input.getBoundingClientRect();
            suggestionsContainer.style.width = `${input.offsetWidth}px`;
            suggestionsContainer.style.left = `${inputRect.left}px`;
            suggestionsContainer.style.top = `${inputRect.bottom}px`;
            
            // Filter cities based on input value
            const filteredCities = cities.filter(city => 
                city.toLowerCase().includes(input.value.toLowerCase())
            );
            
            // Populate suggestions
            suggestionsContainer.innerHTML = '';
            
            filteredCities.forEach(city => {
                const suggestion = document.createElement('div');
                suggestion.className = 'suggestion';
                suggestion.textContent = city;
                
                suggestion.addEventListener('click', function() {
                    input.value = city;
                    suggestionsContainer.innerHTML = '';
                });
                
                suggestionsContainer.appendChild(suggestion);
            });
            
            // Show suggestions
            suggestionsContainer.style.display = 'block';
        });
        
        // Hide suggestions when clicking outside
        document.addEventListener('click', function(e) {
            if (e.target !== input) {
                const suggestionsContainer = document.querySelector('.city-suggestions');
                if (suggestionsContainer) {
                    suggestionsContainer.innerHTML = '';
                }
            }
        });
        
        // Filter suggestions on input
        input.addEventListener('input', function() {
            const suggestionsContainer = document.querySelector('.city-suggestions');
            
            if (suggestionsContainer) {
                // Filter cities based on input value
                const filteredCities = cities.filter(city => 
                    city.toLowerCase().includes(input.value.toLowerCase())
                );
                
                // Populate suggestions
                suggestionsContainer.innerHTML = '';
                
                filteredCities.forEach(city => {
                    const suggestion = document.createElement('div');
                    suggestion.className = 'suggestion';
                    suggestion.textContent = city;
                    
                    suggestion.addEventListener('click', function() {
                        input.value = city;
                        suggestionsContainer.innerHTML = '';
                    });
                    
                    suggestionsContainer.appendChild(suggestion);
                });
            }
        });
    }
});