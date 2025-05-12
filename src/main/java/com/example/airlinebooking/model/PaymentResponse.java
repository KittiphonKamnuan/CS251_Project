package com.example.airlinebooking.model;

public class PaymentResponse {
    private boolean success;
    private String message;
    private String receiptUrl;

    public PaymentResponse() {
        // default constructor for deserialization
    }

    public PaymentResponse(boolean success, String message, String receiptUrl) {
        this.success = success;
        this.message = message;
        this.receiptUrl = receiptUrl;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getReceiptUrl() {
        return receiptUrl;
    }

    public void setReceiptUrl(String receiptUrl) {
        this.receiptUrl = receiptUrl;
    }
}
