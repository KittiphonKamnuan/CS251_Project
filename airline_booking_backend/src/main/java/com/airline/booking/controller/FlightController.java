package com.airline.booking.controller;

import com.airline.booking.model.Flight;
import com.airline.booking.service.FlightService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/flights")
@CrossOrigin(origins = "*")
public class FlightController {

    @Autowired
    private FlightService flightService;

    // ดึงเที่ยวบินทั้งหมด
    @GetMapping
    public ResponseEntity<List<Flight>> getAllFlights() {
        List<Flight> flights = flightService.getAllFlights();
        return new ResponseEntity<>(flights, HttpStatus.OK);
    }

    // ดึงเที่ยวบินตาม ID
    @GetMapping("/{id}")
    public ResponseEntity<Flight> getFlightById(@PathVariable(value = "id") String flightId) {
        Flight flight = flightService.getFlightById(flightId);
        return new ResponseEntity<>(flight, HttpStatus.OK);
    }

    // ค้นหาเที่ยวบินตามหมายเลขเที่ยวบิน
    @GetMapping("/number/{flightNumber}")
    public ResponseEntity<Flight> getFlightByFlightNumber(@PathVariable(value = "flightNumber") String flightNumber) {
        Flight flight = flightService.getFlightByFlightNumber(flightNumber);
        return new ResponseEntity<>(flight, HttpStatus.OK);
    }

    // ค้นหาเที่ยวบินตามเมืองต้นทางและปลายทาง
    @GetMapping("/search")
    public ResponseEntity<List<Flight>> searchFlightsByRoute(
            @RequestParam(value = "from") String departureCity,
            @RequestParam(value = "to") String arrivalCity) {
        List<Flight> flights = flightService.getFlightsByRoute(departureCity, arrivalCity);
        return new ResponseEntity<>(flights, HttpStatus.OK);
    }

    // ค้นหาเที่ยวบินตามเมืองต้นทาง ปลายทาง และช่วงเวลาเดินทาง
    @GetMapping("/search/advanced")
    public ResponseEntity<List<Flight>> searchFlights(
            @RequestParam(value = "from") String departureCity,
            @RequestParam(value = "to") String arrivalCity,
            @RequestParam(value = "departureFrom") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime departureFrom,
            @RequestParam(value = "departureTo") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime departureTo) {
        List<Flight> flights = flightService.searchFlights(departureCity, arrivalCity, departureFrom, departureTo);
        return new ResponseEntity<>(flights, HttpStatus.OK);
    }

    // ค้นหาเที่ยวบินตามสถานะ
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Flight>> getFlightsByStatus(@PathVariable(value = "status") String flightStatus) {
        List<Flight> flights = flightService.getFlightsByStatus(flightStatus);
        return new ResponseEntity<>(flights, HttpStatus.OK);
    }

    // สร้างเที่ยวบินใหม่
    @PostMapping
    public ResponseEntity<Flight> createFlight(@RequestBody Flight flight) {
        Flight newFlight = flightService.createFlight(flight);
        return new ResponseEntity<>(newFlight, HttpStatus.CREATED);
    }

    // อัปเดตข้อมูลเที่ยวบิน
    @PutMapping("/{id}")
    public ResponseEntity<Flight> updateFlight(
            @PathVariable(value = "id") String flightId,
            @RequestBody Flight flightDetails) {
        Flight updatedFlight = flightService.updateFlight(flightId, flightDetails);
        return new ResponseEntity<>(updatedFlight, HttpStatus.OK);
    }

    // อัปเดตสถานะเที่ยวบิน
    @PatchMapping("/{id}/status")
    public ResponseEntity<Flight> updateFlightStatus(
            @PathVariable(value = "id") String flightId,
            @RequestBody Map<String, String> statusUpdate) {
        String newStatus = statusUpdate.get("status");
        Flight updatedFlight = flightService.updateFlightStatus(flightId, newStatus);
        return new ResponseEntity<>(updatedFlight, HttpStatus.OK);
    }

    // ลบเที่ยวบิน
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Boolean>> deleteFlight(@PathVariable(value = "id") String flightId) {
        flightService.deleteFlight(flightId);
        
        Map<String, Boolean> response = new HashMap<>();
        response.put("deleted", Boolean.TRUE);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}