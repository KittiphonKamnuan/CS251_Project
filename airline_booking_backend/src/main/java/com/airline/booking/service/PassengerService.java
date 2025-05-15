package com.airline.booking.service;

import com.airline.booking.exception.ResourceNotFoundException;
import com.airline.booking.model.Booking;
import com.airline.booking.model.Passenger;
import com.airline.booking.model.Seat;
import com.airline.booking.repository.PassengerRepository;
import com.airline.booking.repository.BookingRepository;
import com.airline.booking.repository.SeatRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PassengerService {

    @Autowired
    private PassengerRepository passengerRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private SeatRepository seatRepository;

    // Retrieve all passengers
    public List<Passenger> getAllPassengers() {
        return passengerRepository.findAll();
    }

    // Retrieve passenger by ID
    public Passenger getPassengerById(String passengerId) {
        return passengerRepository.findById(passengerId)
                .orElseThrow(() -> new ResourceNotFoundException("ไม่พบผู้โดยสารด้วย ID: " + passengerId));
    }

    // Retrieve passengers by booking ID
    public List<Passenger> getPassengersByBookingId(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("ไม่พบการจองด้วย ID: " + bookingId));
        return passengerRepository.findByBooking(booking);
    }

    // Create a new passenger linked to booking and optionally seat
    public Passenger createPassenger(Passenger passenger, String bookingId, String seatNumber) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        
        passenger.setBooking(booking);

        if (seatNumber != null && !seatNumber.isEmpty()) {
            Optional<Seat> seatOpt = seatRepository.findBySeatNumber(seatNumber);
            if (seatOpt.isPresent()) {
                passenger.setSeat(seatOpt.get());
            } else {
                throw new ResourceNotFoundException("Seat not found with seatNumber: " + seatNumber);
            }
        } else {
            passenger.setSeat(null); // ไม่มีที่นั่งกำหนด
        }
        
        return passengerRepository.save(passenger);
    }    

    // Update passenger details and optionally update seat
    public Passenger updatePassenger(String passengerId, Passenger passengerDetails, String seatId) {
        Passenger passenger = getPassengerById(passengerId);

        passenger.setFirstName(passengerDetails.getFirstName());
        passenger.setLastName(passengerDetails.getLastName());
        passenger.setDateOfBirth(passengerDetails.getDateOfBirth());
        passenger.setPassportNumber(passengerDetails.getPassportNumber());

        if (seatId != null && !seatId.isEmpty()) {
            Seat seat = seatRepository.findById(seatId)
                    .orElseThrow(() -> new ResourceNotFoundException("ไม่พบที่นั่งด้วย ID: " + seatId));
            passenger.setSeat(seat);
        } else {
            passenger.setSeat(null); // ลบการจับคู่ที่นั่ง
        }

        return passengerRepository.save(passenger);
    }

    // Delete passenger by ID
    public void deletePassenger(String passengerId) {
        Passenger passenger = getPassengerById(passengerId);
        passengerRepository.delete(passenger);
    }
}
