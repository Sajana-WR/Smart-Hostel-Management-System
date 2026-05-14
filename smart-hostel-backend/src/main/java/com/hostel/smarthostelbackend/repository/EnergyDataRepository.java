package com.hostel.smarthostelbackend.repository;

import com.hostel.smarthostelbackend.entity.EnergyData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface EnergyDataRepository extends JpaRepository<EnergyData, Long> {

    // Find by block and date
    Optional<EnergyData> findByBlockCodeAndRecordDate(String blockCode, LocalDate recordDate);

    // Find all records for a specific block ordered by date
    List<EnergyData> findByBlockCodeOrderByRecordDateDesc(String blockCode);

    // Find all records for a specific date
    List<EnergyData> findByRecordDateOrderByBlockCode(LocalDate recordDate);

    // Find records between date range
    @Query("""
            SELECT e FROM EnergyData e
            WHERE e.recordDate BETWEEN :startDate AND :endDate
            ORDER BY e.recordDate ASC, e.blockCode ASC
            """)
    List<EnergyData> findByDateRange(@Param("startDate") LocalDate startDate,
                                     @Param("endDate") LocalDate endDate);

    // Find records for a block between date range
    @Query("""
            SELECT e FROM EnergyData e
            WHERE e.blockCode = :blockCode
            AND e.recordDate BETWEEN :startDate AND :endDate
            ORDER BY e.recordDate ASC
            """)
    List<EnergyData> findByBlockAndDateRange(@Param("blockCode") String blockCode,
                                             @Param("startDate") LocalDate startDate,
                                             @Param("endDate") LocalDate endDate);

    // Get latest record per block
    @Query("""
            SELECT e FROM EnergyData e
            WHERE e.recordDate = (
                SELECT MAX(e2.recordDate) FROM EnergyData e2
                WHERE e2.blockCode = e.blockCode
            )
            ORDER BY e.blockCode ASC
            """)
    List<EnergyData> findLatestPerBlock();

    // All ordered by date desc
    @Query("SELECT e FROM EnergyData e ORDER BY e.recordDate DESC, e.blockCode ASC")
    List<EnergyData> findAllOrderByDateDesc();
}