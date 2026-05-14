package com.hostel.smarthostelbackend.config;

import com.hostel.smarthostelbackend.entity.Room;
import com.hostel.smarthostelbackend.repository.RoomRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.dao.DataAccessException;

@Configuration
public class DataSeeder {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    @Bean
    CommandLineRunner seedRooms(RoomRepository roomRepository) {
        return args -> {
            try {

                if (roomRepository.count() > 0) {
                    log.info("ℹ️ Rooms already exist. Skipping seed.");
                    return;
                }

                roomRepository.save(new Room("A-101", "A", 1));
                roomRepository.save(new Room("A-102", "A", 1));
                roomRepository.save(new Room("A-201", "A", 2));
                roomRepository.save(new Room("B-101", "B", 1));

                log.info("✅ Rooms seeded successfully.");

            } catch (DataAccessException ex) {
                log.warn("⚠️ Skipping room seed — table not ready: {}",
                        ex.getMostSpecificCause() != null
                                ? ex.getMostSpecificCause().getMessage()
                                : ex.getMessage()
                );
            }
        };
    }
}