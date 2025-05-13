package com.airline.booking.repository;

import com.airline.booking.model.Flight;
import com.airline.booking.model.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeatRepository extends JpaRepository<Seat, String> {
    
    // ค้นหาที่นั่งตามเที่ยวบิน
    List<Seat> findByFlight(Flight flight);
    
    // ค้นหาที่นั่งตาม flightId
    List<Seat> findByFlightFlightId(String flightId);
    
    // ค้นหาที่นั่งตามเที่ยวบินและสถานะ
    List<Seat> findByFlightAndSeatStatus(Flight flight, String seatStatus);
    
    // ค้นหาที่นั่งตาม flightId และสถานะ
    List<Seat> findByFlightFlightIdAndSeatStatus(String flightId, String seatStatus);
    
    // ค้นหาที่นั่งตามชั้นโดยสาร
    List<Seat> findBySeatClass(String seatClass);
    
    // ค้นหาที่นั่งตามเที่ยวบินและชั้นโดยสาร
    List<Seat> findByFlightFlightIdAndSeatClass(String flightId, String seatClass);
    
    // ค้นหาที่นั่งตามหมายเลขที่นั่งและเที่ยวบิน
    Seat findByFlightFlightIdAndSeatNumber(String flightId, String seatNumber);
    
    // นับจำนวนที่นั่งที่ว่างตามเที่ยวบิน
    @Query("SELECT COUNT(s) FROM Seat s WHERE s.flight.flightId = :flightId AND s.seatStatus = 'Available'")
    Long countAvailableSeatsByFlightId(@Param("flightId") String flightId);
    
    // นับจำนวนที่นั่งที่ว่างตามเที่ยวบินและชั้นโดยสาร
    @Query("SELECT COUNT(s) FROM Seat s WHERE s.flight.flightId = :flightId " +
           "AND s.seatClass = :seatClass AND s.seatStatus = 'Available'")
    Long countAvailableSeatsByFlightIdAndClass(
            @Param("flightId") String flightId, 
            @Param("seatClass") String seatClass);
}