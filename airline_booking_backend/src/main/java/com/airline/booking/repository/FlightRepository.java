package com.airline.booking.repository;

import com.airline.booking.model.Flight;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FlightRepository extends JpaRepository<Flight, String> {
    
    // ค้นหาเที่ยวบินตามรหัสเที่ยวบิน
    Flight findByFlightNumber(String flightNumber);
    
    // ค้นหาเที่ยวบินตามเมืองต้นทางและปลายทาง
    List<Flight> findByDepartureCityAndArrivalCity(String departureCity, String arrivalCity);
    
    // ค้นหาเที่ยวบินตามเมืองต้นทาง ปลายทาง และช่วงเวลาเดินทาง
    @Query("SELECT f FROM Flight f WHERE f.departureCity = :departureCity " +
           "AND f.arrivalCity = :arrivalCity " +
           "AND f.departureTime BETWEEN :startDate AND :endDate")
    List<Flight> findFlights(
            @Param("departureCity") String departureCity,
            @Param("arrivalCity") String arrivalCity,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
    
    // เพิ่มเมธอดที่รองรับ Pagination
    @Query("SELECT f FROM Flight f WHERE f.departureCity = :departureCity " +
           "AND f.arrivalCity = :arrivalCity " +
           "AND f.departureTime BETWEEN :startDate AND :endDate")
    Page<Flight> findFlightsWithPagination(
            @Param("departureCity") String departureCity,
            @Param("arrivalCity") String arrivalCity,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable);
    
    // ค้นหาเที่ยวบินตามสถานะ
    List<Flight> findByFlightStatus(String flightStatus);
    
    // ค้นหาเที่ยวบินตามประเภทเครื่องบิน
    List<Flight> findByAircraft(String aircraft);
}