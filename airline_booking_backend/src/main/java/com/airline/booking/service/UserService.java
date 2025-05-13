package com.airline.booking.service;

import com.airline.booking.model.User;
import com.airline.booking.repository.UserRepository;
import com.airline.booking.exception.ResourceNotFoundException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;

@Service
public class UserService {
    
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private UserRepository userRepository;

    // ดึงผู้ใช้ทั้งหมด
    public List<User> getAllUsers() {
        logger.debug("ดึงข้อมูลผู้ใช้ทั้งหมด");
        return userRepository.findAll();
    }

    // ดึงผู้ใช้ตาม ID
    public User getUserById(String userId) {
        logger.debug("ดึงข้อมูลผู้ใช้ตาม ID: {}", userId);
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("ไม่พบผู้ใช้กับรหัส: " + userId));
    }

    // ดึงผู้ใช้ตามชื่อผู้ใช้
    public User getUserByUsername(String username) {
        logger.debug("ดึงข้อมูลผู้ใช้ตามชื่อผู้ใช้: {}", username);
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new ResourceNotFoundException("ไม่พบผู้ใช้กับชื่อผู้ใช้: " + username);
        }
        return user;
    }

    // สร้างผู้ใช้ใหม่
    public User createUser(User user) {
        logger.debug("สร้างผู้ใช้ใหม่: {}", user.getUsername());
        
        // ตรวจสอบว่ามีชื่อผู้ใช้หรืออีเมลนี้ในระบบแล้วหรือไม่
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว");
        }

        if (user.getEmail() != null && userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("อีเมลนี้มีอยู่ในระบบแล้ว");
        }

        // สร้าง ID ใหม่ถ้ายังไม่มีการกำหนด หรือใช้รหัสที่สั้นกว่าเพื่อให้ตรงกับข้อจำกัดของฐานข้อมูล
        if (user.getUserId() == null || user.getUserId().isEmpty()) {
            // สร้างรหัสแบบสั้น ความยาวไม่เกิน 20 ตัวอักษร
            user.setUserId(generateShortUserId());
            logger.debug("สร้าง ID ใหม่: {}", user.getUserId());
        } else if (user.getUserId().length() > 20) {
            // ถ้า ID ที่กำหนดยาวเกินไป ตัดให้เหลือไม่เกิน 20 ตัวอักษร
            user.setUserId(user.getUserId().substring(0, 20));
            logger.debug("ตัด ID ให้สั้นลง: {}", user.getUserId());
        }

        // ตั้งค่าบทบาทเริ่มต้นเป็น USER ถ้าไม่ได้ระบุ
        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("USER");
        }

        // ในระบบจริงควรมีการเข้ารหัสรหัสผ่านด้วย
        // user.setPassword(passwordEncoder.encode(user.getPassword()));

        return userRepository.save(user);
    }

    // สร้าง ID แบบสั้นที่ไม่ซ้ำกัน (ความยาวไม่เกิน 20 ตัวอักษร)
    private String generateShortUserId() {
        // สร้างรหัส prefix ตามประเภทข้อมูล
        String prefix = "USR";
        
        // สร้างตัวเลขสุ่ม 8 หลัก
        Random random = new Random();
        int randomNumber = 10000000 + random.nextInt(90000000);
        
        // สร้าง timestamp เป็น milliseconds (ตัดเหลือ 8 หลักสุดท้าย)
        String timestamp = String.valueOf(System.currentTimeMillis()).substring(5);
        
        // รวมกันให้เป็นรหัส format: USR-[randomNumber]-[timestamp]
        return prefix + "-" + randomNumber + "-" + timestamp.substring(0, 3);
    }

    // อัปเดตข้อมูลผู้ใช้
    public User updateUser(String userId, User userDetails) {
        logger.debug("อัปเดตข้อมูลผู้ใช้ ID: {}", userId);
        User user = getUserById(userId);
        
        // อัปเดตข้อมูลเฉพาะฟิลด์ที่ไม่ใช่ null
        if (userDetails.getUsername() != null) {
            // ตรวจสอบว่าชื่อผู้ใช้ไม่ซ้ำกับผู้ใช้อื่น
            if (!userDetails.getUsername().equals(user.getUsername()) && 
                userRepository.existsByUsername(userDetails.getUsername())) {
                throw new RuntimeException("ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว");
            }
            user.setUsername(userDetails.getUsername());
        }
        
        if (userDetails.getEmail() != null) {
            // ตรวจสอบว่าอีเมลไม่ซ้ำกับผู้ใช้อื่น
            if (!userDetails.getEmail().equals(user.getEmail()) && 
                userRepository.existsByEmail(userDetails.getEmail())) {
                throw new RuntimeException("อีเมลนี้มีอยู่ในระบบแล้ว");
            }
            user.setEmail(userDetails.getEmail());
        }
        
        if (userDetails.getFirstName() != null) {
            user.setFirstName(userDetails.getFirstName());
        }
        
        if (userDetails.getLastName() != null) {
            user.setLastName(userDetails.getLastName());
        }
        
        if (userDetails.getAddress() != null) {
            user.setAddress(userDetails.getAddress());
        }
        
        if (userDetails.getPhone() != null) {
            user.setPhone(userDetails.getPhone());
        }
        
        if (userDetails.getRole() != null) {
            user.setRole(userDetails.getRole());
        }
        
        return userRepository.save(user);
    }

    // เปลี่ยนรหัสผ่าน
    public boolean changePassword(String userId, String oldPassword, String newPassword) {
        logger.debug("เปลี่ยนรหัสผ่านสำหรับผู้ใช้ ID: {}", userId);
        User user = getUserById(userId);
        
        // ในระบบจริงควรมีการตรวจสอบรหัสผ่านเก่า
        // if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
        //    throw new RuntimeException("รหัสผ่านเก่าไม่ถูกต้อง");
        // }
        
        // เทียบรหัสผ่านเก่ากับที่เก็บในฐานข้อมูล (ในระบบจริงไม่ควรทำแบบนี้)
        if (!oldPassword.equals(user.getPassword())) {
            throw new RuntimeException("รหัสผ่านเก่าไม่ถูกต้อง");
        }
        
        // ในระบบจริงควรมีการเข้ารหัสรหัสผ่านใหม่
        // user.setPassword(passwordEncoder.encode(newPassword));
        user.setPassword(newPassword);
        
        userRepository.save(user);
        return true;
    }

    // ลบผู้ใช้
    public boolean deleteUser(String userId) {
        logger.debug("ลบผู้ใช้ ID: {}", userId);
        User user = getUserById(userId);
        userRepository.delete(user);
        return true;
    }
}