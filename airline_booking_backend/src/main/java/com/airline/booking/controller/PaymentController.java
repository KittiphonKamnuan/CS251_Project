package com.airline.booking.controller;

import com.airline.booking.dto.PaymentDTO;
import com.airline.booking.model.Booking;
import com.airline.booking.model.Payment;
import com.airline.booking.repository.BookingRepository;
import com.airline.booking.repository.PaymentRepository;
import com.airline.booking.exception.ResourceNotFoundException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BookingRepository bookingRepository;

    // Create a new payment
    @PostMapping
    @Transactional
    public ResponseEntity<?> createPayment(
            @RequestBody PaymentDTO paymentDTO,
            @RequestParam String bookingId) {
        try {
            logger.debug("Creating payment for booking ID: {}", bookingId);
            
            // Find the booking
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));
            
            // Check if payment already exists for this booking
            Payment existingPayment = null;
            try {
                Optional<Payment> existingPaymentOpt = paymentRepository.findByBooking(booking);
                existingPayment = existingPaymentOpt.orElse(null);
            } catch (Exception e) {
                logger.warn("Error checking for existing payment: {}", e.getMessage());
                // Continue execution even if there's an error checking for existing payment
            }
            
            if (existingPayment != null) {
                logger.warn("Payment already exists for booking ID: {}", bookingId);
                Map<String, String> response = new HashMap<>();
                response.put("message", "A payment already exists for this booking");
                response.put("paymentId", existingPayment.getPaymentId());
                return new ResponseEntity<>(response, HttpStatus.CONFLICT);
            }
            
            // Convert DTO to entity
            Payment payment = convertToEntity(paymentDTO);
            
            // Always generate a new payment ID that fits in the database column (10 chars)
            payment.setPaymentId("PAY" + generateUniqueId());
            logger.debug("Generated new payment ID: {}", payment.getPaymentId());
            
            if (payment.getPaymentDate() == null) {
                payment.setPaymentDate(LocalDate.now());
            }
            
            if (payment.getAmount() == null) {
                payment.setAmount(booking.getTotalPrice());
            }
            
            if (payment.getPaymentStatus() == null || payment.getPaymentStatus().isEmpty()) {
                payment.setPaymentStatus("Completed");
            }
            
            // Set the booking relationship properly
            payment.setBooking(booking);
            booking.setPayment(payment);
            
            // Save the payment
            logger.debug("Saving payment: {}", payment);
            Payment savedPayment = paymentRepository.save(payment);
            
            // Update booking status if payment is completed
            if ("Completed".equals(savedPayment.getPaymentStatus())) {
                booking.setBookingStatus("Confirmed");
                logger.debug("Updating booking status to Confirmed: {}", booking);
                bookingRepository.save(booking);
            }
            
            // Convert back to DTO for response
            PaymentDTO responseDTO = convertToDTO(savedPayment);
            
            return new ResponseEntity<>(responseDTO, HttpStatus.CREATED);
        } catch (ResourceNotFoundException e) {
            logger.error("Resource not found: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.error("Error creating payment: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error creating payment: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get all payments
    @GetMapping
    public ResponseEntity<?> getAllPayments() {
        try {
            List<Payment> payments = paymentRepository.findAll();
            List<PaymentDTO> paymentDTOs = payments.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return new ResponseEntity<>(paymentDTOs, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error retrieving payments: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error retrieving payments: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get payment by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getPaymentById(@PathVariable String id) {
        try {
            Payment payment = paymentRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Payment not found with ID: " + id));
            PaymentDTO paymentDTO = convertToDTO(payment);
            return new ResponseEntity<>(paymentDTO, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.error("Error retrieving payment: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error retrieving payment: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Update payment status
    @PatchMapping("/{id}/status")
    @Transactional
    public ResponseEntity<?> updatePaymentStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> statusUpdate) {
        try {
            String newStatus = statusUpdate.get("status");
            if (newStatus == null || newStatus.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Payment status is required");
                return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
            }
            
            // Find the payment
            Payment payment = paymentRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Payment not found with ID: " + id));
            
            // Update status
            payment.setPaymentStatus(newStatus);
            
            // Save payment
            Payment updatedPayment = paymentRepository.save(payment);
            
            // Update booking status if payment is completed
            if ("Completed".equals(updatedPayment.getPaymentStatus()) && updatedPayment.getBooking() != null) {
                Booking booking = updatedPayment.getBooking();
                booking.setBookingStatus("Confirmed");
                bookingRepository.save(booking);
            }
            
            PaymentDTO paymentDTO = convertToDTO(updatedPayment);
            return new ResponseEntity<>(paymentDTO, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.error("Error updating payment status: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error updating payment status: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get payment by booking ID
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<?> getPaymentByBookingId(@PathVariable String bookingId) {
        try {
            // Find the booking
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));
            
            // Find the payment for this booking
            Optional<Payment> paymentOpt = paymentRepository.findByBooking(booking);
            
            if (!paymentOpt.isPresent()) {
                throw new ResourceNotFoundException("Payment not found for booking ID: " + bookingId);
            }
            
            Payment payment = paymentOpt.get();
            PaymentDTO paymentDTO = convertToDTO(payment);
            return new ResponseEntity<>(paymentDTO, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.error("Error retrieving payment for booking: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error retrieving payment for booking: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Helper method to convert Payment entity to PaymentDTO
    private PaymentDTO convertToDTO(Payment payment) {
        if (payment == null) {
            return null;
        }
        
        PaymentDTO dto = new PaymentDTO();
        dto.setPaymentId(payment.getPaymentId());
        dto.setBookingId(payment.getBooking() != null ? payment.getBooking().getBookingId() : null);
        dto.setAmount(payment.getAmount());
        dto.setPaymentStatus(payment.getPaymentStatus());
        dto.setPaymentMethod(payment.getPaymentMethod());
        dto.setDebitCard(payment.getDebitCard());
        dto.setCreditCard(payment.getCreditCard());
        dto.setBankTransfer(payment.getBankTransfer());
        dto.setCash(payment.getCash());
        dto.setPaymentDate(payment.getPaymentDate());
        
        return dto;
    }
    
    // Helper method to convert PaymentDTO to Payment entity
    private Payment convertToEntity(PaymentDTO dto) {
        if (dto == null) {
            return null;
        }
        
        Payment payment = new Payment();
        // Note: we're NOT setting paymentId here anymore - it's set in createPayment
        payment.setAmount(dto.getAmount());
        payment.setPaymentStatus(dto.getPaymentStatus());
        payment.setPaymentMethod(dto.getPaymentMethod());
        payment.setDebitCard(dto.getDebitCard());
        payment.setCreditCard(dto.getCreditCard());
        payment.setBankTransfer(dto.getBankTransfer());
        payment.setCash(dto.getCash());
        payment.setPaymentDate(dto.getPaymentDate());
        
        // Note: We don't set booking here; it's set separately in the controller
        
        return payment;
    }

    // Helper method to generate a unique ID that fits in the PaymentID column
    private String generateUniqueId() {
        // Using 7 characters instead of 8 to make sure "PAY" + 7 chars = 10 chars total
        return UUID.randomUUID().toString().substring(0, 7).toUpperCase();
    }
}