package com.hostel.smarthostelbackend.repository;

import com.hostel.smarthostelbackend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Get notifications for a specific user (personal + broadcast)
    @Query("""
            SELECT n FROM Notification n
            WHERE n.status = 'SENT'
            AND (n.user.id = :userId OR n.target = 'ALL')
            ORDER BY n.sentAt DESC
            """)
    List<Notification> findNotificationsForUser(@Param("userId") Long userId);

    // Get all notifications for a user (including unread)
    @Query("""
            SELECT n FROM Notification n
            WHERE (n.user.id = :userId OR n.target = 'ALL')
            AND n.status = 'SENT'
            ORDER BY n.sentAt DESC
            """)
    List<Notification> findAllForUser(@Param("userId") Long userId);

    // Count unread for a user
    @Query("""
            SELECT COUNT(n) FROM Notification n
            WHERE n.status = 'SENT'
            AND n.read = false
            AND (n.user.id = :userId OR n.target = 'ALL')
            """)
    long countUnreadForUser(@Param("userId") Long userId);

    // Admin: find by status
    List<Notification> findByStatusOrderByCreatedAtDesc(Notification.Status status);

    // Admin: find by type
    List<Notification> findByTypeOrderByCreatedAtDesc(Notification.Type type);

    // Admin: all ordered by latest
    @Query("SELECT n FROM Notification n ORDER BY n.createdAt DESC")
    List<Notification> findAllOrderByCreatedAtDesc();
}