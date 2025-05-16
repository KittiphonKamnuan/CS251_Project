package com.airline.booking.repository;

import com.airline.booking.model.Booking;
import com.airline.booking.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, String> {
    Optional<Payment> findByBooking(Booking booking);
    List<Payment> findByBookingBookingId(String bookingId);
}