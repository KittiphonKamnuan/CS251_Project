package com.airline.booking.repository;

import com.airline.booking.model.Booking;
import com.airline.booking.model.LoyaltyPoints;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LoyaltyPointsRepository extends JpaRepository<LoyaltyPoints, String> {
    
    // ค้นหาคะแนนสะสมตามการจอง
    List<LoyaltyPoints> findByBooking(Booking booking);
    
    // ค้นหาคะแนนสะสมตาม bookingId
    List<LoyaltyPoints> findByBookingBookingId(String bookingId);
    
    // ค้นหาคะแนนสะสมตาม userId
    @Query("SELECT lp FROM LoyaltyPoints lp JOIN lp.booking b JOIN b.user u WHERE u.userId = :userId")
    List<LoyaltyPoints> findByUserId(@Param("userId") String userId);
    
    // คำนวณคะแนนสะสมรวมของผู้ใช้
    @Query("SELECT SUM(lp.pointsBalance) FROM LoyaltyPoints lp JOIN lp.booking b JOIN b.user u " +
           "WHERE u.userId = :userId")
    Integer calculateTotalPointsByUserId(@Param("userId") String userId);
    
    // ค้นหาคะแนนสะสมที่กำลังจะหมดอายุ
    List<LoyaltyPoints> findByPointsExpiryDateBefore(LocalDate expiryDate);
    
    // ค้นหาคะแนนสะสมที่กำลังจะหมดอายุของผู้ใช้
    @Query("SELECT lp FROM LoyaltyPoints lp JOIN lp.booking b JOIN b.user u " +
           "WHERE u.userId = :userId AND lp.pointsExpiryDate BETWEEN :startDate AND :endDate")
    List<LoyaltyPoints> findExpiringPointsByUserId(
            @Param("userId") String userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}