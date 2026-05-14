package com.hostel.smarthostelbackend.repository;

import com.hostel.smarthostelbackend.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    List<Complaint> findByUser_Id(Long userId);

    List<Complaint> findByStatus(Complaint.Status status);

    @Query("SELECT c FROM Complaint c WHERE c.user.id = :userId ORDER BY c.createdAt DESC")
    List<Complaint> findUserComplaints(@Param("userId") Long userId);

    @Query("SELECT c FROM Complaint c ORDER BY c.createdAt DESC")
    List<Complaint> findAllComplaints();

    List<Complaint> findByUserId(Long userId);
}