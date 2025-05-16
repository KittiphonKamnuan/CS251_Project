package com.airline.booking.service;

import com.airline.booking.dto.FlightDTO;
import com.airline.booking.exception.ResourceNotFoundException;
import com.airline.booking.model.Flight;
import com.airline.booking.model.Seat;
import com.airline.booking.repository.FlightRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class FlightService {

    @Autowired
    private FlightRepository flightRepository;
    
    public long countFlights() {
        return flightRepository.count();
    }

    // Get all flights
    public List<Flight> getAllFlights() {
        return flightRepository.findAll();
    }
    
    // Get flights with pagination
    public List<Flight> getFlightsWithPagination(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return flightRepository.findAll(pageable).getContent();
    }
    
    // Get flight report by date range
    public Map<String, Object> getFlightReportByDateRange(LocalDate fromDate, LocalDate toDate) {
        Map<String, Object> report = new HashMap<>();
        
        LocalDateTime startDateTime = fromDate.atStartOfDay();
        LocalDateTime endDateTime = toDate.plusDays(1).atStartOfDay().minusSeconds(1);
        
        List<Flight> flights = flightRepository.findByDepartureTimeBetween(startDateTime, endDateTime);
        
        report.put("fromDate", fromDate);
        report.put("toDate", toDate);
        report.put("totalFlights", flights.size());
        // Add more flight statistics as needed
        
        return report;
    }
    
    // Get flight report
    public Map<String, Object> getFlightReport() {
        Map<String, Object> report = new HashMap<>();
        
        report.put("totalFlights", flightRepository.count());
        // Add more flight statistics as needed
        
        return report;
    }

    // Get flight by ID
    public Flight getFlightById(String flightId) {
        return flightRepository.findById(flightId)
                .orElseThrow(() -> new ResourceNotFoundException("ไม่พบเที่ยวบินกับรหัส: " + flightId));
    }

    // Search flight by flight number
    public Flight getFlightByFlightNumber(String flightNumber) {
        Flight flight = flightRepository.findByFlightNumber(flightNumber);
        if (flight == null) {
            throw new ResourceNotFoundException("ไม่พบเที่ยวบินกับหมายเลข: " + flightNumber);
        }
        return flight;
    }

    // Search flights by route
    public List<Flight> getFlightsByRoute(String departureCity, String arrivalCity) {
        return flightRepository.findByDepartureCityAndArrivalCity(departureCity, arrivalCity);
    }

    // Search flights by route and date
    public List<Flight> searchFlightsByRouteAndDate(String from, String to, LocalDate departureDate) {
        LocalDateTime startOfDay = departureDate.atStartOfDay();
        LocalDateTime endOfDay = departureDate.plusDays(1).atStartOfDay().minusSeconds(1);
        
        return searchFlights(from, to, startOfDay, endOfDay);
    }

    // Search flights by route and time range
    public List<Flight> searchFlights(String departureCity, String arrivalCity, 
                                   LocalDateTime startDate, LocalDateTime endDate) {
        return flightRepository.findFlights(departureCity, arrivalCity, startDate, endDate);
    }
    
    // Search flights with pagination
    public Page<Flight> searchFlightsWithPagination(String departureCity, String arrivalCity,
                                                 LocalDateTime startDate, LocalDateTime endDate,
                                                 Pageable pageable) {
        return flightRepository.findFlightsWithPagination(departureCity, arrivalCity, startDate, endDate, pageable);
    }

    // Get flights by status
    public List<Flight> getFlightsByStatus(String flightStatus) {
        return flightRepository.findByFlightStatus(flightStatus);
    }

    // Create a new flight
    public Flight createFlight(Flight flight) {
        // Check if ID exists
        if (flight.getFlightId() == null || flight.getFlightId().isEmpty()) {
            // Create new ID
            flight.setFlightId(generateFlightId());
        }
        
        return flightRepository.save(flight);
    }

    // Update flight
    public Flight updateFlight(String flightId, Flight flightDetails) {
        Flight flight = getFlightById(flightId);
        
        // Update data
        if (flightDetails.getFlightNumber() != null) {
            flight.setFlightNumber(flightDetails.getFlightNumber());
        }
        
        if (flightDetails.getDepartureCity() != null) {
            flight.setDepartureCity(flightDetails.getDepartureCity());
        }
        
        if (flightDetails.getArrivalCity() != null) {
            flight.setArrivalCity(flightDetails.getArrivalCity());
        }
        
        if (flightDetails.getDepartureTime() != null) {
            flight.setDepartureTime(flightDetails.getDepartureTime());
        }
        
        if (flightDetails.getArrivalTime() != null) {
            flight.setArrivalTime(flightDetails.getArrivalTime());
        }
        
        if (flightDetails.getAircraft() != null) {
            flight.setAircraft(flightDetails.getAircraft());
        }
        
        if (flightDetails.getFlightStatus() != null) {
            flight.setFlightStatus(flightDetails.getFlightStatus());
        }
        
        return flightRepository.save(flight);
    }

    // Update flight status
    public Flight updateFlightStatus(String flightId, String newStatus) {
        Flight flight = getFlightById(flightId);
        flight.setFlightStatus(newStatus);
        return flightRepository.save(flight);
    }

    // Delete flight
    public void deleteFlight(String flightId) {
        Flight flight = getFlightById(flightId);
        flightRepository.delete(flight);
    }

    // Generate flight ID
    private String generateFlightId() {
        // Create prefix
        String prefix = "TG";
        
        // Create 3-digit random number
        Random random = new Random();
        int number = 100 + random.nextInt(900);
        
        // Combine to make ID
        return prefix + number;
    }
    
    // Convert Flight to FlightDTO
    public FlightDTO convertToDTO(Flight flight) {
        FlightDTO dto = new FlightDTO();
        dto.setFlightId(flight.getFlightId());
        dto.setFlightNumber(flight.getFlightNumber());
        dto.setDepartureCity(flight.getDepartureCity());
        dto.setArrivalCity(flight.getArrivalCity());
        dto.setDepartureTime(flight.getDepartureTime());
        dto.setArrivalTime(flight.getArrivalTime());
        dto.setAircraft(flight.getAircraft());
        dto.setFlightStatus(flight.getFlightStatus());
        
        // Find cheapest seat price or use default
        BigDecimal basePrice = new BigDecimal("1290");
        if (flight.getSeats() != null && !flight.getSeats().isEmpty()) {
            basePrice = flight.getSeats().stream()
                .map(Seat::getPrice)
                .min(BigDecimal::compareTo)
                .orElse(basePrice);
        }
        
        dto.setPrice(basePrice);
        
        return dto;
    }
    
    // Convert List<Flight> to List<FlightDTO>
    public List<FlightDTO> convertToDTOList(List<Flight> flights) {
        return flights.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
}