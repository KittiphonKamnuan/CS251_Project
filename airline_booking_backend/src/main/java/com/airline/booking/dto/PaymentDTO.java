package com.airline.booking.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class PaymentDTO {
    private String paymentId;
    private String bookingId;
    private BigDecimal amount;
    private String paymentStatus;
    private String paymentMethod;
    private String debitCard;
    private String creditCard;
    private String bankTransfer;
    private Boolean cash;
    private LocalDate paymentDate;

    // Constructors
    public PaymentDTO() {
    }

    public PaymentDTO(String paymentId, String bookingId, BigDecimal amount, String paymentStatus,
                   String paymentMethod, String debitCard, String creditCard, 
                   String bankTransfer, Boolean cash, LocalDate paymentDate) {
        this.paymentId = paymentId;
        this.bookingId = bookingId;
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

    public String getBookingId() {
        return bookingId;
    }

    public void setBookingId(String bookingId) {
        this.bookingId = bookingId;
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
}