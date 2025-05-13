package com.example.airlinebooking.repository;

import com.example.airlinebooking.model.Flight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FlightRepository extends JpaRepository<Flight, Long> {
    List<Flight> findByDepartureAndArrivalAndDate(String departure, String arrival, String date);
}
