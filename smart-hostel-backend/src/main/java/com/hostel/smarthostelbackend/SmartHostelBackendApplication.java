package com.hostel.smarthostelbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling          // ✅ Required for @Scheduled to work
public class SmartHostelBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartHostelBackendApplication.class, args);
    }
}