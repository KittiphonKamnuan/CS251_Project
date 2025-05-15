package com.airline.booking.controller;

import com.airline.booking.model.Seat;
import com.airline.booking.service.SeatService;
import com.airline.booking.exception.ResourceNotFoundException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/seats")
@CrossOrigin(origins = "*")
public class SeatController {
    
    private static final Logger logger = LoggerFactory.getLogger(SeatController.class);

    @Autowired
    private SeatService seatService;

    // ดึงข้อมูลที่นั่งทั้งหมด
    @GetMapping
    public ResponseEntity<?> getAllSeats() {
        try {
            logger.debug("เริ่มการดึงข้อมูลที่นั่งทั้งหมด");
            List<Seat> seats = seatService.getAllSeats();
            logger.debug("ดึงข้อมูลที่นั่งทั้งหมดสำเร็จ จำนวน: {}", seats.size());
            return new ResponseEntity<>(seats, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการดึงข้อมูลที่นั่งทั้งหมด: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการดึงข้อมูลที่นั่ง: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // ดึงข้อมูลที่นั่งตาม ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getSeatById(@PathVariable(value = "id") String seatId) {
        try {
            logger.debug("เริ่มการดึงข้อมูลที่นั่งตาม ID: {}", seatId);
            Seat seat = seatService.getSeatById(seatId);
            logger.debug("ดึงข้อมูลที่นั่งสำเร็จ: {}", seat);
            return new ResponseEntity<>(seat, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            logger.error("ไม่พบที่นั่งกับ ID: {}", seatId, e);
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการดึงข้อมูลที่นั่ง: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการดึงข้อมูลที่นั่ง: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // ดึงข้อมูลที่นั่งตามเที่ยวบิน - นี่คือส่วนที่สำคัญที่สุด ที่ขาดไปและทำให้เกิด 404 error
    @GetMapping("/flight/{flightId}")
    public ResponseEntity<?> getSeatsByFlightId(@PathVariable(value = "flightId") String flightId) {
        try {
            logger.debug("เริ่มการดึงข้อมูลที่นั่งตามเที่ยวบิน ID: {}", flightId);
            List<Seat> seats = seatService.getSeatsByFlightId(flightId);
            logger.debug("ดึงข้อมูลที่นั่งตามเที่ยวบินสำเร็จ จำนวน: {}", seats.size());
            return new ResponseEntity<>(seats, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            logger.error("ไม่พบที่นั่งสำหรับเที่ยวบิน ID: {}", flightId, e);
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการดึงข้อมูลที่นั่งตามเที่ยวบิน: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการดึงข้อมูลที่นั่งตามเที่ยวบิน: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // ดึงข้อมูลที่นั่งว่างตามเที่ยวบิน
    @GetMapping("/flight/{flightId}/available")
    public ResponseEntity<?> getAvailableSeatsByFlightId(@PathVariable(value = "flightId") String flightId) {
        try {
            List<Seat> availableSeats = seatService.getAvailableSeatsByFlightId(flightId);
            return new ResponseEntity<>(availableSeats, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการดึงข้อมูลที่นั่งว่าง: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // ดึงข้อมูลที่นั่งตามชั้นโดยสารและเที่ยวบิน
    @GetMapping("/flight/{flightId}/class/{seatClass}")
    public ResponseEntity<?> getSeatsByFlightIdAndClass(
            @PathVariable(value = "flightId") String flightId,
            @PathVariable(value = "seatClass") String seatClass) {
        try {
            List<Seat> seats = seatService.getSeatsByFlightIdAndClass(flightId, seatClass);
            return new ResponseEntity<>(seats, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการดึงข้อมูลที่นั่งตามชั้นโดยสาร: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // สร้างที่นั่งใหม่
    @PostMapping
    public ResponseEntity<?> createSeat(@RequestBody Seat seat) {
        try {
            Seat newSeat = seatService.createSeat(seat);
            return new ResponseEntity<>(newSeat, HttpStatus.CREATED);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการสร้างที่นั่ง: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // อัปเดตข้อมูลที่นั่ง
    @PutMapping("/{id}")
    public ResponseEntity<?> updateSeat(
            @PathVariable(value = "id") String seatId,
            @RequestBody Seat seatDetails) {
        try {
            Seat updatedSeat = seatService.updateSeat(seatId, seatDetails);
            return new ResponseEntity<>(updatedSeat, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการอัปเดตที่นั่ง: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // อัปเดตสถานะที่นั่ง
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateSeatStatus(
            @PathVariable(value = "id") String seatId,
            @RequestBody Map<String, String> statusData) {
        try {
            String newStatus = statusData.get("status");
            
            if (newStatus == null) {
                throw new IllegalArgumentException("ต้องระบุสถานะที่นั่งใหม่");
            }
            
            Seat updatedSeat = seatService.updateSeatStatus(seatId, newStatus);
            return new ResponseEntity<>(updatedSeat, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการอัปเดตสถานะที่นั่ง: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // ลบที่นั่ง
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSeat(@PathVariable(value = "id") String seatId) {
        try {
            seatService.deleteSeat(seatId);
            
            Map<String, Boolean> response = new HashMap<>();
            response.put("deleted", Boolean.TRUE);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการลบที่นั่ง: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}