package com.example.airlinebooking.service;

import org.springframework.stereotype.Component;

import com.example.airlinebooking.model.PaymentRequest;
import com.example.airlinebooking.model.PaymentResponse;

@Component
public class CreditCardPaymentProcessor implements PaymentProcessor {
    @Override
    public PaymentResponse process(PaymentRequest request) {
        // Logic การประมวลผลการชำระเงินด้วยบัตรเครดิต
        return new PaymentResponse(true, "Credit card payment successful", "/receipts/credit-card");
    }
}
