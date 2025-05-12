package com.example.airlinebooking.service;

import org.springframework.stereotype.Component;

import com.example.airlinebooking.model.PaymentRequest;
import com.example.airlinebooking.model.PaymentResponse;

@Component
public class EWalletPaymentProcessor implements PaymentProcessor {
    @Override
    public PaymentResponse process(PaymentRequest request) {
        // Logic การประมวลผลการชำระเงินด้วย e-Wallet
        return new PaymentResponse(true, "E-wallet payment successful", "/receipts/e-wallet");
    }
}
