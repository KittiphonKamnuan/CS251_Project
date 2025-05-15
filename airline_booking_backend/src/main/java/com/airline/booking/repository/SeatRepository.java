package com.airline.booking.repository;

import com.airline.booking.model.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeatRepository extends JpaRepository<Seat, String> {
    
    // ใช้ JPQL query แทนการใช้ method naming เพราะเราต้องการค้นหาตาม flight.flightId
    @Query("SELECT s FROM Seat s WHERE s.flight.flightId = :flightId")
    List<Seat> findByFlightId(@Param("flightId") String flightId);
    
    @Query("SELECT s FROM Seat s WHERE s.flight.flightId = :flightId AND s.seatStatus = :status")
    List<Seat> findByFlightIdAndSeatStatus(@Param("flightId") String flightId, @Param("status") String status);
    
    @Query("SELECT s FROM Seat s WHERE s.flight.flightId = :flightId AND s.seatClass = :seatClass")
    List<Seat> findByFlightIdAndSeatClass(@Param("flightId") String flightId, @Param("seatClass") String seatClass);
}