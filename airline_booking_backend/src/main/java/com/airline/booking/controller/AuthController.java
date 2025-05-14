package com.airline.booking.controller;

import com.airline.booking.model.User;
import com.airline.booking.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        try {
            String username = loginData.get("username");
            String password = loginData.get("password");
            
            if (username == null || password == null) {
                throw new IllegalArgumentException("ต้องระบุทั้งชื่อผู้ใช้และรหัสผ่าน");
            }
            
            User user = userService.login(username, password);
            
            // สร้าง response พร้อม token (ถ้ามีการใช้ JWT)
            Map<String, Object> response = new HashMap<>();
            response.put("user", user);
            response.put("token", "test-jwt-token-" + System.currentTimeMillis()); // ควรใช้ library สร้าง JWT จริง
            response.put("success", true);
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
            return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            User newUser = userService.createUser(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("user", newUser);
            response.put("success", true);
            
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการลงทะเบียน: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}