package com.example.airlinebooking.service;

import com.example.airlinebooking.model.Flight;
import com.example.airlinebooking.repository.FlightRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FlightService {
    @Autowired
    private FlightRepository flightRepository;

    public List<Flight> searchFlights(String departure, String arrival, String date) {
        return flightRepository.findByDepartureAndArrivalAndDate(departure, arrival, date);
    }

    public Flight addFlight(Flight flight) {
        return flightRepository.save(flight);
    }

    public Flight updateFlight(Long id, Flight flight) {
        flight.setId(id);
        return flightRepository.save(flight);
    }

    public void deleteFlight(Long id) {
        flightRepository.deleteById(id);
    }

    public Optional<Flight> getFlightById(Long id) {
        return flightRepository.findById(id);
    }

    public void updateFlightStatus(Long id, String status) {
        Optional<Flight> flight = flightRepository.findById(id);
        flight.ifPresent(f -> {
            f.setStatus(status);
            flightRepository.save(f);
        });
    }
}