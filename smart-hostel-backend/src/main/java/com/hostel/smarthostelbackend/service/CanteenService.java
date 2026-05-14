package com.hostel.smarthostelbackend.service;

import com.hostel.smarthostelbackend.entity.MealOrder;
import com.hostel.smarthostelbackend.entity.MenuItem;
import com.hostel.smarthostelbackend.entity.User;
import com.hostel.smarthostelbackend.exception.AppException;
import com.hostel.smarthostelbackend.repository.MealOrderRepository;
import com.hostel.smarthostelbackend.repository.MenuItemRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CanteenService {

    private final MenuItemRepository menuItemRepo;
    private final MealOrderRepository mealOrderRepo;

    public CanteenService(MenuItemRepository menuItemRepo,
                          MealOrderRepository mealOrderRepo) {
        this.menuItemRepo  = menuItemRepo;
        this.mealOrderRepo = mealOrderRepo;
    }

    // ──────────────────────────────────────────────
    // STUDENT-FACING (Menu & Orders)
    // ──────────────────────────────────────────────

    /**
     * Get today's available menu items.
     */
    public List<MenuItem> getTodayMenu() {
        return menuItemRepo.findByDateAndAvailableTrue(LocalDate.now());
    }

    /**
     * Place a meal order.
     */
    @Transactional
    public MealOrder placeOrder(User student, String mealType, String orderDate,
                                String timeSlot, int quantity, String specialNotes) {
        if (mealType == null || mealType.trim().isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Meal type is required");
        }
        if (orderDate == null || orderDate.trim().isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Order date is required");
        }
        if (timeSlot == null || timeSlot.trim().isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Time slot is required");
        }

        MealOrder order = new MealOrder();
        order.setStudent(student);
        order.setMealType(mealType.trim());
        order.setOrderDate(LocalDate.parse(orderDate));
        order.setTimeSlot(timeSlot.trim());
        order.setQuantity(quantity > 0 ? quantity : 1);
        order.setSpecialNotes(specialNotes != null ? specialNotes.trim() : "");

        return mealOrderRepo.save(order);
    }

    /**
     * Get a student's own orders.
     */
    public List<MealOrder> getMyOrders(Long studentId) {
        return mealOrderRepo.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    // ──────────────────────────────────────────────
    // ADMIN-FACING (Menu Management)
    // ──────────────────────────────────────────────

    /**
     * Add a new menu item (admin only).
     */
    @Transactional
    public MenuItem addMenuItem(MenuItem item) {
        if (item.getItemName() == null || item.getItemName().trim().isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Item name is required");
        }
        if (item.getPrice() == null || item.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Valid price is required");
        }
        if (item.getMealType() == null || item.getMealType().trim().isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Meal type is required");
        }
        if (item.getDate() == null) {
            item.setDate(LocalDate.now());
        }
        return menuItemRepo.save(item);
    }

    /**
     * Update an existing menu item (admin only).
     */
    @Transactional
    public MenuItem updateMenuItem(Long id, String itemName, String mealType,
                                   BigDecimal price, Boolean available) {
        MenuItem item = menuItemRepo.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Menu item not found with id: " + id));

        if (itemName != null && !itemName.trim().isEmpty()) {
            item.setItemName(itemName.trim());
        }
        if (mealType != null && !mealType.trim().isEmpty()) {
            item.setMealType(mealType.trim());
        }
        if (price != null && price.compareTo(BigDecimal.ZERO) > 0) {
            item.setPrice(price);
        }
        if (available != null) {
            item.setAvailable(available);
        }

        return menuItemRepo.save(item);
    }

    /**
     * Delete a menu item (admin only).
     */
    @Transactional
    public void deleteMenuItem(Long id) {
        MenuItem item = menuItemRepo.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Menu item not found with id: " + id));
        menuItemRepo.delete(item);
    }

    /**
     * Toggle menu item availability (admin only).
     */
    @Transactional
    public MenuItem toggleAvailability(Long id) {
        MenuItem item = menuItemRepo.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Menu item not found with id: " + id));
        item.setAvailable(!item.isAvailable());
        return menuItemRepo.save(item);
    }

    /**
     * Get all menu items (admin — includes unavailable).
     */
    public List<MenuItem> getAllMenuItems() {
        return menuItemRepo.findAll();
    }

    /**
     * Get menu items by date (admin only).
     */
    public List<MenuItem> getMenuByDate(LocalDate date) {
        return menuItemRepo.findByDateAndAvailableTrue(date);
    }

    /**
     * Get a single menu item by ID.
     */
    public MenuItem getMenuItemById(Long id) {
        return menuItemRepo.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Menu item not found with id: " + id));
    }

    // ──────────────────────────────────────────────
    // ADMIN-FACING (Order Management)
    // ──────────────────────────────────────────────

    /**
     * Get ALL orders (admin only).
     */
    public List<MealOrder> getAllOrders() {
        return mealOrderRepo.findAll();
    }

    /**
     * Get a single order by ID (admin only).
     */
    public MealOrder getOrderById(Long id) {
        return mealOrderRepo.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Order not found with id: " + id));
    }

    /**
     * Update order status: PENDING → CONFIRMED or CANCELLED (admin only).
     */
    @Transactional
    public MealOrder updateOrderStatus(Long orderId, String status) {
        MealOrder order = mealOrderRepo.findById(orderId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Order not found with id: " + orderId));

        String upper = status.toUpperCase().trim();
        if (!upper.equals("PENDING") && !upper.equals("CONFIRMED") && !upper.equals("CANCELLED")) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Invalid status. Use: PENDING, CONFIRMED, or CANCELLED");
        }

        order.setStatus(upper);
        return mealOrderRepo.save(order);
    }

    /**
     * Get orders filtered by status (admin only).
     */
    public List<MealOrder> getOrdersByStatus(String status) {
        return mealOrderRepo.findAll().stream()
                .filter(o -> o.getStatus().equalsIgnoreCase(status))
                .collect(Collectors.toList());
    }

    /**
     * Get orders filtered by date (admin only).
     */
    public List<MealOrder> getOrdersByDate(LocalDate date) {
        return mealOrderRepo.findAll().stream()
                .filter(o -> o.getOrderDate().equals(date))
                .collect(Collectors.toList());
    }

    /**
     * Delete an order (admin only).
     */
    @Transactional
    public void deleteOrder(Long orderId) {
        MealOrder order = mealOrderRepo.findById(orderId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Order not found with id: " + orderId));
        mealOrderRepo.delete(order);
    }

    // ──────────────────────────────────────────────
    // ADMIN DASHBOARD / ANALYTICS
    // ──────────────────────────────────────────────

    /**
     * Canteen analytics for admin dashboard.
     */
    public Map<String, Object> getCanteenAnalytics() {
        List<MealOrder> allOrders = mealOrderRepo.findAll();
        List<MenuItem> allItems   = menuItemRepo.findAll();

        long totalOrders     = allOrders.size();
        long pendingOrders   = allOrders.stream().filter(o -> "PENDING".equalsIgnoreCase(o.getStatus())).count();
        long confirmedOrders = allOrders.stream().filter(o -> "CONFIRMED".equalsIgnoreCase(o.getStatus())).count();
        long cancelledOrders = allOrders.stream().filter(o -> "CANCELLED".equalsIgnoreCase(o.getStatus())).count();

        // Today's orders
        long todayOrders = allOrders.stream()
                .filter(o -> o.getOrderDate().equals(LocalDate.now()))
                .count();

        // Orders by meal type
        Map<String, Long> byMealType = allOrders.stream()
                .collect(Collectors.groupingBy(MealOrder::getMealType, Collectors.counting()));

        // Total menu items
        long totalMenuItems    = allItems.size();
        long availableItems    = allItems.stream().filter(MenuItem::isAvailable).count();
        long unavailableItems  = totalMenuItems - availableItems;

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalOrders",      totalOrders);
        analytics.put("pendingOrders",    pendingOrders);
        analytics.put("confirmedOrders",  confirmedOrders);
        analytics.put("cancelledOrders",  cancelledOrders);
        analytics.put("todayOrders",      todayOrders);
        analytics.put("byMealType",       byMealType);
        analytics.put("totalMenuItems",   totalMenuItems);
        analytics.put("availableItems",   availableItems);
        analytics.put("unavailableItems", unavailableItems);
        return analytics;
    }
}