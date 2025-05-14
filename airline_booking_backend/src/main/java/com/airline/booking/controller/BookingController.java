package com.airline.booking.controller;

import com.airline.booking.model.Booking;
import com.airline.booking.model.Passenger;
import com.airline.booking.service.BookingService;
import com.airline.booking.exception.ResourceNotFoundException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    private static final Logger logger = LoggerFactory.getLogger(BookingController.class);

    @Autowired
    private BookingService bookingService;

    // ดึงการจองทั้งหมด
    @GetMapping
    public ResponseEntity<?> getAllBookings() {
        try {
            logger.debug("เริ่มการดึงข้อมูลการจองทั้งหมด");
            List<Booking> bookings = bookingService.getAllBookings();
            logger.debug("ดึงข้อมูลการจองทั้งหมดสำเร็จ จำนวน: {}", bookings.size());
            return new ResponseEntity<>(bookings, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการดึงข้อมูลการจองทั้งหมด: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการดึงข้อมูลการจอง: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ดึงการจองตาม ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getBookingById(@PathVariable(value = "id") String bookingId) {
        try {
            logger.debug("เริ่มการดึงข้อมูลการจองตาม ID: {}", bookingId);
            Booking booking = bookingService.getBookingById(bookingId);
            logger.debug("ดึงข้อมูลการจองสำเร็จ: {}", booking);
            return new ResponseEntity<>(booking, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            logger.error("ไม่พบการจองกับ ID: {}", bookingId, e);
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการดึงข้อมูลการจอง: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการดึงข้อมูลการจอง: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ค้นหาการจองตามผู้ใช้
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getBookingsByUser(@PathVariable(value = "userId") String userId) {
        try {
            logger.debug("เริ่มการดึงข้อมูลการจองตามผู้ใช้ ID: {}", userId);
            List<Booking> bookings = bookingService.getBookingsByUserId(userId);
            logger.debug("ดึงข้อมูลการจองตามผู้ใช้สำเร็จ จำนวน: {}", bookings.size());
            return new ResponseEntity<>(bookings, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการดึงข้อมูลการจองตามผู้ใช้: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการดึงข้อมูลการจองตามผู้ใช้: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ค้นหาการจองตามเที่ยวบิน
    @GetMapping("/flight/{flightId}")
    public ResponseEntity<?> getBookingsByFlight(@PathVariable(value = "flightId") String flightId) {
        try {
            logger.debug("เริ่มการดึงข้อมูลการจองตามเที่ยวบิน ID: {}", flightId);
            List<Booking> bookings = bookingService.getBookingsByFlightId(flightId);
            logger.debug("ดึงข้อมูลการจองตามเที่ยวบินสำเร็จ จำนวน: {}", bookings.size());
            return new ResponseEntity<>(bookings, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการดึงข้อมูลการจองตามเที่ยวบิน: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการดึงข้อมูลการจองตามเที่ยวบิน: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ค้นหาการจองตามสถานะการจอง
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getBookingsByStatus(@PathVariable(value = "status") String bookingStatus) {
        try {
            logger.debug("เริ่มการดึงข้อมูลการจองตามสถานะ: {}", bookingStatus);
            List<Booking> bookings = bookingService.getBookingsByStatus(bookingStatus);
            logger.debug("ดึงข้อมูลการจองตามสถานะสำเร็จ จำนวน: {}", bookings.size());
            return new ResponseEntity<>(bookings, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการดึงข้อมูลการจองตามสถานะ: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการดึงข้อมูลการจองตามสถานะ: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ค้นหาการจองตามช่วงวันที่
    @GetMapping("/date")
    public ResponseEntity<?> getBookingsByDateRange(
            @RequestParam(value = "from") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(value = "to") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        try {
            logger.debug("เริ่มการดึงข้อมูลการจองตามช่วงวันที่: {} ถึง {}", fromDate, toDate);
            List<Booking> bookings = bookingService.getBookingsByDateRange(fromDate, toDate);
            logger.debug("ดึงข้อมูลการจองตามช่วงวันที่สำเร็จ จำนวน: {}", bookings.size());
            return new ResponseEntity<>(bookings, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการดึงข้อมูลการจองตามช่วงวันที่: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการดึงข้อมูลการจองตามช่วงวันที่: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // สร้างการจองใหม่
    @PostMapping
    public ResponseEntity<?> createBooking(
            @RequestBody Booking booking,
            @RequestParam(value = "userId") String userId,
            @RequestParam(value = "flightId") String flightId) {
        try {
            // Log the incoming request for debugging
            logger.info("กำลังสร้างการจองใหม่สำหรับผู้ใช้: {} และเที่ยวบิน: {}", userId, flightId);
            logger.debug("ข้อมูลการจอง: {}", booking);
            
            // Validate required data
            if (booking == null) {
                logger.error("ข้อมูลการจองเป็น null");
                Map<String, String> error = new HashMap<>();
                error.put("message", "ข้อมูลการจองไม่ถูกต้อง");
                return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
            }
            
            // Check for passenger information
            if (booking.getPassengers() == null || booking.getPassengers().isEmpty()) {
                logger.warn("ไม่มีข้อมูลผู้โดยสารในการจอง");
                // Could still be valid in some cases, so just log a warning
            } else {
                logger.debug("จำนวนผู้โดยสาร: {}", booking.getPassengers().size());
            }
            
            // Create the booking
            Booking newBooking = bookingService.createBooking(booking, userId, flightId);
            
            logger.info("สร้างการจองสำเร็จ รหัสการจอง: {}", newBooking.getBookingId());
            return new ResponseEntity<>(newBooking, HttpStatus.CREATED);
        } catch (ResourceNotFoundException e) {
            // Handle case where user or flight doesn't exist
            logger.error("ไม่พบข้อมูลที่ต้องการสำหรับการสร้างการจอง: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            // Handle any other exceptions
            logger.error("เกิดข้อผิดพลาดในการสร้างการจอง: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการสร้างการจอง: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // อัปเดตข้อมูลการจอง
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBooking(
            @PathVariable(value = "id") String bookingId,
            @RequestBody Booking bookingDetails) {
        try {
            logger.debug("เริ่มการอัปเดตข้อมูลการจอง ID: {}", bookingId);
            Booking updatedBooking = bookingService.updateBooking(bookingId, bookingDetails);
            logger.debug("อัปเดตข้อมูลการจองสำเร็จ: {}", updatedBooking);
            return new ResponseEntity<>(updatedBooking, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            logger.error("ไม่พบการจองกับ ID: {}", bookingId, e);
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการอัปเดตข้อมูลการจอง: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการอัปเดตข้อมูลการจอง: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // อัปเดตสถานะการจอง
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateBookingStatus(
            @PathVariable(value = "id") String bookingId,
            @RequestBody Map<String, String> statusUpdate) {
        try {
            String newStatus = statusUpdate.get("status");
            if (newStatus == null || newStatus.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "ต้องระบุสถานะใหม่");
                return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
            }
            
            logger.debug("เริ่มการอัปเดตสถานะการจอง ID: {} เป็น: {}", bookingId, newStatus);
            Booking updatedBooking = bookingService.updateBookingStatus(bookingId, newStatus);
            logger.debug("อัปเดตสถานะการจองสำเร็จ: {}", updatedBooking);
            return new ResponseEntity<>(updatedBooking, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            logger.error("ไม่พบการจองกับ ID: {}", bookingId, e);
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการอัปเดตสถานะการจอง: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการอัปเดตสถานะการจอง: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ยกเลิกการจอง
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable(value = "id") String bookingId) {
        try {
            logger.debug("เริ่มการยกเลิกการจอง ID: {}", bookingId);
            Booking cancelledBooking = bookingService.cancelBooking(bookingId);
            logger.debug("ยกเลิกการจองสำเร็จ: {}", cancelledBooking);
            return new ResponseEntity<>(cancelledBooking, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            logger.error("ไม่พบการจองกับ ID: {}", bookingId, e);
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการยกเลิกการจอง: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการยกเลิกการจอง: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ลบการจอง
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBooking(@PathVariable(value = "id") String bookingId) {
        try {
            logger.debug("เริ่มการลบการจอง ID: {}", bookingId);
            bookingService.deleteBooking(bookingId);
            logger.debug("ลบการจองสำเร็จ ID: {}", bookingId);
            
            Map<String, Boolean> response = new HashMap<>();
            response.put("deleted", Boolean.TRUE);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            logger.error("ไม่พบการจองกับ ID: {}", bookingId, e);
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการลบการจอง: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการลบการจอง: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // เพิ่มผู้โดยสารในการจอง
    @PostMapping("/{id}/passengers")
    public ResponseEntity<?> addPassengerToBooking(
            @PathVariable(value = "id") String bookingId,
            @RequestBody Passenger passenger) {
        try {
            logger.debug("เริ่มการเพิ่มผู้โดยสารในการจอง ID: {}", bookingId);
            Booking updatedBooking = bookingService.addPassengerToBooking(bookingId, passenger);
            logger.debug("เพิ่มผู้โดยสารในการจองสำเร็จ: {}", updatedBooking);
            return new ResponseEntity<>(updatedBooking, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            logger.error("ไม่พบการจองกับ ID: {}", bookingId, e);
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการเพิ่มผู้โดยสาร: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการเพิ่มผู้โดยสาร: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // ลบผู้โดยสารจากการจอง
    @DeleteMapping("/{bookingId}/passengers/{passengerId}")
    public ResponseEntity<?> removePassengerFromBooking(
            @PathVariable(value = "bookingId") String bookingId,
            @PathVariable(value = "passengerId") String passengerId) {
        try {
            logger.debug("เริ่มการลบผู้โดยสารจากการจอง bookingId: {}, passengerId: {}", bookingId, passengerId);
            Booking updatedBooking = bookingService.removePassengerFromBooking(bookingId, passengerId);
            logger.debug("ลบผู้โดยสารจากการจองสำเร็จ: {}", updatedBooking);
            return new ResponseEntity<>(updatedBooking, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            logger.error("ไม่พบการจองหรือผู้โดยสาร: {}", e.getMessage(), e);
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
    
    // เพิ่มส่วนลดในการจอง
    @PostMapping("/{bookingId}/discounts/{discountId}")
    public ResponseEntity<?> applyDiscountToBooking(
            @PathVariable(value = "bookingId") String bookingId,
            @PathVariable(value = "discountId") String discountId) {
        try {
            logger.debug("เริ่มการเพิ่มส่วนลดในการจอง bookingId: {}, discountId: {}", bookingId, discountId);
            Booking updatedBooking = bookingService.applyDiscountToBooking(bookingId, discountId);
            logger.debug("เพิ่มส่วนลดในการจองสำเร็จ: {}", updatedBooking);
            return new ResponseEntity<>(updatedBooking, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            logger.error("ไม่พบการจองหรือส่วนลด: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการเพิ่มส่วนลด: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการเพิ่มส่วนลด: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // ดึงผู้โดยสารในการจอง
    @GetMapping("/{id}/passengers")
    public ResponseEntity<?> getBookingPassengers(@PathVariable(value = "id") String bookingId) {
        try {
            logger.debug("เริ่มการดึงข้อมูลผู้โดยสารในการจอง ID: {}", bookingId);
            List<Passenger> passengers = bookingService.getBookingPassengers(bookingId);
            logger.debug("ดึงข้อมูลผู้โดยสารในการจองสำเร็จ จำนวน: {}", passengers.size());
            return new ResponseEntity<>(passengers, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            logger.error("ไม่พบการจองกับ ID: {}", bookingId, e);
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
    
    // ตรวจสอบสถานะการชำระเงิน
    @GetMapping("/{id}/payment-status")
    public ResponseEntity<?> getBookingPaymentStatus(@PathVariable(value = "id") String bookingId) {
        try {
            logger.debug("เริ่มการตรวจสอบสถานะการชำระเงินของการจอง ID: {}", bookingId);
            Map<String, Object> paymentStatus = bookingService.getBookingPaymentStatus(bookingId);
            logger.debug("ตรวจสอบสถานะการชำระเงินสำเร็จ: {}", paymentStatus);
            return new ResponseEntity<>(paymentStatus, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            logger.error("ไม่พบการจองกับ ID: {}", bookingId, e);
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการตรวจสอบสถานะการชำระเงิน: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการตรวจสอบสถานะการชำระเงิน: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}