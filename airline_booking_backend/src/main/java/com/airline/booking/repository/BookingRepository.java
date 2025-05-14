package com.airline.booking.repository;

import com.airline.booking.model.Booking;
import com.airline.booking.model.Flight;
import com.airline.booking.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, String> {
    
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
    
    // นับจำนวนการจองตามเที่ยวบิน
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.flight.flightId = :flightId")
    Long countBookingsByFlightId(@Param("flightId") String flightId);
}