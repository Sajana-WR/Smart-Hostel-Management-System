package com.hostel.smarthostelbackend.service;

import com.hostel.smarthostelbackend.entity.EnergyData;
import com.hostel.smarthostelbackend.entity.User;
import com.hostel.smarthostelbackend.exception.AppException;
import com.hostel.smarthostelbackend.repository.EnergyDataRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class EnergyService {

    private final EnergyDataRepository energyRepo;

    // Flask AI microservice URL
    private static final String FLASK_URL = "http://localhost:5001";

    public EnergyService(EnergyDataRepository energyRepo) {
        this.energyRepo = energyRepo;
    }

    // ──────────────────────────────────────────────
    // DATA ENTRY (Admin)
    // ──────────────────────────────────────────────

    @Transactional
    public EnergyData addRecord(User admin, String blockCode, String recordDate,
                                BigDecimal consumptionKwh, BigDecimal costPerKwh,
                                BigDecimal meterReadingStart, BigDecimal meterReadingEnd,
                                String notes) {
        if (blockCode == null || blockCode.trim().isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Block code is required");
        }
        if (recordDate == null || recordDate.trim().isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Record date is required");
        }
        if (consumptionKwh == null || consumptionKwh.compareTo(BigDecimal.ZERO) < 0) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Valid consumption value is required");
        }

        LocalDate date = LocalDate.parse(recordDate);

        Optional<EnergyData> existing = energyRepo.findByBlockCodeAndRecordDate(
                blockCode.toUpperCase().trim(), date);
        if (existing.isPresent()) {
            throw new AppException(HttpStatus.CONFLICT,
                    "Energy record already exists for Block " + blockCode + " on " + recordDate);
        }

        EnergyData record = new EnergyData();
        record.setBlockCode(blockCode.toUpperCase().trim());
        record.setRecordDate(date);
        record.setConsumptionKwh(consumptionKwh);
        record.setCostPerKwh(costPerKwh != null ? costPerKwh : new BigDecimal("35.00"));
        record.setMeterReadingStart(meterReadingStart);
        record.setMeterReadingEnd(meterReadingEnd);
        record.setNotes(notes != null ? notes.trim() : null);
        record.setRecordedBy(admin);

        return energyRepo.save(record);
    }

    @Transactional
    public EnergyData updateRecord(Long id, BigDecimal consumptionKwh, BigDecimal costPerKwh,
                                   BigDecimal meterReadingStart, BigDecimal meterReadingEnd,
                                   String notes) {
        EnergyData record = energyRepo.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Energy record not found"));

        if (consumptionKwh != null) record.setConsumptionKwh(consumptionKwh);
        if (costPerKwh != null) record.setCostPerKwh(costPerKwh);
        if (meterReadingStart != null) record.setMeterReadingStart(meterReadingStart);
        if (meterReadingEnd != null) record.setMeterReadingEnd(meterReadingEnd);
        if (notes != null) record.setNotes(notes.trim());

        return energyRepo.save(record);
    }

    @Transactional
    public void deleteRecord(Long id) {
        EnergyData record = energyRepo.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Energy record not found"));
        energyRepo.delete(record);
    }

    // ──────────────────────────────────────────────
    // DATA RETRIEVAL (Admin)
    // ──────────────────────────────────────────────

    public List<EnergyData> getAllRecords() {
        return energyRepo.findAllOrderByDateDesc();
    }

    public EnergyData getRecordById(Long id) {
        return energyRepo.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Energy record not found"));
    }

    public List<EnergyData> getByBlock(String blockCode) {
        return energyRepo.findByBlockCodeOrderByRecordDateDesc(blockCode.toUpperCase().trim());
    }

    public List<EnergyData> getByDate(LocalDate date) {
        return energyRepo.findByRecordDateOrderByBlockCode(date);
    }

    public List<EnergyData> getByDateRange(LocalDate startDate, LocalDate endDate) {
        return energyRepo.findByDateRange(startDate, endDate);
    }

    public List<EnergyData> getLatestPerBlock() {
        return energyRepo.findLatestPerBlock();
    }

    // ──────────────────────────────────────────────
    // ANALYTICS & DASHBOARD (Admin)
    // ──────────────────────────────────────────────

    public Map<String, Object> getAnalytics() {
        List<EnergyData> all = energyRepo.findAll();

        if (all.isEmpty()) {
            Map<String, Object> empty = new HashMap<>();
            empty.put("totalRecords", 0);
            empty.put("message", "No energy data available");
            return empty;
        }

        BigDecimal totalConsumption = all.stream()
                .map(EnergyData::getConsumptionKwh)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalCost = all.stream()
                .filter(e -> e.getTotalCost() != null)
                .map(EnergyData::getTotalCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, BigDecimal> consumptionByBlock = all.stream()
                .collect(Collectors.groupingBy(
                        EnergyData::getBlockCode,
                        Collectors.reducing(BigDecimal.ZERO, EnergyData::getConsumptionKwh, BigDecimal::add)
                ));

        String highestBlock = consumptionByBlock.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("N/A");

        String lowestBlock = consumptionByBlock.entrySet().stream()
                .min(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("N/A");

        BigDecimal avgConsumption = totalConsumption.divide(
                new BigDecimal(all.size()), 2, RoundingMode.HALF_UP);

        List<Map<String, Object>> monthlyTrend = getMonthlyTrend(6);

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalRecords",       all.size());
        analytics.put("totalConsumption",   totalConsumption);
        analytics.put("totalCost",          totalCost);
        analytics.put("consumptionByBlock", consumptionByBlock);
        analytics.put("highestBlock",       highestBlock);
        analytics.put("lowestBlock",        lowestBlock);
        analytics.put("avgConsumption",     avgConsumption);
        analytics.put("monthlyTrend",       monthlyTrend);
        return analytics;
    }

    public List<Map<String, Object>> getMonthlyTrend(int months) {
        LocalDate endDate   = LocalDate.now();
        LocalDate startDate = endDate.minusMonths(months);

        List<EnergyData> records = energyRepo.findByDateRange(startDate, endDate);

        Map<String, Map<String, BigDecimal>> monthBlockMap = new LinkedHashMap<>();

        for (EnergyData e : records) {
            String monthKey = e.getRecordDate().getYear() + "-"
                    + String.format("%02d", e.getRecordDate().getMonthValue());
            monthBlockMap
                    .computeIfAbsent(monthKey, k -> new HashMap<>())
                    .merge(e.getBlockCode(), e.getConsumptionKwh(), BigDecimal::add);
        }

        List<Map<String, Object>> trend = new ArrayList<>();
        for (Map.Entry<String, Map<String, BigDecimal>> entry : monthBlockMap.entrySet()) {
            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", entry.getKey());
            monthData.putAll(entry.getValue());

            BigDecimal monthTotal = entry.getValue().values().stream()
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            monthData.put("total", monthTotal);

            trend.add(monthData);
        }

        return trend;
    }

    // ──────────────────────────────────────────────
    // AI FORECAST — calls Python Flask microservice
    // ──────────────────────────────────────────────

    /**
     * Calls the Flask AI microservice for Linear Regression forecast.
     * Falls back to simple forecast if Flask is not running.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getSimpleForecast() {
        try {
            // Prepare next month details
            LocalDate nextMonth    = LocalDate.now().plusMonths(1);
            int month              = nextMonth.getMonthValue();
            int year               = nextMonth.getYear();
            String forecastMonthStr = year + "-" + String.format("%02d", month);

            // Call Flask /api/energy/forecast/all-blocks
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers       = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("month",          month);
            requestBody.put("year",           year);
            requestBody.put("occupancy_rate", 85.0);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            Map<String, Object> flaskResponse = restTemplate.postForObject(
                    FLASK_URL + "/api/energy/forecast/all-blocks",
                    entity,
                    Map.class
            );

            if (flaskResponse == null) throw new RuntimeException("No response from Flask");

            // Get model info for accuracy metrics
            Map<String, Object> modelInfo = restTemplate.getForObject(
                    FLASK_URL + "/api/energy/model-info",
                    Map.class
            );

            // Build forecast by block map from Flask response
            List<Map<String, Object>> forecasts =
                    (List<Map<String, Object>>) flaskResponse.get("forecasts");

            Map<String, Object> forecastByBlock = new LinkedHashMap<>();
            if (forecasts != null) {
                for (Map<String, Object> f : forecasts) {
                    // Block name is "Block A" — extract just the letter for frontend
                    String blockName = (String) f.get("block");
                    String blockKey  = blockName.replace("Block ", "");
                    forecastByBlock.put(blockKey, f.get("predicted_kwh"));
                }
            }

            // Build result
            Map<String, Object> result = new HashMap<>();
            result.put("forecastMonth",   forecastMonthStr);
            result.put("forecastByBlock", forecastByBlock);
            result.put("totalForecast",   flaskResponse.get("total_kwh"));
            result.put("method",          "AI Linear Regression (Python Flask Microservice)");
            result.put("confidence",      flaskResponse.get("confidence"));

            // Add accuracy metrics if available
            if (modelInfo != null && modelInfo.containsKey("metrics")) {
                Map<String, Object> metrics = (Map<String, Object>) modelInfo.get("metrics");
                result.put("modelAccuracy", metrics.get("accuracy_pct") + "%");
                result.put("modelR2",       metrics.get("r2_score"));
                result.put("note", "Model trained on " + metrics.get("total_records")
                        + " records. R²=" + metrics.get("r2_score")
                        + ", Accuracy=" + metrics.get("accuracy_pct") + "%");
            }

            return result;

        } catch (Exception e) {
            // Flask not running — fall back to simple forecast
            System.out.println("⚠️ Flask AI service unavailable, using fallback: " + e.getMessage());
            return getSimpleForecastFallback();
        }
    }

    /**
     * Fallback forecast used when Flask is not running.
     */
    private Map<String, Object> getSimpleForecastFallback() {
        List<EnergyData> all = energyRepo.findAllOrderByDateDesc();

        if (all.size() < 3) {
            Map<String, Object> result = new HashMap<>();
            result.put("message", "Need at least 3 months of data for forecasting");
            return result;
        }

        LocalDate threeMonthsAgo = LocalDate.now().minusMonths(3);
        List<EnergyData> recent  = energyRepo.findByDateRange(threeMonthsAgo, LocalDate.now());

        Map<String, List<BigDecimal>> blockHistory = new HashMap<>();
        for (EnergyData e : recent) {
            blockHistory.computeIfAbsent(e.getBlockCode(), k -> new ArrayList<>())
                    .add(e.getConsumptionKwh());
        }

        Map<String, BigDecimal> forecast = new HashMap<>();
        BigDecimal totalForecast = BigDecimal.ZERO;

        for (Map.Entry<String, List<BigDecimal>> entry : blockHistory.entrySet()) {
            List<BigDecimal> values = entry.getValue();
            BigDecimal avg = values.stream()
                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                    .divide(new BigDecimal(values.size()), 2, RoundingMode.HALF_UP);

            BigDecimal lastValue = values.get(values.size() - 1);
            BigDecimal predicted;
            if (lastValue.compareTo(avg) > 0) {
                predicted = lastValue.multiply(new BigDecimal("1.03")).setScale(2, RoundingMode.HALF_UP);
            } else {
                predicted = avg.setScale(2, RoundingMode.HALF_UP);
            }

            forecast.put(entry.getKey(), predicted);
            totalForecast = totalForecast.add(predicted);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("forecastMonth",   LocalDate.now().plusMonths(1).getYear() + "-"
                + String.format("%02d", LocalDate.now().plusMonths(1).getMonthValue()));
        result.put("forecastByBlock", forecast);
        result.put("totalForecast",   totalForecast);
        result.put("method",          "Simple moving average (Flask AI service offline)");
        result.put("note",            "Start the Python Flask microservice for AI-powered predictions");
        return result;
    }

    // ──────────────────────────────────────────────
    // BLOCK-LEVEL COMPARISON
    // ──────────────────────────────────────────────

    public Map<String, Object> compareBlocks(LocalDate startDate, LocalDate endDate) {
        List<EnergyData> records = energyRepo.findByDateRange(startDate, endDate);

        Map<String, BigDecimal> totals = records.stream()
                .collect(Collectors.groupingBy(
                        EnergyData::getBlockCode,
                        Collectors.reducing(BigDecimal.ZERO, EnergyData::getConsumptionKwh, BigDecimal::add)
                ));

        Map<String, Long> recordCounts = records.stream()
                .collect(Collectors.groupingBy(EnergyData::getBlockCode, Collectors.counting()));

        Map<String, BigDecimal> averages = new HashMap<>();
        for (Map.Entry<String, BigDecimal> entry : totals.entrySet()) {
            long count = recordCounts.getOrDefault(entry.getKey(), 1L);
            averages.put(entry.getKey(),
                    entry.getValue().divide(new BigDecimal(count), 2, RoundingMode.HALF_UP));
        }

        Map<String, Object> comparison = new HashMap<>();
        comparison.put("period",   startDate + " to " + endDate);
        comparison.put("totals",   totals);
        comparison.put("averages", averages);
        comparison.put("records",  recordCounts);
        return comparison;
    }
}