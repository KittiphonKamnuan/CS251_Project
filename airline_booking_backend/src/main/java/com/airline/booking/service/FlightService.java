package com.airline.booking.service;

import com.airline.booking.dto.FlightDTO;
import com.airline.booking.exception.ResourceNotFoundException;
import com.airline.booking.model.Flight;
import com.airline.booking.model.Seat;
import com.airline.booking.repository.FlightRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class FlightService {

    @Autowired
    private FlightRepository flightRepository;

    // ดึงเที่ยวบินทั้งหมด
    public List<Flight> getAllFlights() {
        return flightRepository.findAll();
    }

    // ดึงเที่ยวบินตาม ID
    public Flight getFlightById(String flightId) {
        return flightRepository.findById(flightId)
                .orElseThrow(() -> new ResourceNotFoundException("ไม่พบเที่ยวบินกับรหัส: " + flightId));
    }

    // ค้นหาเที่ยวบินตามรหัสเที่ยวบิน
    public Flight getFlightByFlightNumber(String flightNumber) {
        Flight flight = flightRepository.findByFlightNumber(flightNumber);
        if (flight == null) {
            throw new ResourceNotFoundException("ไม่พบเที่ยวบินกับหมายเลข: " + flightNumber);
        }
        return flight;
    }

    // ค้นหาเที่ยวบินตามเมืองต้นทางและปลายทาง
    public List<Flight> getFlightsByRoute(String departureCity, String arrivalCity) {
        return flightRepository.findByDepartureCityAndArrivalCity(departureCity, arrivalCity);
    }

    // ค้นหาเที่ยวบินตามเมืองต้นทาง ปลายทาง และช่วงเวลาเดินทาง
    public List<Flight> searchFlights(String departureCity, String arrivalCity, 
                                   LocalDateTime startDate, LocalDateTime endDate) {
        return flightRepository.findFlights(departureCity, arrivalCity, startDate, endDate);
    }
    
    // ค้นหาเที่ยวบินตามเมืองต้นทาง ปลายทาง และช่วงเวลาเดินทาง พร้อม Pagination
    public Page<Flight> searchFlightsWithPagination(String departureCity, String arrivalCity,
                                                 LocalDateTime startDate, LocalDateTime endDate,
                                                 Pageable pageable) {
        return flightRepository.findFlightsWithPagination(departureCity, arrivalCity, startDate, endDate, pageable);
    }

    // ค้นหาเที่ยวบินตามสถานะ
    public List<Flight> getFlightsByStatus(String flightStatus) {
        return flightRepository.findByFlightStatus(flightStatus);
    }

    // สร้างเที่ยวบินใหม่
    public Flight createFlight(Flight flight) {
        // ตรวจสอบว่ามี ID แล้วหรือยัง
        if (flight.getFlightId() == null || flight.getFlightId().isEmpty()) {
            // สร้าง ID ใหม่
            flight.setFlightId(generateFlightId());
        }
        
        return flightRepository.save(flight);
    }

    // อัปเดตข้อมูลเที่ยวบิน
    public Flight updateFlight(String flightId, Flight flightDetails) {
        Flight flight = getFlightById(flightId);
        
        // อัปเดตข้อมูล
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

    // อัปเดตสถานะเที่ยวบิน
    public Flight updateFlightStatus(String flightId, String newStatus) {
        Flight flight = getFlightById(flightId);
        flight.setFlightStatus(newStatus);
        return flightRepository.save(flight);
    }

    // ลบเที่ยวบิน
    public void deleteFlight(String flightId) {
        Flight flight = getFlightById(flightId);
        flightRepository.delete(flight);
    }

    // สร้าง ID สำหรับเที่ยวบินใหม่
    private String generateFlightId() {
        // สร้าง prefix
        String prefix = "TG";
        
        // สร้างเลขสุ่ม 3 หลัก
        Random random = new Random();
        int number = 100 + random.nextInt(900);
        
        // รวมกันเป็น ID
        return prefix + number;
    }
    
    // แปลง Flight เป็น FlightDTO
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
        
        // หาราคาเริ่มต้นจากที่นั่งที่ถูกที่สุด หรือใช้ค่าเริ่มต้น
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
    
    // แปลง List<Flight> เป็น List<FlightDTO>
    public List<FlightDTO> convertToDTOList(List<Flight> flights) {
        return flights.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
}