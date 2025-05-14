package com.airline.booking.repository;

import com.airline.booking.model.Booking;
import com.airline.booking.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, String> {
    
    // ค้นหาการชำระเงินตามการจอง
    Optional<Payment> findByBooking(Booking booking);
    
    // ค้นหาการชำระเงินตาม bookingId
    Optional<Payment> findByBookingBookingId(String bookingId);
    
    // ค้นหาการชำระเงินตามสถานะการชำระเงิน
    List<Payment> findByPaymentStatus(String paymentStatus);
    
    // ค้นหาการชำระเงินตามวันที่ชำระเงิน
    List<Payment> findByPaymentDate(LocalDate paymentDate);
    
    // ค้นหาการชำระเงินตามช่วงวันที่
    List<Payment> findByPaymentDateBetween(LocalDate startDate, LocalDate endDate);
    
    // คำนวณยอดรวมการชำระเงินตามช่วงวันที่
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.paymentDate BETWEEN :startDate AND :endDate")
    BigDecimal calculateTotalAmountByDateRange(
            @Param("startDate") LocalDate startDate, 
            @Param("endDate") LocalDate endDate);
    
    // คำนวณยอดรวมการชำระเงินตามช่วงวันที่และสถานะการชำระเงิน
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.paymentDate BETWEEN :startDate AND :endDate " +
           "AND p.paymentStatus = :status")
    BigDecimal calculateTotalAmountByDateRangeAndStatus(
            @Param("startDate") LocalDate startDate, 
            @Param("endDate") LocalDate endDate,
            @Param("status") String status);
    
    // ค้นหาการชำระเงินตามวิธีการชำระเงิน (บัตรเครดิต)
    List<Payment> findByCreditCardIsNotNull();
    
    // ค้นหาการชำระเงินตามวิธีการชำระเงิน (บัตรเดบิต)
    List<Payment> findByDebitCardIsNotNull();
    
    // ค้นหาการชำระเงินตามวิธีการชำระเงิน (โอนเงินผ่านธนาคาร)
    List<Payment> findByBankTransferIsNotNull();
    
    // ค้นหาการชำระเงินตามวิธีการชำระเงิน (เงินสด)
    List<Payment> findByCashIsTrue();
}