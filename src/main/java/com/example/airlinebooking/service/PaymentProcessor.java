package com.example.airlinebooking.service;

import com.example.airlinebooking.model.PaymentRequest;
import com.example.airlinebooking.model.PaymentResponse;

public interface PaymentProcessor {
    PaymentResponse process(PaymentRequest request);
}
