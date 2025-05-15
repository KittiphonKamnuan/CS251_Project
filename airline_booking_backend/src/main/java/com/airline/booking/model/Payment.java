package com.airline.booking.model;

import javax.persistence.*;

import com.fasterxml.jackson.annotation.JsonBackReference;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "Payment")
public class Payment {

    @Id
    @Column(name = "PaymentID", length = 10)
    private String paymentId;

    @JsonBackReference(value = "booking-payment")
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BookingID")
    private Booking booking;    

    @Column(name = "Amount", precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "PaymentStatus", length = 20)
    private String paymentStatus;

    @Column(name = "PaymentMethod", length = 50)
    private String paymentMethod;

    @Column(name = "debit_card", length = 19)
    private String debitCard;

    @Column(name = "credit_card", length = 19)
    private String creditCard;

    @Column(name = "bank_transfer", length = 20)
    private String bankTransfer;

    @Column(name = "cash")
    private Boolean cash;

    @Column(name = "PaymentDate")
    private LocalDate paymentDate;

    // Constructors
    public Payment() {
    }

    public Payment(String paymentId, Booking booking, BigDecimal amount, String paymentStatus,
                  String paymentMethod, String debitCard, String creditCard, String bankTransfer, Boolean cash,
                  LocalDate paymentDate) {
        this.paymentId = paymentId;
        this.booking = booking;
        this.amount = amount;
        this.paymentStatus = paymentStatus;
        this.paymentMethod = paymentMethod;
        this.debitCard = debitCard;
        this.creditCard = creditCard;
        this.bankTransfer = bankTransfer;
        this.cash = cash;
        this.paymentDate = paymentDate;
    }

    // Getters and Setters
    public String getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }

    public Booking getBooking() {
        return booking;
    }

    public void setBooking(Booking booking) {
        this.booking = booking;
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

    public String getDebitCard() {
        return debitCard;
    }

    public void setDebitCard(String debitCard) {
        this.debitCard = debitCard;
    }

    public String getCreditCard() {
        return creditCard;
    }

    public void setCreditCard(String creditCard) {
        this.creditCard = creditCard;
    }

    public String getBankTransfer() {
        return bankTransfer;
    }

    public void setBankTransfer(String bankTransfer) {
        this.bankTransfer = bankTransfer;
    }

    public Boolean getCash() {
        return cash;
    }

    public void setCash(Boolean cash) {
        this.cash = cash;
    }

    public LocalDate getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDate paymentDate) {
        this.paymentDate = paymentDate;
    }

    @Override
    public String toString() {
        return "Payment{" +
                "paymentId='" + paymentId + '\'' +
                ", bookingId='" + (booking != null ? booking.getBookingId() : "null") + '\'' +
                ", amount=" + amount +
                ", paymentStatus='" + paymentStatus + '\'' +
                ", paymentMethod='" + paymentMethod + '\'' +
                ", paymentDate=" + paymentDate +
                '}';
    }
}