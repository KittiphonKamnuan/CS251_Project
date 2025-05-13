document.addEventListener('DOMContentLoaded', function() {
    // Booking Search Form
    const bookingSearchForm = document.getElementById('booking-search-form');
    const upcomingBookings = document.getElementById('upcoming-bookings');
    const pastBookings = document.getElementById('past-bookings');
    const noResults = document.getElementById('no-results');
    
    if (bookingSearchForm) {
        bookingSearchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const bookingReference = document.getElementById('booking-reference').value.trim();
            const lastName = document.getElementById('last-name').value.trim();
            
            if (!bookingReference || !lastName) {
                alert('กรุณากรอกรหัสการจองและนามสกุลของคุณ');
                return;
            }
            
            // Simulate API call to search for booking
            searchBooking(bookingReference, lastName);
        });
    }
    
    // Simulate booking search
    function searchBooking(reference, lastName) {
        // Show loading state
        bookingSearchForm.querySelector('button[type="submit"]').disabled = true;
        bookingSearchForm.querySelector('button[type="submit"]').innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังค้นหา...';
        
        // Simulate API call delay
        setTimeout(() => {
            // Reset button state
            bookingSearchForm.querySelector('button[type="submit"]').disabled = false;
            bookingSearchForm.querySelector('button[type="submit"]').innerHTML = 'ค้นหา';
            
            // Check if we have a match (for demo purposes)
            if (reference.toUpperCase() === 'SKY123456' && lastName.toLowerCase() === 'ใจดี') {
                // Show the booking details
                upcomingBookings.style.display = 'block';
                pastBookings.style.display = 'block';
                noResults.style.display = 'none';
                
                // Scroll to booking
                const bookingCard = document.querySelector('.booking-card');
                bookingCard.classList.add('highlight');
                bookingCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Remove highlight after a few seconds
                setTimeout(() => {
                    bookingCard.classList.remove('highlight');
                }, 3000);
            } else {
                // Show no results
                upcomingBookings.style.display = 'none';
                pastBookings.style.display = 'none';
                noResults.style.display = 'block';
                
                // Scroll to no results
                noResults.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 1500);
    }
    
    // Sorting functionality
    const sortSelect = document.getElementById('sort-by');
    
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const sortValue = this.value;
            const bookingCards = document.querySelectorAll('#upcoming-bookings .booking-card');
            
            // Convert NodeList to Array for sorting
            const bookingCardsArray = Array.from(bookingCards);
            
            // Sort booking cards based on selected option
            bookingCardsArray.sort((a, b) => {
                if (sortValue === 'date-asc') {
                    // Sort by date (newest first)
                    const dateA = new Date(a.querySelector('.booking-date .value').textContent);
                    const dateB = new Date(b.querySelector('.booking-date .value').textContent);
                    return dateB - dateA;
                } else if (sortValue === 'date-desc') {
                    // Sort by date (oldest first)
                    const dateA = new Date(a.querySelector('.booking-date .value').textContent);
                    const dateB = new Date(b.querySelector('.booking-date .value').textContent);
                    return dateA - dateB;
                } else if (sortValue === 'price-asc' || sortValue === 'price-desc') {
                    // In a real app, we would sort by price
                    // For this demo, we'll just maintain the current order
                    return 0;
                }
            });
            
            // Remove all booking cards from the container
            const bookingCardsContainer = document.querySelector('#upcoming-bookings .booking-cards');
            bookingCardsContainer.innerHTML = '';
            
            // Add sorted booking cards back to the container
            bookingCardsArray.forEach(card => {
                bookingCardsContainer.appendChild(card);
            });
        });
    }
    
    // Payment countdown timer
    const countdownElement = document.querySelector('.payment-countdown');
    
    if (countdownElement) {
        // Parse the initial countdown time
        let countdownText = countdownElement.textContent.trim();
        let timeMatch = countdownText.match(/(\d+):(\d+):(\d+)/);
        
        if (timeMatch) {
            let hours = parseInt(timeMatch[1]);
            let minutes = parseInt(timeMatch[2]);
            let seconds = parseInt(timeMatch[3]);
            
            // Calculate total seconds
            let totalSeconds = hours * 3600 + minutes * 60 + seconds;
            
            // Update countdown every second
            const countdownInterval = setInterval(function() {
                totalSeconds--;
                
                if (totalSeconds <= 0) {
                    clearInterval(countdownInterval);
                    countdownElement.innerHTML = '<i class="fas fa-exclamation-circle"></i> หมดเวลาชำระเงิน';
                    countdownElement.style.color = 'var(--danger)';
                    return;
                }
                
                // Calculate hours, minutes, seconds
                hours = Math.floor(totalSeconds / 3600);
                minutes = Math.floor((totalSeconds % 3600) / 60);
                seconds = totalSeconds % 60;
                
                // Format time with leading zeros
                const formattedTime = 
                    String(hours).padStart(2, '0') + ':' + 
                    String(minutes).padStart(2, '0') + ':' + 
                    String(seconds).padStart(2, '0');
                
                // Update countdown display
                countdownElement.innerHTML = '<i class="fas fa-clock"></i> เหลือเวลาชำระเงิน: ' + formattedTime;
                
                // Change color if less than 1 hour remaining
                if (totalSeconds < 3600) {
                    countdownElement.style.color = 'var(--danger)';
                }
            }, 1000);
        }
    }
    
    // Add highlight style for search results
    const style = document.createElement('style');
    style.textContent = `
        .booking-card.highlight {
            animation: highlight 1.5s ease-in-out;
        }
        
        @keyframes highlight {
            0%, 100% {
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            50% {
                box-shadow: 0 0 20px var(--primary-color);
            }
        }
    `;
    document.head.appendChild(style);
});