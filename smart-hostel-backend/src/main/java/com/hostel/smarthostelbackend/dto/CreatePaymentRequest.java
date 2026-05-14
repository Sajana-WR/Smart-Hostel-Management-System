package com.hostel.smarthostelbackend.dto;

import java.math.BigDecimal;

public class CreatePaymentRequest {
    public Long userId;
    public String monthYear;
    public BigDecimal amount;
    public String method;

    // Stripe PaymentIntent ID — sent from frontend after card payment succeeds
    // Stored in the `reference` column of the payments table
    public String stripePaymentIntentId;
}