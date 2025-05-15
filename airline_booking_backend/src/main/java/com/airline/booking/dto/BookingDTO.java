package com.airline.booking.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class BookingDTO {
    private String bookingId;
    private String userId;
    private String flightId;
    private LocalDate bookingDate;
    private String bookingStatus;
    private BigDecimal totalPrice;
    private String contactEmail;
    private String contactPhone;
    private List<PassengerDTO> passengers = new ArrayList<>();
    private PaymentDTO payment;

    public BookingDTO() {}

    public BookingDTO(String bookingId, String userId, String flightId, LocalDate bookingDate,
                      String bookingStatus, BigDecimal totalPrice,
                      String contactEmail, String contactPhone,
                      List<PassengerDTO> passengers, PaymentDTO payment) {
        this.bookingId = bookingId;
        this.userId = userId;
        this.flightId = flightId;
        this.bookingDate = bookingDate;
        this.bookingStatus = bookingStatus;
        this.totalPrice = totalPrice;
        this.contactEmail = contactEmail;
        this.contactPhone = contactPhone;
        this.passengers = passengers != null ? passengers : new ArrayList<>();
        this.payment = payment;
    }

    // Getters and Setters
    public String getBookingId() {
        return bookingId;
    }

    public void setBookingId(String bookingId) {
        this.bookingId = bookingId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getFlightId() {
        return flightId;
    }

    public void setFlightId(String flightId) {
        this.flightId = flightId;
    }

    public LocalDate getBookingDate() {
        return bookingDate;
    }

    public void setBookingDate(LocalDate bookingDate) {
        this.bookingDate = bookingDate;
    }

    public String getBookingStatus() {
        return bookingStatus;
    }

    public void setBookingStatus(String bookingStatus) {
        this.bookingStatus = bookingStatus;
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public List<PassengerDTO> getPassengers() {
        return passengers;
    }

    public void setPassengers(List<PassengerDTO> passengers) {
        this.passengers = passengers != null ? passengers : new ArrayList<>();
    }

    public void addPassenger(PassengerDTO passenger) {
        if (passenger != null) {
            this.passengers.add(passenger);
        }
    }

    public PaymentDTO getPayment() {
        return payment;
    }

    public void setPayment(PaymentDTO payment) {
        this.payment = payment;
    }

    // Inner class for Passenger data
    public static class PassengerDTO {
        private String passengerId;
        private String title;
        private String firstName;
        private String lastName;
        private String dateOfBirth;  // Use String for easy JSON serialization
        private String nationality;
        private String documentId;
        private String seatNumber;
        private String seatId;       // <-- เพิ่มฟิลด์ seatId
        private String specialService;

        public PassengerDTO() {}

        public PassengerDTO(String passengerId, String firstName, String lastName) {
            this.passengerId = passengerId;
            this.firstName = firstName;
            this.lastName = lastName;
        }

        // Getters and setters
        public String getPassengerId() {
            return passengerId;
        }

        public void setPassengerId(String passengerId) {
            this.passengerId = passengerId;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getFirstName() {
            return firstName;
        }

        public void setFirstName(String firstName) {
            this.firstName = firstName;
        }

        public String getLastName() {
            return lastName;
        }

        public void setLastName(String lastName) {
            this.lastName = lastName;
        }

        public String getDateOfBirth() {
            return dateOfBirth;
        }

        public void setDateOfBirth(String dateOfBirth) {
            this.dateOfBirth = dateOfBirth;
        }

        public String getNationality() {
            return nationality;
        }

        public void setNationality(String nationality) {
            this.nationality = nationality;
        }

        public String getDocumentId() {
            return documentId;
        }

        public void setDocumentId(String documentId) {
            this.documentId = documentId;
        }

        public String getSeatNumber() {
            return seatNumber;
        }

        public void setSeatNumber(String seatNumber) {
            this.seatNumber = seatNumber;
        }

        public String getSeatId() {
            return seatId;
        }

        public void setSeatId(String seatId) {
            this.seatId = seatId;
        }

        public String getSpecialService() {
            return specialService;
        }

        public void setSpecialService(String specialService) {
            this.specialService = specialService;
        }
    }
    

    // Inner class for Payment data
    public static class PaymentDTO {
        private String paymentId;
        private BigDecimal amount;
        private String paymentStatus;
        private String paymentMethod;
        private String paymentDate;

        public PaymentDTO() {}

        public PaymentDTO(String paymentId, BigDecimal amount, String paymentStatus) {
            this.paymentId = paymentId;
            this.amount = amount;
            this.paymentStatus = paymentStatus;
        }

        // Getters and setters
        public String getPaymentId() {
            return paymentId;
        }

        public void setPaymentId(String paymentId) {
            this.paymentId = paymentId;
        }

        public BigDecimal getAmount() {
            return amount;
        }

        public void setAmount(BigDecimal amount) {
            this.amount = amount;
        }

        public String getPaymentStatus() {
            return paymentStatus;
        }

        public void setPaymentStatus(String paymentStatus) {
            this.paymentStatus = paymentStatus;
        }

        public String getPaymentMethod() {
            return paymentMethod;
        }

        public void setPaymentMethod(String paymentMethod) {
            this.paymentMethod = paymentMethod;
        }

        public String getPaymentDate() {
            return paymentDate;
        }

        public void setPaymentDate(String paymentDate) {
            this.paymentDate = paymentDate;
        }
    }
}
