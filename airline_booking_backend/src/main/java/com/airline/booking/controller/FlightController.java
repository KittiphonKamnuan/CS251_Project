package com.airline.booking.controller;

import com.airline.booking.dto.FlightDTO;
import com.airline.booking.dto.FlightSearchResponse;
import com.airline.booking.model.Flight;
import com.airline.booking.service.FlightService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/flights")
@CrossOrigin(origins = "*")
public class FlightController {

    private static final Logger logger = LoggerFactory.getLogger(FlightController.class);

    @Autowired
    private FlightService flightService;

    // ดึงเที่ยวบินทั้งหมด - ใช้ DTO
    @GetMapping
    public ResponseEntity<List<FlightDTO>> getAllFlights() {
        try {
            List<Flight> flights = flightService.getAllFlights();
            List<FlightDTO> flightDTOs = flightService.convertToDTOList(flights);
            return new ResponseEntity<>(flightDTOs, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error retrieving all flights: ", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ดึงเที่ยวบินตาม ID - ใช้ DTO
    @GetMapping("/{id}")
    public ResponseEntity<FlightDTO> getFlightById(@PathVariable(value = "id") String flightId) {
        try {
            Flight flight = flightService.getFlightById(flightId);
            FlightDTO flightDTO = flightService.convertToDTO(flight);
            return new ResponseEntity<>(flightDTO, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error retrieving flight with ID: " + flightId, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ค้นหาเที่ยวบินตามหมายเลขเที่ยวบิน - ใช้ DTO
    @GetMapping("/number/{flightNumber}")
    public ResponseEntity<FlightDTO> getFlightByFlightNumber(@PathVariable(value = "flightNumber") String flightNumber) {
        try {
            Flight flight = flightService.getFlightByFlightNumber(flightNumber);
            FlightDTO flightDTO = flightService.convertToDTO(flight);
            return new ResponseEntity<>(flightDTO, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error retrieving flight with number: " + flightNumber, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ค้นหาเที่ยวบินตามเมืองต้นทางและปลายทาง - ใช้ DTO
    @GetMapping("/search")
    public ResponseEntity<List<FlightDTO>> searchFlightsByRoute(
            @RequestParam(value = "from") String departureCity,
            @RequestParam(value = "to") String arrivalCity) {
        try {
            List<Flight> flights = flightService.getFlightsByRoute(departureCity, arrivalCity);
            List<FlightDTO> flightDTOs = flightService.convertToDTOList(flights);
            return new ResponseEntity<>(flightDTOs, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error searching flights by route: " + departureCity + " to " + arrivalCity, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ค้นหาเที่ยวบินตามเมืองต้นทาง ปลายทาง และช่วงเวลาเดินทาง - ใช้ DTO และ Pagination
    @GetMapping("/search/advanced")
    public ResponseEntity<?> searchFlights(
            @RequestParam(value = "from") String departureCity,
            @RequestParam(value = "to") String arrivalCity,
            @RequestParam(value = "departureFrom") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime departureFrom,
            @RequestParam(value = "departureTo") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime departureTo,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        
        try {
            logger.info("Search request received for route: {} to {}, departure between: {} and {}", 
                      departureCity, arrivalCity, departureFrom, departureTo);
            
            // ใช้ Pagination
            Pageable pageable = PageRequest.of(page, size);
            Page<Flight> flightPage = flightService.searchFlightsWithPagination(
                departureCity, arrivalCity, departureFrom, departureTo, pageable);
            
            // แปลงเป็น DTO
            List<FlightDTO> flightDTOs = flightPage.getContent().stream()
                    .map(flightService::convertToDTO)
                    .collect(Collectors.toList());
            
            // สร้าง response object
            FlightSearchResponse response = new FlightSearchResponse(
                flightDTOs,
                (int) flightPage.getTotalElements(),
                flightPage.getNumber(),
                flightPage.getTotalPages()
            );
            
            logger.info("Found {} flights for route: {} to {}", flightPage.getTotalElements(), 
                      departureCity, arrivalCity);
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error searching flights: ", e);
            
            // ส่ง error message กลับไปด้วย
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "เกิดข้อผิดพลาดในการค้นหาเที่ยวบิน");
            errorResponse.put("message", e.getMessage());
            
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ค้นหาเที่ยวบินตามสถานะ - ใช้ DTO
    @GetMapping("/status/{status}")
    public ResponseEntity<List<FlightDTO>> getFlightsByStatus(@PathVariable(value = "status") String flightStatus) {
        try {
            List<Flight> flights = flightService.getFlightsByStatus(flightStatus);
            List<FlightDTO> flightDTOs = flightService.convertToDTOList(flights);
            return new ResponseEntity<>(flightDTOs, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error retrieving flights with status: " + flightStatus, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // สร้างเที่ยวบินใหม่
    @PostMapping
    public ResponseEntity<FlightDTO> createFlight(@RequestBody Flight flight) {
        try {
            Flight newFlight = flightService.createFlight(flight);
            FlightDTO flightDTO = flightService.convertToDTO(newFlight);
            return new ResponseEntity<>(flightDTO, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.error("Error creating flight: ", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // อัปเดตข้อมูลเที่ยวบิน
    @PutMapping("/{id}")
    public ResponseEntity<FlightDTO> updateFlight(
            @PathVariable(value = "id") String flightId,
            @RequestBody Flight flightDetails) {
        try {
            Flight updatedFlight = flightService.updateFlight(flightId, flightDetails);
            FlightDTO flightDTO = flightService.convertToDTO(updatedFlight);
            return new ResponseEntity<>(flightDTO, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error updating flight with ID: " + flightId, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // อัปเดตสถานะเที่ยวบิน
    @PatchMapping("/{id}/status")
    public ResponseEntity<FlightDTO> updateFlightStatus(
            @PathVariable(value = "id") String flightId,
            @RequestBody Map<String, String> statusUpdate) {
        try {
            String newStatus = statusUpdate.get("status");
            Flight updatedFlight = flightService.updateFlightStatus(flightId, newStatus);
            FlightDTO flightDTO = flightService.convertToDTO(updatedFlight);
            return new ResponseEntity<>(flightDTO, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error updating status for flight with ID: " + flightId, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ลบเที่ยวบิน
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Boolean>> deleteFlight(@PathVariable(value = "id") String flightId) {
        try {
            flightService.deleteFlight(flightId);
            
            Map<String, Boolean> response = new HashMap<>();
            response.put("deleted", Boolean.TRUE);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error deleting flight with ID: " + flightId, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}