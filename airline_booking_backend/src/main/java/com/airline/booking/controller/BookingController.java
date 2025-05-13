package com.airline.booking.controller;

import com.airline.booking.model.Booking;
import com.airline.booking.service.BookingService;
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

    @Autowired
    private BookingService bookingService;

    // ดึงการจองทั้งหมด
    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings() {
        List<Booking> bookings = bookingService.getAllBookings();
        return new ResponseEntity<>(bookings, HttpStatus.OK);
    }

    // ดึงการจองตาม ID
    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable(value = "id") String bookingId) {
        Booking booking = bookingService.getBookingById(bookingId);
        return new ResponseEntity<>(booking, HttpStatus.OK);
    }

    // ค้นหาการจองตามผู้ใช้
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Booking>> getBookingsByUser(@PathVariable(value = "userId") String userId) {
        List<Booking> bookings = bookingService.getBookingsByUserId(userId);
        return new ResponseEntity<>(bookings, HttpStatus.OK);
    }

    // ค้นหาการจองตามเที่ยวบิน
    @GetMapping("/flight/{flightId}")
    public ResponseEntity<List<Booking>> getBookingsByFlight(@PathVariable(value = "flightId") String flightId) {
        List<Booking> bookings = bookingService.getBookingsByFlightId(flightId);
        return new ResponseEntity<>(bookings, HttpStatus.OK);
    }

    // ค้นหาการจองตามสถานะการจอง
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Booking>> getBookingsByStatus(@PathVariable(value = "status") String bookingStatus) {
        List<Booking> bookings = bookingService.getBookingsByStatus(bookingStatus);
        return new ResponseEntity<>(bookings, HttpStatus.OK);
    }

    // ค้นหาการจองตามช่วงวันที่
    @GetMapping("/date")
    public ResponseEntity<List<Booking>> getBookingsByDateRange(
            @RequestParam(value = "from") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(value = "to") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        List<Booking> bookings = bookingService.getBookingsByDateRange(fromDate, toDate);
        return new ResponseEntity<>(bookings, HttpStatus.OK);
    }

    // สร้างการจองใหม่
    @PostMapping
    public ResponseEntity<Booking> createBooking(
            @RequestBody Booking booking,
            @RequestParam(value = "userId") String userId,
            @RequestParam(value = "flightId") String flightId) {
        Booking newBooking = bookingService.createBooking(booking, userId, flightId);
        return new ResponseEntity<>(newBooking, HttpStatus.CREATED);
    }

    // อัปเดตข้อมูลการจอง
    @PutMapping("/{id}")
    public ResponseEntity<Booking> updateBooking(
            @PathVariable(value = "id") String bookingId,
            @RequestBody Booking bookingDetails) {
        Booking updatedBooking = bookingService.updateBooking(bookingId, bookingDetails);
        return new ResponseEntity<>(updatedBooking, HttpStatus.OK);
    }

    // อัปเดตสถานะการจอง
    @PatchMapping("/{id}/status")
    public ResponseEntity<Booking> updateBookingStatus(
            @PathVariable(value = "id") String bookingId,
            @RequestBody Map<String, String> statusUpdate) {
        String newStatus = statusUpdate.get("status");
        Booking updatedBooking = bookingService.updateBookingStatus(bookingId, newStatus);
        return new ResponseEntity<>(updatedBooking, HttpStatus.OK);
    }

    // ยกเลิกการจอง
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Booking> cancelBooking(@PathVariable(value = "id") String bookingId) {
        Booking cancelledBooking = bookingService.cancelBooking(bookingId);
        return new ResponseEntity<>(cancelledBooking, HttpStatus.OK);
    }

    // ลบการจอง
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Boolean>> deleteBooking(@PathVariable(value = "id") String bookingId) {
        bookingService.deleteBooking(bookingId);
        
        Map<String, Boolean> response = new HashMap<>();
        response.put("deleted", Boolean.TRUE);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}