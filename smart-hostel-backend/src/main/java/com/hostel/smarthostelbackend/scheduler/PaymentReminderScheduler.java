package com.hostel.smarthostelbackend.scheduler;

import com.hostel.smarthostelbackend.service.NotificationService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.Locale;

@Component
public class PaymentReminderScheduler {

    private final NotificationService notificationService;

    public PaymentReminderScheduler(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /**
     * Runs on the 1st of every month at 9:00 AM.
     * Sends a payment reminder in-app notification + email to all approved students.
     *
     * Cron: second minute hour day month weekday
     */
    @Scheduled(cron = "0 0 9 1 * *")
    public void sendMonthlyPaymentReminders() {
        LocalDate today = LocalDate.now();
        String monthName = today.getMonth().getDisplayName(TextStyle.FULL, Locale.ENGLISH);
        int year = today.getYear();

        String title = "Payment Reminder – " + monthName + " " + year;
        String message = "Dear Student, your hostel fee for " + monthName + " " + year +
                " is due by the 5th of this month. Please make your payment on time to avoid late fees. " +
                "You can pay via the Payments section in your student portal.";

        notificationService.sendPaymentReminder(title, message);

        System.out.println("[Scheduler] Payment reminders sent for " + monthName + " " + year);
    }
}