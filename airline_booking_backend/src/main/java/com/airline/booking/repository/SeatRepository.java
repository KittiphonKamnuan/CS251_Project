package com.airline.booking.repository;

import com.airline.booking.model.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;  // เพิ่ม import นี้

@Repository
public interface SeatRepository extends JpaRepository<Seat, String> {
    
    // ดึงที่นั่งทั้งหมดตาม flightId
    @Query("SELECT s FROM Seat s WHERE s.flight.flightId = :flightId")
    List<Seat> findByFlightId(@Param("flightId") String flightId);
    
    // ดึงที่นั่งตาม flightId และสถานะที่นั่ง เช่น "Available"
    @Query("SELECT s FROM Seat s WHERE s.flight.flightId = :flightId AND s.seatStatus = :status")
    List<Seat> findByFlightIdAndSeatStatus(@Param("flightId") String flightId, @Param("status") String status);
    
    // ดึงที่นั่งตาม flightId และชั้นโดยสาร เช่น "Business", "Economy"
    @Query("SELECT s FROM Seat s WHERE s.flight.flightId = :flightId AND s.seatClass = :seatClass")
    List<Seat> findByFlightIdAndSeatClass(@Param("flightId") String flightId, @Param("seatClass") String seatClass);

    // เพิ่ม method ดึงที่นั่งตาม seatNumber
    Optional<Seat> findBySeatNumber(String seatNumber);
}
