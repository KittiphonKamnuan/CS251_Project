package com.airline.booking.repository;

import com.airline.booking.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    // ค้นหาผู้ใช้ตามชื่อผู้ใช้
    User findByUsername(String username);
    
    // ค้นหาผู้ใช้ตามอีเมล
    User findByEmail(String email);
    
    // ตรวจสอบว่ามีชื่อผู้ใช้นี้ในระบบแล้วหรือไม่
    boolean existsByUsername(String username);
    
    // ตรวจสอบว่ามีอีเมลนี้ในระบบแล้วหรือไม่
    boolean existsByEmail(String email);
}