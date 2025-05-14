package com.airline.booking.repository;

import com.airline.booking.model.Booking;
import com.airline.booking.model.Passenger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PassengerRepository extends JpaRepository<Passenger, String> {
    
    // ค้นหาผู้โดยสารตามการจอง
    List<Passenger> findByBooking(Booking booking);
    
    // ค้นหาผู้โดยสารตาม bookingId
    List<Passenger> findByBookingBookingId(String bookingId);
    
    // ค้นหาผู้โดยสารตามชื่อและนามสกุล
    List<Passenger> findByFirstNameAndLastName(String firstName, String lastName);
    
    // ค้นหาผู้โดยสารตามหมายเลขพาสปอร์ต
    Passenger findByPassportNumber(String passportNumber);
    
    // ตรวจสอบว่ามีผู้โดยสารใช้หมายเลขพาสปอร์ตนี้หรือไม่
    boolean existsByPassportNumber(String passportNumber);
    
    // นับจำนวนผู้โดยสารตามการจอง
    long countByBookingBookingId(String bookingId);
}