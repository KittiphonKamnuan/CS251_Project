package com.airline.booking.controller;

import com.airline.booking.model.LoyaltyPoints;
import com.airline.booking.model.User;
import com.airline.booking.repository.LoyaltyPointsRepository;
import com.airline.booking.repository.UserRepository;
import com.airline.booking.exception.ResourceNotFoundException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/loyalty-points")
@CrossOrigin(origins = "*")
public class LoyaltyPointsController {

    private static final Logger logger = LoggerFactory.getLogger(LoyaltyPointsController.class);

    @Autowired
    private LoyaltyPointsRepository loyaltyPointsRepository;
    
    @Autowired
    private UserRepository userRepository;

    /**
     * Get user's loyalty points
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserLoyaltyPoints(@PathVariable String userId) {
        try {
            logger.debug("Fetching loyalty points for user ID: {}", userId);
            
            // Check if user exists
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
            
            // Try to get loyalty points
            List<LoyaltyPoints> userPointsList = loyaltyPointsRepository.findByUserId(userId);
            
            // Calculate total points
            Integer totalPoints = 0;
            LocalDate latestExpiryDate = LocalDate.now().plusYears(1);
            
            if (!userPointsList.isEmpty()) {
                // Sum up points and find latest expiry date
                for (LoyaltyPoints points : userPointsList) {
                    if (points.getPointsBalance() != null) {
                        totalPoints += points.getPointsBalance();
                    }
                    
                    if (points.getPointsExpiryDate() != null && 
                        points.getPointsExpiryDate().isAfter(latestExpiryDate)) {
                        latestExpiryDate = points.getPointsExpiryDate();
                    }
                }
            } else {
                // If no points found, create a new record with 0 points
                LoyaltyPoints newPoints = new LoyaltyPoints();
                newPoints.setLoyaltyId("LP" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
                newPoints.setUser(user);
                newPoints.setUserId(userId);
                newPoints.setPointsBalance(0);
                newPoints.setPointsExpiryDate(latestExpiryDate);
                
                try {
                    loyaltyPointsRepository.save(newPoints);
                    logger.debug("Created new loyalty points record for user: {}", userId);
                } catch (Exception e) {
                    logger.warn("Could not create new loyalty points record: {}", e.getMessage());
                    // Continue even if save fails
                }
            }
            
            // Create response object
            Map<String, Object> response = new HashMap<>();
            response.put("userId", userId);
            response.put("totalPoints", totalPoints);
            response.put("pointsExpiryDate", latestExpiryDate);
            
            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (ResourceNotFoundException e) {
            logger.warn("User not found: {}", e.getMessage());
            
            // Return empty points object
            Map<String, Object> defaultResponse = new HashMap<>();
            defaultResponse.put("userId", userId);
            defaultResponse.put("totalPoints", 0);
            defaultResponse.put("pointsExpiryDate", LocalDate.now().plusYears(1));
            
            return new ResponseEntity<>(defaultResponse, HttpStatus.OK);
            
        } catch (Exception e) {
            logger.error("Error retrieving loyalty points: {}", e.getMessage(), e);
            
            // Return empty points object even for server errors
            Map<String, Object> defaultResponse = new HashMap<>();
            defaultResponse.put("userId", userId);
            defaultResponse.put("totalPoints", 0);
            defaultResponse.put("pointsExpiryDate", LocalDate.now().plusYears(1));
            
            return new ResponseEntity<>(defaultResponse, HttpStatus.OK);
        }
    }
    
    /**
     * Add points to user account
     */
    @PostMapping("/user/{userId}/add")
    public ResponseEntity<?> addPoints(
            @PathVariable String userId, 
            @RequestParam int points) {
        try {
            logger.debug("Adding {} points for user ID: {}", points, userId);
            
            if (points <= 0) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Points must be greater than 0");
                return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
            }
            
            // Check if user exists
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
            
            // Find existing points or create new record
            Optional<LoyaltyPoints> existingPoints = loyaltyPointsRepository.findFirstByUserId(userId);
            LoyaltyPoints loyaltyPoints;
            
            if (existingPoints.isPresent()) {
                loyaltyPoints = existingPoints.get();
                loyaltyPoints.addPoints(points);
                // Extend expiry date
                loyaltyPoints.setPointsExpiryDate(LocalDate.now().plusYears(1));
            } else {
                loyaltyPoints = new LoyaltyPoints();
                loyaltyPoints.setLoyaltyId("LP" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
                loyaltyPoints.setUser(user);
                loyaltyPoints.setUserId(userId);
                loyaltyPoints.setPointsBalance(points);
                loyaltyPoints.setPointsExpiryDate(LocalDate.now().plusYears(1));
            }
            
            loyaltyPointsRepository.save(loyaltyPoints);
            logger.debug("Points added successfully: {}", loyaltyPoints);
            
            // Create response object
            Map<String, Object> response = new HashMap<>();
            response.put("userId", userId);
            response.put("pointsAdded", points);
            response.put("totalPoints", loyaltyPoints.getPointsBalance());
            response.put("pointsExpiryDate", loyaltyPoints.getPointsExpiryDate());
            
            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (ResourceNotFoundException e) {
            logger.error("User not found: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.error("Error adding loyalty points: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error adding loyalty points: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}