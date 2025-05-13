package com.airline.booking.repository;

import com.airline.booking.model.Discount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DiscountRepository extends JpaRepository<Discount, String> {
    
    // ค้นหาส่วนลดที่ยังไม่หมดอายุ
    List<Discount> findByExpiryDateAfter(LocalDate currentDate);
    
    // ค้นหาส่วนลดตามจำนวนคะแนนที่ต้องการ
    List<Discount> findByPointRequiredLessThanEqual(Integer points);
    
    // ค้นหาส่วนลดตามจำนวนคะแนนที่ต้องการและยังไม่หมดอายุ
    @Query("SELECT d FROM Discount d WHERE d.pointRequired <= :points AND d.expiryDate > :currentDate")
    List<Discount> findAvailableDiscountsByPoints(
            @Param("points") Integer points, 
            @Param("currentDate") LocalDate currentDate);
    
    // ค้นหาส่วนลดที่ใช้ในการจองเที่ยวบิน
    @Query("SELECT d FROM Discount d JOIN d.bookings b WHERE b.bookingId = :bookingId")
    List<Discount> findDiscountsByBookingId(@Param("bookingId") String bookingId);
    
    // ค้นหาส่วนลดที่ใช้โดยผู้ใช้
    @Query("SELECT d FROM Discount d JOIN d.bookings b JOIN b.user u WHERE u.userId = :userId")
    List<Discount> findDiscountsByUserId(@Param("userId") String userId);
}