package com.hostel.smarthostelbackend.controller;

import com.hostel.smarthostelbackend.dto.ApiMessage;
import com.hostel.smarthostelbackend.entity.EnergyData;
import com.hostel.smarthostelbackend.entity.User;
import com.hostel.smarthostelbackend.repository.UserRepository;
import com.hostel.smarthostelbackend.security.JwtAuthenticationFilter.AuthPrincipal;
import com.hostel.smarthostelbackend.service.EnergyService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/energy")
@CrossOrigin(origins = "http://localhost:5173")
public class EnergyController {

    private final EnergyService energyService;
    private final UserRepository userRepo;

    public EnergyController(EnergyService energyService,
                            UserRepository userRepo) {
        this.energyService = energyService;
        this.userRepo      = userRepo;
    }

    // ═══════════════════════════════════════════════
    //  DATA ENTRY (Admin)
    // ═══════════════════════════════════════════════

    // ✅ Add energy record
    @PostMapping("/admin/records")
    public ResponseEntity<?> addRecord(@RequestBody Map<String, Object> body) {
        User admin = getAdmin();
        if (admin == null) return ResponseEntity.status(403).body(Map.of("message", "Admin access required"));

        EnergyData record = energyService.addRecord(
                admin,
                (String) body.get("blockCode"),
                (String) body.get("recordDate"),
                toBigDecimal(body.get("consumptionKwh")),
                toBigDecimal(body.get("costPerKwh")),
                toBigDecimal(body.get("meterReadingStart")),
                toBigDecimal(body.get("meterReadingEnd")),
                (String) body.get("notes")
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(record);
    }

    // ✅ Update energy record
    @PutMapping("/admin/records/{id}")
    public ResponseEntity<?> updateRecord(@PathVariable Long id,
                                          @RequestBody Map<String, Object> body) {
        User admin = getAdmin();
        if (admin == null) return ResponseEntity.status(403).body(Map.of("message", "Admin access required"));

        EnergyData record = energyService.updateRecord(
                id,
                toBigDecimal(body.get("consumptionKwh")),
                toBigDecimal(body.get("costPerKwh")),
                toBigDecimal(body.get("meterReadingStart")),
                toBigDecimal(body.get("meterReadingEnd")),
                (String) body.get("notes")
        );

        return ResponseEntity.ok(record);
    }

    // ✅ Delete energy record
    @DeleteMapping("/admin/records/{id}")
    public ResponseEntity<ApiMessage> deleteRecord(@PathVariable Long id) {
        User admin = getAdmin();
        if (admin == null) return ResponseEntity.status(403).build();

        energyService.deleteRecord(id);
        return ResponseEntity.ok(new ApiMessage("Energy record deleted successfully"));
    }

    // ═══════════════════════════════════════════════
    //  DATA RETRIEVAL (Admin)
    // ═══════════════════════════════════════════════

    // ✅ Get all records
    @GetMapping("/admin/records")
    public ResponseEntity<List<EnergyData>> getAllRecords() {
        return ResponseEntity.ok(energyService.getAllRecords());
    }

    // ✅ Get record by ID
    @GetMapping("/admin/records/{id}")
    public ResponseEntity<EnergyData> getRecordById(@PathVariable Long id) {
        return ResponseEntity.ok(energyService.getRecordById(id));
    }

    // ✅ Get records by block
    @GetMapping("/admin/records/by-block")
    public ResponseEntity<List<EnergyData>> getByBlock(@RequestParam String blockCode) {
        return ResponseEntity.ok(energyService.getByBlock(blockCode));
    }

    // ✅ Get records by date
    @GetMapping("/admin/records/by-date")
    public ResponseEntity<List<EnergyData>> getByDate(@RequestParam String date) {
        return ResponseEntity.ok(energyService.getByDate(LocalDate.parse(date)));
    }

    // ✅ Get records by date range
    @GetMapping("/admin/records/by-range")
    public ResponseEntity<List<EnergyData>> getByDateRange(@RequestParam String startDate,
                                                           @RequestParam String endDate) {
        return ResponseEntity.ok(energyService.getByDateRange(
                LocalDate.parse(startDate), LocalDate.parse(endDate)));
    }

    // ✅ Get latest reading per block
    @GetMapping("/admin/records/latest")
    public ResponseEntity<List<EnergyData>> getLatestPerBlock() {
        return ResponseEntity.ok(energyService.getLatestPerBlock());
    }

    // ═══════════════════════════════════════════════
    //  ANALYTICS & FORECAST (Admin)
    // ═══════════════════════════════════════════════

    // ✅ Dashboard analytics
    @GetMapping("/admin/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        return ResponseEntity.ok(energyService.getAnalytics());
    }

    // ✅ Monthly trend (for charts)
    @GetMapping("/admin/trend")
    public ResponseEntity<List<Map<String, Object>>> getMonthlyTrend(
            @RequestParam(defaultValue = "6") int months) {
        return ResponseEntity.ok(energyService.getMonthlyTrend(months));
    }

    // ✅ Simple forecast (backend fallback — Python Flask does LSTM)
    @GetMapping("/admin/forecast")
    public ResponseEntity<Map<String, Object>> getForecast() {
        return ResponseEntity.ok(energyService.getSimpleForecast());
    }

    // ✅ Block comparison
    @GetMapping("/admin/compare")
    public ResponseEntity<Map<String, Object>> compareBlocks(@RequestParam String startDate,
                                                             @RequestParam String endDate) {
        return ResponseEntity.ok(energyService.compareBlocks(
                LocalDate.parse(startDate), LocalDate.parse(endDate)));
    }

    // ═══════════════════════════════════════════════
    //  HELPERS
    // ═══════════════════════════════════════════════

    private User getAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;

        Object principal = auth.getPrincipal();
        String email;

        if (principal instanceof AuthPrincipal ap) {
            email = ap.getEmail();
        } else {
            email = principal.toString();
        }

        User user = userRepo.findByEmailIgnoreCase(email).orElse(null);
        if (user == null || !user.getRole().equalsIgnoreCase("ADMIN")) return null;
        return user;
    }

    private BigDecimal toBigDecimal(Object value) {
        if (value == null) return null;
        return new BigDecimal(value.toString());
    }
}