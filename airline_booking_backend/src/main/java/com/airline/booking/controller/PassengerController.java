package com.airline.booking.controller;

import com.airline.booking.model.Passenger;
import com.airline.booking.service.PassengerService;
import com.airline.booking.exception.ResourceNotFoundException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/passengers")
@CrossOrigin(origins = "*")
public class PassengerController {

    private static final Logger logger = LoggerFactory.getLogger(PassengerController.class);

    @Autowired
    private PassengerService passengerService;

    // สร้างผู้โดยสารใหม่ พร้อมระบุ bookingId และ seatId
    @PostMapping
    public ResponseEntity<?> createPassenger(
            @RequestBody Passenger passenger,
            @RequestParam String bookingId,
            @RequestParam String seatId) {
        try {
            logger.debug("เริ่มสร้างผู้โดยสารใหม่สำหรับ BookingID: {} และ SeatID: {}", bookingId, seatId);
            Passenger createdPassenger = passengerService.createPassenger(passenger, bookingId, seatId);
            logger.debug("สร้างผู้โดยสารสำเร็จ: {}", createdPassenger);
            return new ResponseEntity<>(createdPassenger, HttpStatus.CREATED);
        } catch (ResourceNotFoundException e) {
            logger.error("ไม่พบ Booking หรือ Seat: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการสร้างผู้โดยสาร: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการสร้างผู้โดยสาร: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ดึงข้อมูลผู้โดยสารทั้งหมด
    @GetMapping
    public ResponseEntity<?> getAllPassengers() {
        try {
            logger.debug("เรียกดูผู้โดยสารทั้งหมด");
            List<Passenger> passengers = passengerService.getAllPassengers();
            return new ResponseEntity<>(passengers, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการดึงข้อมูลผู้โดยสาร: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการดึงข้อมูลผู้โดยสาร: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ดึงผู้โดยสารตาม ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getPassengerById(@PathVariable String id) {
        try {
            logger.debug("เรียกดูผู้โดยสารตาม ID: {}", id);
            Passenger passenger = passengerService.getPassengerById(id);
            return new ResponseEntity<>(passenger, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            logger.error("ไม่พบผู้โดยสารกับ ID: {}", id, e);
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการดึงข้อมูลผู้โดยสาร: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการดึงข้อมูลผู้โดยสาร: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // อัปเดตผู้โดยสาร พร้อมระบุ seatId
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePassenger(
            @PathVariable String id,
            @RequestBody Passenger passenger,
            @RequestParam String seatId) {
        try {
            logger.debug("เริ่มอัปเดตผู้โดยสาร ID: {} กับ SeatID: {}", id, seatId);
            Passenger updatedPassenger = passengerService.updatePassenger(id, passenger, seatId);
            logger.debug("อัปเดตผู้โดยสารสำเร็จ: {}", updatedPassenger);
            return new ResponseEntity<>(updatedPassenger, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            logger.error("ไม่พบผู้โดยสารหรือที่นั่ง: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการอัปเดตผู้โดยสาร: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการอัปเดตผู้โดยสาร: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ลบผู้โดยสาร
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePassenger(@PathVariable String id) {
        try {
            logger.debug("เริ่มลบผู้โดยสาร ID: {}", id);
            passengerService.deletePassenger(id);
            Map<String, Boolean> response = new HashMap<>();
            response.put("deleted", Boolean.TRUE);
            logger.debug("ลบผู้โดยสารสำเร็จ ID: {}", id);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            logger.error("ไม่พบผู้โดยสารกับ ID: {}", id, e);
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการลบผู้โดยสาร: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการลบผู้โดยสาร: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ค้นหาผู้โดยสารตาม Booking ID
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<?> getPassengersByBookingId(@PathVariable String bookingId) {
        try {
            logger.debug("เรียกดูผู้โดยสารสำหรับ Booking ID: {}", bookingId);
            List<Passenger> passengers = passengerService.getPassengersByBookingId(bookingId);
            return new ResponseEntity<>(passengers, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            logger.error("ไม่พบ Booking ID: {}", bookingId, e);
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการดึงข้อมูลผู้โดยสาร: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการดึงข้อมูลผู้โดยสาร: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
