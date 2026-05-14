package com.hostel.smarthostelbackend.repository;

import com.hostel.smarthostelbackend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // ✅ Finders
    Optional<User> findByEmailIgnoreCase(String email);

    Optional<User> findByUsernameIgnoreCase(String username);

    // ✅ Exists checks
    boolean existsByEmailIgnoreCase(String email);

    boolean existsByUsernameIgnoreCase(String username);

    // ✅ Get all users except one (used for matching / admin lists)
    @Query("""
            SELECT u
            FROM User u
            WHERE u.id <> :id
            ORDER BY u.id ASC
            """)
    List<User> findAllExcept(@Param("id") Long id);

    // ✅ Get all students only
    @Query("""
            SELECT u
            FROM User u
            WHERE LOWER(u.role) = 'student'
            ORDER BY u.id ASC
            """)
    List<User> findAllStudents();

    // ✅ Approval system — students filtered by status
    @Query("""
            SELECT u
            FROM User u
            WHERE LOWER(u.role) = LOWER(:role)
              AND LOWER(u.status) = LOWER(:status)
            ORDER BY u.createdAt DESC
            """)
    List<User> findByRoleAndStatus(@Param("role") String role, @Param("status") String status);

    // ✅ Approval system — all students regardless of status
    @Query("""
            SELECT u
            FROM User u
            WHERE LOWER(u.role) = LOWER(:role)
            ORDER BY u.createdAt DESC
            """)
    List<User> findByRole(@Param("role") String role);
}