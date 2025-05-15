package com.airline.booking.repository;

import com.airline.booking.model.LoyaltyPoints;
import com.airline.booking.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface LoyaltyPointsRepository extends JpaRepository<LoyaltyPoints, String> {
    
    // Find by user - correct way to map to your actual database schema
    List<LoyaltyPoints> findByUser(User user);
    
    // Find by userId - direct query that matches your schema
    List<LoyaltyPoints> findByUserId(String userId);
    
    // Get first loyalty points record for a user
    default Optional<LoyaltyPoints> findFirstByUserId(String userId) {
        List<LoyaltyPoints> points = findByUserId(userId);
        return points.isEmpty() ? Optional.empty() : Optional.of(points.get(0));
    }
    
    // Calculate total points for a user
    @Query("SELECT SUM(lp.pointsBalance) FROM LoyaltyPoints lp WHERE lp.userId = :userId")
    Integer calculateTotalPointsByUserId(@Param("userId") String userId);
    
    // Find points with expiry date before a given date
    List<LoyaltyPoints> findByPointsExpiryDateBefore(LocalDate expiryDate);
    
    // Find points expiring soon for a specific user
    @Query("SELECT lp FROM LoyaltyPoints lp WHERE lp.userId = :userId " +
           "AND lp.pointsExpiryDate BETWEEN :startDate AND :endDate")
    List<LoyaltyPoints> findExpiringPointsByUserId(
            @Param("userId") String userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}