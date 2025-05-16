// PaymentService.java
package com.airline.booking.service;

import com.airline.booking.model.Payment;
import com.airline.booking.exception.ResourceNotFoundException;
import com.airline.booking.repository.PaymentRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public Payment getPaymentById(String paymentId) throws ResourceNotFoundException {
        return paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + paymentId));
    }

    public List<Payment> getPaymentsByBookingId(String bookingId) {
        return paymentRepository.findByBookingBookingId(bookingId);
    }

    public Payment updatePaymentStatus(String paymentId, String status) throws ResourceNotFoundException {
        Payment payment = getPaymentById(paymentId);
        payment.setPaymentStatus(status);
        return paymentRepository.save(payment);
    }
}