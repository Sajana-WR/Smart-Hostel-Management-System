package com.hostel.smarthostelbackend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "energy_data",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_energy_block_date",
                        columnNames = {"block_code", "record_date"})
        })
public class EnergyData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "block_code", nullable = false, length = 10)
    private String blockCode; // A, B, C, D

    @Column(name = "record_date", nullable = false)
    private LocalDate recordDate;

    @Column(name = "consumption_kwh", nullable = false, precision = 10, scale = 2)
    private BigDecimal consumptionKwh;

    @Column(name = "cost_per_kwh", precision = 10, scale = 2)
    private BigDecimal costPerKwh;

    @Column(name = "total_cost", precision = 12, scale = 2)
    private BigDecimal totalCost;

    @Column(name = "meter_reading_start", precision = 12, scale = 2)
    private BigDecimal meterReadingStart;

    @Column(name = "meter_reading_end", precision = 12, scale = 2)
    private BigDecimal meterReadingEnd;

    @Column(length = 500)
    private String notes;

    // ✅ FIXED: JsonIgnore prevents lazy loading serialization error
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recorded_by")
    private User recordedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public EnergyData() {}

    @PrePersist
    public void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
        calculateTotalCost();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        calculateTotalCost();
    }

    private void calculateTotalCost() {
        if (consumptionKwh != null && costPerKwh != null) {
            this.totalCost = consumptionKwh.multiply(costPerKwh);
        }
    }

    // Getters & Setters
    public Long getId() { return id; }

    public String getBlockCode() { return blockCode; }
    public void setBlockCode(String blockCode) { this.blockCode = blockCode; }

    public LocalDate getRecordDate() { return recordDate; }
    public void setRecordDate(LocalDate recordDate) { this.recordDate = recordDate; }

    public BigDecimal getConsumptionKwh() { return consumptionKwh; }
    public void setConsumptionKwh(BigDecimal consumptionKwh) { this.consumptionKwh = consumptionKwh; }

    public BigDecimal getCostPerKwh() { return costPerKwh; }
    public void setCostPerKwh(BigDecimal costPerKwh) { this.costPerKwh = costPerKwh; }

    public BigDecimal getTotalCost() { return totalCost; }
    public void setTotalCost(BigDecimal totalCost) { this.totalCost = totalCost; }

    public BigDecimal getMeterReadingStart() { return meterReadingStart; }
    public void setMeterReadingStart(BigDecimal meterReadingStart) { this.meterReadingStart = meterReadingStart; }

    public BigDecimal getMeterReadingEnd() { return meterReadingEnd; }
    public void setMeterReadingEnd(BigDecimal meterReadingEnd) { this.meterReadingEnd = meterReadingEnd; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public User getRecordedBy() { return recordedBy; }
    public void setRecordedBy(User recordedBy) { this.recordedBy = recordedBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}