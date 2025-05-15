package com.airline.booking.controller;

import com.airline.booking.model.User;
import com.airline.booking.service.UserService;
import com.airline.booking.exception.ResourceNotFoundException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {
    
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserService userService;

    // ดึงข้อมูลผู้ใช้ทั้งหมด
    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        try {
            logger.debug("เริ่มการดึงข้อมูลผู้ใช้ทั้งหมด");
            List<User> users = userService.getAllUsers();
            logger.debug("ดึงข้อมูลผู้ใช้ทั้งหมดสำเร็จ จำนวน: {}", users.size());
            return new ResponseEntity<>(users, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้ทั้งหมด: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // ดึงข้อมูลผู้ใช้ตาม ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable(value = "id") String userId) {
        try {
            logger.debug("เริ่มการดึงข้อมูลผู้ใช้ตาม ID: {}", userId);
            User user = userService.getUserById(userId);
            logger.debug("ดึงข้อมูลผู้ใช้สำเร็จ: {}", user);
            return new ResponseEntity<>(user, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            logger.error("ไม่พบผู้ใช้กับ ID: {}", userId, e);
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // ค้นหาผู้ใช้ตามชื่อผู้ใช้
    @GetMapping("/username/{username}")
    public ResponseEntity<?> getUserByUsername(@PathVariable(value = "username") String username) {
        try {
            User user = userService.getUserByUsername(username);
            return new ResponseEntity<>(user, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการค้นหาผู้ใช้: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // สร้างผู้ใช้ใหม่
    @PostMapping(consumes = {"application/json", "application/json;charset=UTF-8"})
    public ResponseEntity<?> createUser(@RequestBody Map<String, Object> userMap) {
        try {
            // Create a new User entity
            User newUser = new User();
            
            // Generate a UUID for userId
            newUser.setUserId(UUID.randomUUID().toString());
            
            // Manually map the incoming JSON fields to User entity fields
            if (userMap.get("username") != null) {
                newUser.setUsername(userMap.get("username").toString());
            }
            if (userMap.get("password") != null) {
                newUser.setPassword(userMap.get("password").toString());
            }
            if (userMap.get("email") != null) {
                newUser.setEmail(userMap.get("email").toString());
            }
            if (userMap.get("firstName") != null) {
                newUser.setFirstName(userMap.get("firstName").toString());
            }
            if (userMap.get("lastName") != null) {
                newUser.setLastName(userMap.get("lastName").toString());
            }
            if (userMap.get("address") != null) {
                newUser.setAddress(userMap.get("address").toString());
            }
            if (userMap.get("phone") != null) {
                newUser.setPhone(userMap.get("phone").toString());
            }
            if (userMap.get("role") != null) {
                newUser.setRole(userMap.get("role").toString());
            }
            
            // Call service to save the user
            User createdUser = userService.createUser(newUser);
            
            return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error creating user: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    
    // อัปเดตข้อมูลผู้ใช้
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(
            @PathVariable(value = "id") String userId,
            @RequestBody User userDetails) {
        try {
            User updatedUser = userService.updateUser(userId, userDetails);
            return new ResponseEntity<>(updatedUser, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการอัปเดตผู้ใช้: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // ลบผู้ใช้
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable(value = "id") String userId) {
        try {
            userService.deleteUser(userId);
            
            Map<String, Boolean> response = new HashMap<>();
            response.put("deleted", Boolean.TRUE);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการลบผู้ใช้: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // เปลี่ยนรหัสผ่าน
    @PutMapping("/{id}/change-password")
    public ResponseEntity<?> changePassword(
            @PathVariable(value = "id") String userId,
            @RequestBody Map<String, String> passwordData) {
        try {
            String oldPassword = passwordData.get("oldPassword");
            String newPassword = passwordData.get("newPassword");
            
            if (oldPassword == null || newPassword == null) {
                throw new IllegalArgumentException("ต้องระบุทั้งรหัสผ่านเก่าและรหัสผ่านใหม่");
            }
            
            userService.changePassword(userId, oldPassword, newPassword);
            
            Map<String, Boolean> response = new HashMap<>();
            response.put("changed", Boolean.TRUE);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}