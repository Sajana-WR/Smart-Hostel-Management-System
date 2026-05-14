package com.hostel.smarthostelbackend.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendSimpleEmail(String toEmail, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);
            message.setFrom("noreply@thebunker.lk");
            mailSender.send(message);
        } catch (Exception e) {
            // Log but don't crash — email failure should not break in-app notification
            System.err.println("Failed to send email to " + toEmail + ": " + e.getMessage());
        }
    }
}