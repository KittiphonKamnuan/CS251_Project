package com.airline.booking.repository;

import com.airline.booking.model.Booking;
import com.airline.booking.model.Flight;
import com.airline.booking.model.Payment;
import com.airline.booking.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, String> {

    // เมธอดสำหรับแดชบอร์ด
    List<Booking> findTop5ByOrderByBookingIdDesc();
    
    // เมธอดสำหรับการค้นหา
    List<Booking> findByPassengers_FirstNameContainingOrPassengers_LastNameContaining(String firstName, String lastName);
    List<Booking> findByContactEmailContaining(String term);
    List<Booking> findByContactPhoneContaining(String term);
    
    // เพิ่มเมธอดสำหรับตรวจสอบการมีอยู่ (exists)
    boolean existsByContactEmailContaining(String email);
    boolean existsByContactPhoneContaining(String phone);

    // ค้นหาการจองตามผู้ใช้
    List<Booking> findByUser(User user);
    
    // ค้นหาการจองตาม userId
    List<Booking> findByUserUserId(String userId);
    
    // ค้นหาการจองตามเที่ยวบิน
    List<Booking> findByFlight(Flight flight);
    
    // ค้นหาการจองตาม flightId
    List<Booking> findByFlightFlightId(String flightId);
    
    // ค้นหาการจองตามสถานะการจอง
    List<Booking> findByBookingStatus(String bookingStatus);
    
    // ค้นหาการจองตามช่วงวันที่
    List<Booking> findByBookingDateBetween(LocalDate startDate, LocalDate endDate);
    
    // ค้นหาการจองตามผู้ใช้และสถานะการจอง
    List<Booking> findByUserUserIdAndBookingStatus(String userId, String bookingStatus);

    // ค้นหาการจองตามผู้ใช้ เที่ยวบิน และวันที่จอง
    List<Booking> findByUserUserIdAndFlightFlightIdAndBookingDateOrderByBookingIdDesc(
        String userId, String flightId, LocalDate bookingDate);    
    
    // นับจำนวนการจองตามเที่ยวบิน
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.flight.flightId = :flightId")
    Long countBookingsByFlightId(@Param("flightId") String flightId);
    
    // เพิ่มเมธอดสำหรับหาการชำระเงินที่เกี่ยวข้องกับการจอง
    @Query("SELECT p FROM Payment p WHERE p.booking = :booking")
    Optional<Payment> findPaymentByBooking(@Param("booking") Booking booking);
    
    // เพิ่มเมธอดค้นหาการจองด้วยข้อความค้นหาทั่วไป (สำหรับแทนที่ findByPassengerNameContaining)
    @Query("SELECT DISTINCT b FROM Booking b " +
           "LEFT JOIN b.passengers p " +
           "WHERE LOWER(b.bookingId) LIKE LOWER(CONCAT('%', :term, '%')) OR " +
           "LOWER(b.contactEmail) LIKE LOWER(CONCAT('%', :term, '%')) OR " +
           "LOWER(b.contactPhone) LIKE LOWER(CONCAT('%', :term, '%')) OR " +
           "LOWER(p.firstName) LIKE LOWER(CONCAT('%', :term, '%')) OR " +
           "LOWER(p.lastName) LIKE LOWER(CONCAT('%', :term, '%'))")
    List<Booking> searchBookings(@Param("term") String term);
    
    // เพิ่มเมธอดสำหรับหาการจองที่กำลังรอการยืนยัน
    List<Booking> findByBookingStatusAndBookingDateGreaterThanEqual(String status, LocalDate date);
    
    // เพิ่มเมธอดสำหรับการรายงาน
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.bookingDate BETWEEN :startDate AND :endDate")
    Long countBookingsByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT SUM(b.totalPrice) FROM Booking b WHERE b.bookingDate BETWEEN :startDate AND :endDate AND b.bookingStatus = 'Confirmed'")
    Double sumRevenueByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT b.bookingDate, COUNT(b) FROM Booking b WHERE b.bookingDate BETWEEN :startDate AND :endDate GROUP BY b.bookingDate ORDER BY b.bookingDate")
    List<Object[]> countBookingsByDate(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}