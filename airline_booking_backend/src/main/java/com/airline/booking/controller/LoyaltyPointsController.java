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
     * Add points to user account (เมธอดเดิม)
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
    
    /**
     * Add loyalty points with details (เมธอดใหม่สำหรับรองรับการเรียกจาก Frontend ของคุณ)
     */
    @PostMapping("")
    public ResponseEntity<?> addLoyaltyPoints(@RequestBody Map<String, Object> request) {
        try {
            logger.debug("Adding loyalty points with details: {}", request);
            
            // ดึงข้อมูลจาก request
            String userId = (String) request.get("userId");
            Integer points = Integer.valueOf(request.get("points").toString());
            String bookingId = (String) request.get("bookingId");
            String description = (String) request.get("description");
            
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
            
            // Prepare response
            Map<String, Object> response = new HashMap<>();
            response.put("userId", userId);
            response.put("pointsAdded", points);
            response.put("totalPoints", loyaltyPoints.getPointsBalance());
            response.put("pointsExpiryDate", loyaltyPoints.getPointsExpiryDate());
            response.put("bookingId", bookingId);
            response.put("description", description);
            
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
    
    /**
     * Use loyalty points for discount
     */
    @PostMapping("/use")
    public ResponseEntity<?> useLoyaltyPoints(@RequestBody Map<String, Object> request) {
        try {
            logger.debug("Using loyalty points: {}", request);
            
            // ดึงข้อมูลจาก request
            String userId = (String) request.get("userId");
            Integer points = Integer.valueOf(request.get("points").toString());
            String bookingId = (String) request.get("bookingId");
            String description = (String) request.get("description");
            
            if (points <= 0) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Points must be greater than 0");
                return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
            }
            
            // Check if user exists
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
            
            // Find existing points
            Optional<LoyaltyPoints> existingPoints = loyaltyPointsRepository.findFirstByUserId(userId);
            
            if (existingPoints.isEmpty() || existingPoints.get().getPointsBalance() < points) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Insufficient points available");
                return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
            }
            
            LoyaltyPoints loyaltyPoints = existingPoints.get();
            boolean success = loyaltyPoints.usePoints(points);
            
            if (!success) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Could not use points. Insufficient balance.");
                return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
            }
            
            loyaltyPointsRepository.save(loyaltyPoints);
            logger.debug("Points used successfully: {}", loyaltyPoints);
            
            // Prepare response
            Map<String, Object> response = new HashMap<>();
            response.put("userId", userId);
            response.put("pointsUsed", points);
            response.put("remainingPoints", loyaltyPoints.getPointsBalance());
            response.put("bookingId", bookingId);
            response.put("description", description);
            
            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (ResourceNotFoundException e) {
            logger.error("User not found: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.error("Error using loyalty points: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error using loyalty points: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Get loyalty points history for user
     */
    @GetMapping("/history/{userId}")
    public ResponseEntity<?> getLoyaltyPointsHistory(@PathVariable String userId) {
        try {
            logger.debug("Getting loyalty points history for user ID: {}", userId);
            
            // Check if user exists
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
            
            // Get all points records for the user
            List<LoyaltyPoints> pointsHistory = loyaltyPointsRepository.findByUserId(userId);
            
            return new ResponseEntity<>(pointsHistory, HttpStatus.OK);
            
        } catch (ResourceNotFoundException e) {
            logger.warn("User not found: {}", e.getMessage());
            return new ResponseEntity<>(List.of(), HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error retrieving loyalty points history: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error retrieving loyalty points history: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Get loyalty points balance for user
     */
    @GetMapping("/balance/{userId}")
    public ResponseEntity<?> getLoyaltyPointsBalance(@PathVariable String userId) {
        try {
            logger.debug("Getting loyalty points balance for user ID: {}", userId);
            
            // Check if user exists
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
            
            // Calculate total points
            Integer totalPoints = loyaltyPointsRepository.calculateTotalPointsByUserId(userId);
            
            if (totalPoints == null) {
                totalPoints = 0;
            }
            
            // Create response
            Map<String, Object> response = new HashMap<>();
            response.put("userId", userId);
            response.put("totalPoints", totalPoints);
            
            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (ResourceNotFoundException e) {
            logger.warn("User not found: {}", e.getMessage());
            
            // Return zero points for non-existent users
            Map<String, Object> response = new HashMap<>();
            response.put("userId", userId);
            response.put("totalPoints", 0);
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error retrieving loyalty points balance: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error retrieving loyalty points balance: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}