package com.sentinelcore.sentinelcore_backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${custom.twilio.sid}")
    private String twilioAccountSid;

    @Value("${custom.twilio.token}")
    private String twilioAuthToken;

    @Value("${custom.twilio.phone}")
    private String twilioPhoneNumber;

    @PostConstruct
    public void initTwilio() {
        if (twilioAccountSid != null && !twilioAccountSid.contains("YOUR_TWILIO_SID")) {
            Twilio.init(twilioAccountSid.trim(), twilioAuthToken.trim());
            log.info("Twilio initialized successfully with Auth Token.");
        }
    }

    public void sendAlertEmail(String toEmail, String assetName, String severity, String message) {
        try {
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setFrom(fromEmail);
            mail.setTo(toEmail);
            String formattedMessage = "Respected Sir/Madam,\n\n" +
                    "An alert has been triggered for one of your infrastructure assets.\n\n" +
                    "Asset Name: " + assetName + "\n" +
                    "Severity: " + severity + "\n" +
                    "Details: " + message + "\n\n" +
                    "Please check the SentinelCore dashboard for more information.\n\n" +
                    "Thank you,\n" +
                    "SentinelCore Monitoring System";

            mail.setSubject("[SentinelCore] " + severity + " Alert: " + assetName);
            mail.setText(formattedMessage);
            mailSender.send(mail);
            log.info("Alert email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send alert email: {}", e.getMessage(), e);
        }
    }

    public void sendAlertSms(String toPhoneNumber, String assetName, String severity, String messageText) {
        try {
            if (twilioAccountSid == null || twilioAccountSid.contains("YOUR_TWILIO_SID")) {
                log.warn("Twilio is not configured. SMS notification skipped.");
                return;
            }
            String smsBody = "sms_internal_alerts";
            Message sms = Message.creator(
                    new PhoneNumber(toPhoneNumber),
                    new PhoneNumber(twilioPhoneNumber),
                    smsBody
            ).create();
            log.info("Alert SMS sent to {} with SID {}", toPhoneNumber, sms.getSid());
        } catch (Exception e) {
            log.error("Failed to send alert SMS: {}", e.getMessage(), e);
        }
    }
}
