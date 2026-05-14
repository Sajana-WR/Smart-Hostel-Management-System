package com.hostel.smarthostelbackend.controller;

import com.hostel.smarthostelbackend.dto.ApiMessage;
import com.hostel.smarthostelbackend.entity.MealOrder;
import com.hostel.smarthostelbackend.entity.MenuItem;
import com.hostel.smarthostelbackend.entity.User;
import com.hostel.smarthostelbackend.repository.UserRepository;
import com.hostel.smarthostelbackend.service.CanteenService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/canteen")
@CrossOrigin(origins = "http://localhost:5173")
public class CanteenController {

    private final CanteenService canteenService;
    private final UserRepository userRepo;

    public CanteenController(CanteenService canteenService,
                             UserRepository userRepo) {
        this.canteenService = canteenService;
        this.userRepo       = userRepo;
    }

    // ═══════════════════════════════════════════════
    //  STUDENT-FACING ENDPOINTS
    // ═══════════════════════════════════════════════

    @GetMapping("/menu/today")
    public ResponseEntity<List<MenuItem>> getTodayMenu() {
        return ResponseEntity.ok(canteenService.getTodayMenu());
    }

    @PostMapping("/orders")
    public ResponseEntity<?> placeOrder(@RequestBody Map<String, Object> body,
                                        Authentication authentication) {
        User student = null;

        // Try studentId from body first
        if (body.get("studentId") != null) {
            Long studentId = Long.parseLong(body.get("studentId").toString());
            student = userRepo.findById(studentId).orElse(null);
        }

        // Fallback to JWT auth
        if (student == null) {
            student = getUserByAuth(authentication);
        }

        if (student == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        MealOrder order = canteenService.placeOrder(
                student,
                (String) body.get("mealType"),
                (String) body.get("orderDate"),
                (String) body.get("timeSlot"),
                body.get("quantity") != null
                        ? Integer.parseInt(body.get("quantity").toString()) : 1,
                (String) body.getOrDefault("specialNotes", "")
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Order placed successfully",
                        "orderId", order.getId()));
    }

    @GetMapping("/orders/my")
    public ResponseEntity<?> getMyOrders(Authentication authentication) {
        User student = getUserByAuth(authentication);
        if (student == null)
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        return ResponseEntity.ok(canteenService.getMyOrders(student.getId()));
    }

    // ═══════════════════════════════════════════════
    //  ADMIN — MENU MANAGEMENT
    // ═══════════════════════════════════════════════

    @PostMapping("/menu")
    public ResponseEntity<MenuItem> addMenuItem(@RequestBody MenuItem item) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(canteenService.addMenuItem(item));
    }

    @GetMapping("/admin/menu/all")
    public ResponseEntity<List<MenuItem>> getAllMenuItems() {
        return ResponseEntity.ok(canteenService.getAllMenuItems());
    }

    @GetMapping("/admin/menu/{id}")
    public ResponseEntity<MenuItem> getMenuItemById(@PathVariable Long id) {
        return ResponseEntity.ok(canteenService.getMenuItemById(id));
    }

    @PutMapping("/admin/menu/{id}")
    public ResponseEntity<MenuItem> updateMenuItem(@PathVariable Long id,
                                                   @RequestBody Map<String, Object> body) {
        String itemName   = (String) body.get("itemName");
        String mealType   = (String) body.get("mealType");
        BigDecimal price  = body.get("price") != null
                ? new BigDecimal(body.get("price").toString()) : null;
        Boolean available = (Boolean) body.get("available");
        return ResponseEntity.ok(
                canteenService.updateMenuItem(id, itemName, mealType, price, available));
    }

    @DeleteMapping("/admin/menu/{id}")
    public ResponseEntity<ApiMessage> deleteMenuItem(@PathVariable Long id) {
        canteenService.deleteMenuItem(id);
        return ResponseEntity.ok(new ApiMessage("Menu item deleted successfully"));
    }

    @PutMapping("/admin/menu/{id}/toggle")
    public ResponseEntity<MenuItem> toggleAvailability(@PathVariable Long id) {
        return ResponseEntity.ok(canteenService.toggleAvailability(id));
    }

    @GetMapping("/admin/menu/by-date")
    public ResponseEntity<List<MenuItem>> getMenuByDate(@RequestParam String date) {
        return ResponseEntity.ok(canteenService.getMenuByDate(LocalDate.parse(date)));
    }

    // ═══════════════════════════════════════════════
    //  ADMIN — ORDER MANAGEMENT
    // ═══════════════════════════════════════════════

    @GetMapping("/orders")
    public ResponseEntity<List<MealOrder>> getAllOrders() {
        return ResponseEntity.ok(canteenService.getAllOrders());
    }

    @GetMapping("/admin/orders/{id}")
    public ResponseEntity<MealOrder> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(canteenService.getOrderById(id));
    }

    @PutMapping("/admin/orders/{id}/status")
    public ResponseEntity<MealOrder> updateOrderStatus(@PathVariable Long id,
                                                       @RequestParam String status) {
        return ResponseEntity.ok(canteenService.updateOrderStatus(id, status));
    }

    @GetMapping("/admin/orders/by-status")
    public ResponseEntity<List<MealOrder>> getOrdersByStatus(@RequestParam String status) {
        return ResponseEntity.ok(canteenService.getOrdersByStatus(status));
    }

    @GetMapping("/admin/orders/by-date")
    public ResponseEntity<List<MealOrder>> getOrdersByDate(@RequestParam String date) {
        return ResponseEntity.ok(canteenService.getOrdersByDate(LocalDate.parse(date)));
    }

    @DeleteMapping("/admin/orders/{id}")
    public ResponseEntity<ApiMessage> deleteOrder(@PathVariable Long id) {
        canteenService.deleteOrder(id);
        return ResponseEntity.ok(new ApiMessage("Order deleted successfully"));
    }

    @GetMapping("/admin/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        return ResponseEntity.ok(canteenService.getCanteenAnalytics());
    }

    // ═══════════════════════════════════════════════
    //  HELPER
    // ═══════════════════════════════════════════════

    private User getUserByAuth(Authentication authentication) {
        if (authentication == null) return null;
        String name = authentication.getName();
        return userRepo.findByEmailIgnoreCase(name)
                .or(() -> userRepo.findByUsernameIgnoreCase(name))
                .orElse(null);
    }
}