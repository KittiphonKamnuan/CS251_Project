package com.airline.booking.service;

import com.airline.booking.model.Booking;
import com.airline.booking.model.Discount;
import com.airline.booking.model.Flight;
import com.airline.booking.model.Passenger;
import com.airline.booking.model.Payment;
import com.airline.booking.model.Seat;
import com.airline.booking.model.User;
import com.airline.booking.repository.BookingRepository;
import com.airline.booking.repository.DiscountRepository;
import com.airline.booking.repository.FlightRepository;
import com.airline.booking.repository.PassengerRepository;
import com.airline.booking.repository.PaymentRepository;
import com.airline.booking.repository.SeatRepository;
import com.airline.booking.repository.UserRepository;
import com.airline.booking.exception.ResourceNotFoundException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Service
public class BookingService {

    private static final Logger logger = LoggerFactory.getLogger(BookingService.class);

    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private FlightRepository flightRepository;
    
    @Autowired
    private PassengerRepository passengerRepository;
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private DiscountRepository discountRepository;

    @Autowired
    private SeatRepository seatRepository;  // เพิ่ม SeatRepository เพื่อใช้งาน

    // ดึงข้อมูลการจองทั้งหมด
    public List<Booking> getAllBookings() {
        logger.debug("เรียกดูการจองทั้งหมด");
        return bookingRepository.findAll();
    }
    
    // ดึงข้อมูลการจองตาม ID
    public Booking getBookingById(String bookingId) {
        logger.debug("เรียกดูการจองด้วย ID: {}", bookingId);
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("ไม่พบการจองด้วย ID: " + bookingId));
    }
    
    // ดึงข้อมูลการจองตามผู้ใช้
    public List<Booking> getBookingsByUserId(String userId) {
        logger.debug("เรียกดูการจองตามผู้ใช้ ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("ไม่พบผู้ใช้ด้วย ID: " + userId));
        return bookingRepository.findByUser(user);
    }
    
    // ดึงข้อมูลการจองตามเที่ยวบิน
    public List<Booking> getBookingsByFlightId(String flightId) {
        logger.debug("เรียกดูการจองตามเที่ยวบิน ID: {}", flightId);
        Flight flight = flightRepository.findById(flightId)
                .orElseThrow(() -> new ResourceNotFoundException("ไม่พบเที่ยวบินด้วย ID: " + flightId));
        List<Booking> bookings = bookingRepository.findByFlight(flight);
        if (bookings.isEmpty()) {
            logger.warn("ไม่พบการจองสำหรับเที่ยวบิน ID: {}", flightId);
            throw new ResourceNotFoundException("ไม่พบการจองสำหรับเที่ยวบิน ID: " + flightId);
        }
        return bookings;
    }
    
    // ดึงข้อมูลการจองตามสถานะ
    public List<Booking> getBookingsByStatus(String bookingStatus) {
        logger.debug("เรียกดูการจองตามสถานะ: {}", bookingStatus);
        List<Booking> bookings = bookingRepository.findByBookingStatus(bookingStatus);
        if (bookings.isEmpty()) {
            logger.warn("ไม่พบการจองด้วยสถานะ: {}", bookingStatus);
        }
        return bookings;
    }
    
    // ดึงข้อมูลการจองตามช่วงวันที่
    public List<Booking> getBookingsByDateRange(LocalDate fromDate, LocalDate toDate) {
        logger.debug("เรียกดูการจองตามช่วงวันที่: {} ถึง {}", fromDate, toDate);
        List<Booking> bookings = bookingRepository.findByBookingDateBetween(fromDate, toDate);
        if (bookings.isEmpty()) {
            logger.warn("ไม่พบการจองในช่วงวันที่: {} ถึง {}", fromDate, toDate);
        }
        return bookings;
    }
    
    // สร้างการจองใหม่ พร้อมอัปเดตสถานะที่นั่ง
    @Transactional
    public Booking createBooking(Booking booking, String userId, String flightId) {
        logger.debug("สร้างการจองใหม่ด้วย userId: {} และ flightId: {}", userId, flightId);
        
        if (userId == null || userId.isEmpty()) {
            throw new IllegalArgumentException("ต้องระบุ userId");
        }
        
        if (flightId == null || flightId.isEmpty()) {
            throw new IllegalArgumentException("ต้องระบุ flightId");
        }
        
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("ไม่พบผู้ใช้ด้วย ID: " + userId));
            
            Flight flight = flightRepository.findById(flightId)
                    .orElseThrow(() -> new ResourceNotFoundException("ไม่พบเที่ยวบินด้วย ID: " + flightId));
            
            booking.setUser(user);
            booking.setFlight(flight);
            
            if (booking.getBookingId() == null || booking.getBookingId().isEmpty()) {
                booking.setBookingId("BK" + generateUniqueId());
            }
            
            if (booking.getBookingDate() == null) {
                booking.setBookingDate(LocalDate.now());
            }
            
            if (booking.getBookingStatus() == null || booking.getBookingStatus().isEmpty()) {
                booking.setBookingStatus("Pending");
            }
            
            // *** ตัวอย่างการอัปเดตสถานะที่นั่ง (สมมติ Booking มีความสัมพันธ์กับ Seat) ***
            if (booking.getPassengers() != null) {
                for (Passenger passenger : booking.getPassengers()) {
                    Seat seat = passenger.getSeat();  // สมมติ Passenger มี getSeat()
                    if (seat != null) {
                        Seat managedSeat = seatRepository.findById(seat.getSeatId())
                                .orElseThrow(() -> new ResourceNotFoundException("ไม่พบที่นั่งด้วย ID: " + seat.getSeatId()));
                        if ("Available".equals(managedSeat.getSeatStatus())) {
                            managedSeat.setSeatStatus("Booked");
                            seatRepository.save(managedSeat);
                        } else {
                            throw new IllegalStateException("ที่นั่ง " + managedSeat.getSeatNumber() + " ถูกจองแล้ว");
                        }
                    }
                }
            }
            
            Booking savedBooking = bookingRepository.save(booking);
            logger.debug("สร้างการจองสำเร็จ: {}", savedBooking);
            return savedBooking;
            
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการสร้างการจอง: {}", e.getMessage(), e);
            throw e;
        }
    }

    // อัปเดตข้อมูลการจอง
    @Transactional
    public Booking updateBooking(String bookingId, Booking bookingDetails) {
        logger.debug("อัปเดตการจอง ID: {}", bookingId);
        Booking booking = getBookingById(bookingId);
        
        if (bookingDetails.getUserId() != null) {
            User user = userRepository.findById(bookingDetails.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("ไม่พบผู้ใช้ด้วย ID: " + bookingDetails.getUserId()));
            booking.setUser(user);
        }
        
        if (bookingDetails.getFlightId() != null) {
            Flight flight = flightRepository.findById(bookingDetails.getFlightId())
                    .orElseThrow(() -> new ResourceNotFoundException("ไม่พบเที่ยวบินด้วย ID: " + bookingDetails.getFlightId()));
            booking.setFlight(flight);
        }
        
        if (bookingDetails.getBookingDate() != null) {
            booking.setBookingDate(bookingDetails.getBookingDate());
        }
        
        if (bookingDetails.getBookingStatus() != null) {
            booking.setBookingStatus(bookingDetails.getBookingStatus());
        }
        
        if (bookingDetails.getTotalPrice() != null) {
            booking.setTotalPrice(bookingDetails.getTotalPrice());
        }
        
        if (bookingDetails.getContactEmail() != null) {
            booking.setContactEmail(bookingDetails.getContactEmail());
        }
        
        if (bookingDetails.getContactPhone() != null) {
            booking.setContactPhone(bookingDetails.getContactPhone());
        }
        
        if (bookingDetails.getPassengers() != null && !bookingDetails.getPassengers().isEmpty()) {
            booking.getPassengers().clear();
            for (Passenger passenger : bookingDetails.getPassengers()) {
                passenger.setBooking(booking);
                booking.addPassenger(passenger);
            }
        }
        
        logger.debug("การจองหลังอัปเดต: {}", booking);
        return bookingRepository.save(booking);
    }
    
    // อัปเดตสถานะการจอง
    @Transactional
    public Booking updateBookingStatus(String bookingId, String status) {
        logger.debug("อัปเดตสถานะการจอง ID: {} เป็น: {}", bookingId, status);
        Booking booking = getBookingById(bookingId);
        
        if (!status.equals("Pending") && !status.equals("Confirmed") && !status.equals("Cancelled")) {
            logger.warn("สถานะการจองไม่ถูกต้อง: {}", status);
            throw new IllegalArgumentException("สถานะการจองไม่ถูกต้อง: " + status);
        }
        
        booking.setBookingStatus(status);
        logger.debug("การจองหลังอัปเดตสถานะ: {}", booking);
        return bookingRepository.save(booking);
    }
    
    // ยกเลิกการจอง
    @Transactional
    public Booking cancelBooking(String bookingId) {
        logger.debug("ยกเลิกการจอง ID: {}", bookingId);
        Booking booking = getBookingById(bookingId);
        
        if ("Cancelled".equals(booking.getBookingStatus())) {
            throw new IllegalStateException("การจองนี้ถูกยกเลิกไปแล้ว");
        }
        
        booking.setBookingStatus("Cancelled");
        return bookingRepository.save(booking);
    }
    
    // ลบการจอง
    @Transactional
    public void deleteBooking(String bookingId) {
        logger.debug("ลบการจอง ID: {}", bookingId);
        Booking booking = getBookingById(bookingId);
        bookingRepository.delete(booking);
        logger.debug("ลบการจองสำเร็จ ID: {}", bookingId);
    }
    
    // เพิ่มผู้โดยสารในการจอง
    @Transactional
    public Booking addPassengerToBooking(String bookingId, Passenger passenger) {
        logger.debug("เพิ่มผู้โดยสารในการจอง ID: {}", bookingId);
        Booking booking = getBookingById(bookingId);
        
        if (passenger.getPassengerId() == null || passenger.getPassengerId().isEmpty()) {
            passenger.setPassengerId("P" + generateUniqueId());
        }
        
        passenger.setBooking(booking);
        booking.addPassenger(passenger);
        
        return bookingRepository.save(booking);
    }
    
    // ลบผู้โดยสารจากการจอง
    @Transactional
    public Booking removePassengerFromBooking(String bookingId, String passengerId) {
        logger.debug("ลบผู้โดยสารจากการจอง bookingId: {}, passengerId: {}", bookingId, passengerId);
        Booking booking = getBookingById(bookingId);
        
        if (booking.getPassengers() == null || booking.getPassengers().isEmpty()) {
            throw new ResourceNotFoundException("ไม่พบข้อมูลผู้โดยสารในการจอง");
        }
        
        Passenger passengerToRemove = null;
        for (Passenger p : booking.getPassengers()) {
            if (p.getPassengerId().equals(passengerId)) {
                passengerToRemove = p;
                break;
            }
        }
        
        if (passengerToRemove == null) {
            throw new ResourceNotFoundException("ไม่พบผู้โดยสารด้วย ID: " + passengerId + " ในการจอง");
        }
        
        booking.removePassenger(passengerToRemove);
        return bookingRepository.save(booking);
    }
    
    // เพิ่มส่วนลดในการจอง
    @Transactional
    public Booking applyDiscountToBooking(String bookingId, String discountId) {
        logger.debug("เพิ่มส่วนลดในการจอง bookingId: {}, discountId: {}", bookingId, discountId);
        Booking booking = getBookingById(bookingId);
        
        Discount discount = discountRepository.findById(discountId)
                .orElseThrow(() -> new ResourceNotFoundException("ไม่พบส่วนลดด้วย ID: " + discountId));
        
        BigDecimal originalPrice = booking.getTotalPrice();
        BigDecimal discountValue = discount.getDiscountValue();
        
        BigDecimal newPrice = originalPrice.subtract(discountValue);
        if (newPrice.compareTo(BigDecimal.ZERO) < 0) {
            newPrice = BigDecimal.ZERO;
        }
        
        booking.setTotalPrice(newPrice);
        booking.getDiscounts().add(discount);
        
        return bookingRepository.save(booking);
    }
    
    // ดึงข้อมูลผู้โดยสารในการจอง
    public List<Passenger> getBookingPassengers(String bookingId) {
        logger.debug("ดึงข้อมูลผู้โดยสารในการจอง ID: {}", bookingId);
        Booking booking = getBookingById(bookingId);
        
        if (booking.getPassengers() == null || booking.getPassengers().isEmpty()) {
            logger.warn("ไม่พบข้อมูลผู้โดยสารในการจอง ID: {}", bookingId);
            return new ArrayList<>();
        }
        
        return new ArrayList<>(booking.getPassengers());
    }

    // ค้นหาการจองล่าสุดโดยผู้ใช้และเที่ยวบิน
    public List<Booking> findRecentBookings(String userId, String flightId, LocalDate bookingDate) {
        return bookingRepository.findByUserUserIdAndFlightFlightIdAndBookingDateOrderByBookingIdDesc(
            userId, flightId, bookingDate);
    }    
    
    // ตรวจสอบสถานะการชำระเงิน
    public Map<String, Object> getBookingPaymentStatus(String bookingId) {
        logger.debug("ตรวจสอบสถานะการชำระเงินของการจอง ID: {}", bookingId);
        Booking booking = getBookingById(bookingId);
        
        Map<String, Object> result = new HashMap<>();
        result.put("bookingId", bookingId);
        result.put("totalPrice", booking.getTotalPrice());
        result.put("bookingStatus", booking.getBookingStatus());
        
        List<Payment> payments = new ArrayList<>();
        if (booking.getPayment() != null) {
            payments.add(booking.getPayment());
        } else {
            try {
                Optional<Payment> paymentOptional = paymentRepository.findByBooking(booking);
                if (paymentOptional.isPresent()) {
                    payments.add(paymentOptional.get());
                }
            } catch (Exception e) {
                logger.error("เกิดข้อผิดพลาดในการดึงข้อมูลการชำระเงิน: {}", e.getMessage());
            }
        }
        
        if (payments.isEmpty()) {
            result.put("isPaid", false);
            result.put("payments", new ArrayList<>());
        } else {
            BigDecimal totalPaid = BigDecimal.ZERO;
            for (Payment payment : payments) {
                if ("Completed".equals(payment.getPaymentStatus())) {
                    totalPaid = totalPaid.add(payment.getAmount());
                }
            }
            
            boolean isPaid = totalPaid.compareTo(booking.getTotalPrice()) >= 0;
            result.put("isPaid", isPaid);
            result.put("totalPaid", totalPaid);
            result.put("payments", payments);
        }
        
        return result;
    }
    
    // คำนวณราคารวมของการจอง
    public BigDecimal calculateTotalPrice(String bookingId) {
        logger.debug("คำนวณราคารวมสำหรับการจอง ID: {}", bookingId);
        Booking booking = getBookingById(bookingId);
        return booking.getTotalPrice();
    }
    
    // สร้างรหัสที่ไม่ซ้ำกัน
    private String generateUniqueId() {
        return UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
