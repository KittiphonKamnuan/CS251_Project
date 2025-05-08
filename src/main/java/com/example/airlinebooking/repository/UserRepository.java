// src/main/java/com/example/airlinebooking/repository/UserRepository.java
package com.example.airlinebooking.repository;

import com.example.airlinebooking.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByUsername(String username);
}