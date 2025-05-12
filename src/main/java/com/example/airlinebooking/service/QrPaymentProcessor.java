package com.example.airlinebooking.service;

import org.springframework.stereotype.Component;

import com.example.airlinebooking.model.PaymentRequest;
import com.example.airlinebooking.model.PaymentResponse;

@Component
public class QrPaymentProcessor implements PaymentProcessor {
    @Override
    public PaymentResponse process(PaymentRequest request) {
        // Logic การประมวลผลการชำระเงินด้วย QR
        return new PaymentResponse(true, "QR payment successful", "/receipts/qr");
    }
}
