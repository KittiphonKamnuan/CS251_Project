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

    // คงเมธอดอื่นๆ ไว้...
    Flight findByFlightNumber(String flightNumber);
    
    List<Flight> findByDepartureTimeBetween(LocalDateTime start, LocalDateTime end);
    
    List<Flight> findByDepartureCityAndArrivalCity(String departureCity, String arrivalCity);
    
    @Query("SELECT f FROM Flight f WHERE f.departureCity = :departureCity " +
           "AND f.arrivalCity = :arrivalCity " +
           "AND f.departureTime BETWEEN :startDate AND :endDate")
    List<Flight> findFlights(
            @Param("departureCity") String departureCity,
            @Param("arrivalCity") String arrivalCity,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT f FROM Flight f WHERE f.departureCity = :departureCity " +
           "AND f.arrivalCity = :arrivalCity " +
           "AND f.departureTime BETWEEN :startDate AND :endDate")
    Page<Flight> findFlightsWithPagination(
            @Param("departureCity") String departureCity,
            @Param("arrivalCity") String arrivalCity,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable);
    
    List<Flight> findByFlightStatus(String flightStatus);
    
    List<Flight> findByAircraft(String aircraft);
}