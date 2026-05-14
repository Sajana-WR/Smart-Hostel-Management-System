package com.hostel.smarthostelbackend.controller;

import com.hostel.smarthostelbackend.entity.NearbyService;
import com.hostel.smarthostelbackend.repository.NearbyServiceRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/nearby-services")
@CrossOrigin(origins = "http://localhost:5173")
public class NearbyServiceController {

    private final NearbyServiceRepository repo;

    public NearbyServiceController(NearbyServiceRepository repo) {
        this.repo = repo;
    }

    // ✅ GET all — public (for student & canteen view)
    @GetMapping
    public ResponseEntity<List<NearbyService>> getAll() {
        return ResponseEntity.ok(repo.findAllByOrderByIdAsc());
    }

    // ✅ ADD new — admin only
    @PostMapping("/admin")
    public ResponseEntity<NearbyService> add(@RequestBody Map<String, String> body) {
        NearbyService s = new NearbyService();
        s.setName(body.get("name"));
        s.setDescription(body.get("description"));
        s.setDistance(body.get("distance"));
        s.setCategory(body.get("category"));
        return ResponseEntity.ok(repo.save(s));
    }

    // ✅ UPDATE — admin only
    @PutMapping("/admin/{id}")
    public ResponseEntity<NearbyService> update(@PathVariable Long id,
                                                @RequestBody Map<String, String> body) {
        NearbyService s = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found"));
        if (body.get("name") != null)        s.setName(body.get("name"));
        if (body.get("description") != null) s.setDescription(body.get("description"));
        if (body.get("distance") != null)    s.setDistance(body.get("distance"));
        if (body.get("category") != null)    s.setCategory(body.get("category"));
        return ResponseEntity.ok(repo.save(s));
    }

    // ✅ DELETE — admin only
    @DeleteMapping("/admin/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        repo.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Deleted successfully"));
    }
}