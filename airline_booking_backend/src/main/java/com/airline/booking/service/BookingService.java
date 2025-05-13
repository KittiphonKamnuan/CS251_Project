package com.airline.booking.service;

import com.airline.booking.exception.ResourceNotFoundException;
import com.airline.booking.model.Booking;
import com.airline.booking.model.Flight;
import com.airline.booking.model.User;
import com.airline.booking.repository.BookingRepository;
import com.airline.booking.repository.FlightRepository;
import com.airline.booking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Random;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private FlightRepository flightRepository;

    // ดึงการจองทั้งหมด
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    // ดึงการจองตาม ID
    public Booking getBookingById(String bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("ไม่พบการจองกับรหัส: " + bookingId));
    }

    // ค้นหาการจองตามผู้ใช้
    public List<Booking> getBookingsByUserId(String userId) {
        return bookingRepository.findByUserUserId(userId);
    }

    // ค้นหาการจองตามเที่ยวบิน
    public List<Booking> getBookingsByFlightId(String flightId) {
        return bookingRepository.findByFlightFlightId(flightId);
    }

    // ค้นหาการจองตามสถานะการจอง
    public List<Booking> getBookingsByStatus(String bookingStatus) {
        return bookingRepository.findByBookingStatus(bookingStatus);
    }

    // ค้นหาการจองตามช่วงวันที่
    public List<Booking> getBookingsByDateRange(LocalDate startDate, LocalDate endDate) {
        return bookingRepository.findByBookingDateBetween(startDate, endDate);
    }

    // สร้างการจองใหม่
    public Booking createBooking(Booking booking, String userId, String flightId) {
        // ดึงข้อมูลผู้ใช้
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("ไม่พบผู้ใช้กับรหัส: " + userId));
        
        // ดึงข้อมูลเที่ยวบิน
        Flight flight = flightRepository.findById(flightId)
                .orElseThrow(() -> new ResourceNotFoundException("ไม่พบเที่ยวบินกับรหัส: " + flightId));
        
        // ตรวจสอบว่ามี ID แล้วหรือยัง
        if (booking.getBookingId() == null || booking.getBookingId().isEmpty()) {
            // สร้าง ID ใหม่
            booking.setBookingId(generateBookingId());
        }
        
        // ตั้งค่า User และ Flight
        booking.setUser(user);
        booking.setFlight(flight);
        
        // ตั้งค่าวันที่จองหากยังไม่ได้ตั้ง
        if (booking.getBookingDate() == null) {
            booking.setBookingDate(LocalDate.now());
        }
        
        // ตั้งค่าสถานะการจองหากยังไม่ได้ตั้ง
        if (booking.getBookingStatus() == null || booking.getBookingStatus().isEmpty()) {
            booking.setBookingStatus("Pending");
        }
        
        return bookingRepository.save(booking);
    }

    // อัปเดตข้อมูลการจอง
    public Booking updateBooking(String bookingId, Booking bookingDetails) {
        Booking booking = getBookingById(bookingId);
        
        // อัปเดตข้อมูล
        if (bookingDetails.getBookingStatus() != null) {
            booking.setBookingStatus(bookingDetails.getBookingStatus());
        }
        
        if (bookingDetails.getTotalPrice() != null) {
            booking.setTotalPrice(bookingDetails.getTotalPrice());
        }
        
        return bookingRepository.save(booking);
    }

    // อัปเดตสถานะการจอง
    public Booking updateBookingStatus(String bookingId, String newStatus) {
        Booking booking = getBookingById(bookingId);
        booking.setBookingStatus(newStatus);
        return bookingRepository.save(booking);
    }

    // ยกเลิกการจอง
    public Booking cancelBooking(String bookingId) {
        Booking booking = getBookingById(bookingId);
        booking.setBookingStatus("Cancelled");
        return bookingRepository.save(booking);
    }

    // ลบการจอง
    public void deleteBooking(String bookingId) {
        Booking booking = getBookingById(bookingId);
        bookingRepository.delete(booking);
    }

    // สร้าง ID สำหรับการจองใหม่
    private String generateBookingId() {
        // สร้าง prefix
        String prefix = "BK";
        
        // สร้างเลขสุ่ม 5 หลัก
        Random random = new Random();
        int number = 10000 + random.nextInt(90000);
        
        // รวมกันเป็น ID
        return prefix + number;
    }
}