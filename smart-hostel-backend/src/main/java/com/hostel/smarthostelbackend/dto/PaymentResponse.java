package com.hostel.smarthostelbackend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PaymentResponse {
    public Long id;
    public String monthYear;
    public BigDecimal amount;
    public String method;
    public String status;
    public String roomCode;
    public LocalDateTime createdAt;

    // ✅ Admin-only fields (null for student responses)
    public String studentName;
    public String studentEmail;
}