package com.example.airlinebooking.service;

import org.springframework.stereotype.Component;

import com.example.airlinebooking.model.PaymentRequest;
import com.example.airlinebooking.model.PaymentResponse;

@Component
public class BankTransferPaymentProcessor implements PaymentProcessor {
    @Override
    public PaymentResponse process(PaymentRequest request) {
        // Logic การประมวลผลการโอนผ่านธนาคาร
        return new PaymentResponse(true, "Bank transfer payment successful", "/receipts/bank-transfer");
    }
}