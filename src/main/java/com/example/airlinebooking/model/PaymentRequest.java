package com.example.airlinebooking.model;

import java.math.BigDecimal;
import java.util.Map;

public class PaymentRequest {
    private String paymentMethod; // credit-card, bank-transfer, e-wallet
    private BigDecimal amount;
    private String orderId;
    private Map<String, String> details;

    // Getters and Setters
    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public Map<String, String> getDetails() {
        return details;
    }

    public void setDetails(Map<String, String> details) {
        this.details = details;
    }

}

