package com.example.airlinebooking.service;

import java.util.EnumMap;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.example.airlinebooking.model.PaymentRequest;
import com.example.airlinebooking.model.PaymentResponse;

@Service
public class PaymentService {
    private final Map<PaymentMethod, PaymentProcessor> processorMap;

    public PaymentService(
            CreditCardPaymentProcessor credit,
            BankTransferPaymentProcessor bank,
            QrPaymentProcessor qr,
            EWalletPaymentProcessor wallet
    ) {
        processorMap = new EnumMap<>(PaymentMethod.class);
        processorMap.put(PaymentMethod.CREDIT_CARD, credit);
        processorMap.put(PaymentMethod.BANK_TRANSFER, bank);
        processorMap.put(PaymentMethod.QR_PAYMENT, qr);
        processorMap.put(PaymentMethod.E_WALLET, wallet);
    }

    public PaymentResponse processPayment(PaymentRequest request) {
        PaymentProcessor processor = processorMap.get(request.getPaymentMethod());
        if (processor == null) {
            return new PaymentResponse(false, "Unsupported payment method", null);
        }
        return processor.process(request);
    }
}
