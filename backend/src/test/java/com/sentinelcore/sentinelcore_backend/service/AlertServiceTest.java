package com.sentinelcore.sentinelcore_backend.service;

import com.sentinelcore.sentinelcore_backend.entity.Alert;
import com.sentinelcore.sentinelcore_backend.entity.InfrastructureAsset;
import com.sentinelcore.sentinelcore_backend.repository.AlertRepository;
import com.sentinelcore.sentinelcore_backend.repository.InfrastructureAssetRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AlertServiceTest {

    @Mock
    private AlertRepository alertRepository;

    @Mock
    private InfrastructureAssetRepository assetRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private AlertService alertService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(alertService, "toPhoneNumber", "+1234567890");
    }

    @Test
    void testCreateAlert_CriticalSeverity_SendsSmsOnly() {
        Long assetId = 1L;
        InfrastructureAsset asset = new InfrastructureAsset();
        asset.setId(assetId);
        asset.setAssetName("TestAsset");
        when(assetRepository.findById(assetId)).thenReturn(Optional.of(asset));
        when(alertRepository.save(any(Alert.class))).thenAnswer(i -> i.getArguments()[0]);

        alertService.createAlert(assetId, "CRITICAL", "Critical issue");

        verify(notificationService, times(1)).sendAlertSms(eq("+1234567890"), eq("TestAsset"), eq("CRITICAL"), eq("Critical issue"));
        verify(notificationService, never()).sendAlertEmail(anyString(), anyString(), anyString(), anyString());
    }

    @Test
    void testCreateAlert_MediumSeverity_SendsEmailOnly() {
        Long assetId = 1L;
        InfrastructureAsset asset = new InfrastructureAsset();
        asset.setId(assetId);
        asset.setAssetName("TestAsset");
        when(assetRepository.findById(assetId)).thenReturn(Optional.of(asset));
        when(alertRepository.save(any(Alert.class))).thenAnswer(i -> i.getArguments()[0]);

        alertService.createAlert(assetId, "MEDIUM", "Medium issue");

        verify(notificationService, times(1)).sendAlertEmail(eq("mynew222028@gmail.com"), eq("TestAsset"), eq("MEDIUM"), eq("Medium issue"));
        verify(notificationService, never()).sendAlertSms(anyString(), anyString(), anyString(), anyString());
    }
}
