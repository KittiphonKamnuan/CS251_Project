package com.airline.booking.controller;

import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000") // เพิ่ม annotation นี้ให้กับทุก Controller
public class UtilityController {

    // API สำหรับข้อมูลเมือง/สนามบิน
    @GetMapping("/cities")
    public List<Map<String, Object>> getAllCities() {
        List<Map<String, Object>> cities = new ArrayList<>();
        
        // ข้อมูลตัวอย่าง
        cities.add(createCity("กรุงเทพฯ", "BKK", "Thailand"));
        cities.add(createCity("เชียงใหม่", "CNX", "Thailand"));
        cities.add(createCity("ภูเก็ต", "HKT", "Thailand"));
        cities.add(createCity("กระบี่", "KBV", "Thailand"));
        cities.add(createCity("เชียงราย", "CEI", "Thailand"));
        cities.add(createCity("หาดใหญ่", "HDY", "Thailand"));
        cities.add(createCity("สุราษฎร์ธานี", "URT", "Thailand"));
        cities.add(createCity("อุดรธานี", "UTH", "Thailand"));
        cities.add(createCity("ขอนแก่น", "KKC", "Thailand"));
        cities.add(createCity("อุบลราชธานี", "UBP", "Thailand"));
        
        return cities;
    }
    
    // API สำหรับจุดหมายปลายทางยอดนิยม
    @GetMapping("/destinations/popular")
    public List<Map<String, Object>> getPopularDestinations() {
        List<Map<String, Object>> destinations = new ArrayList<>();
        
        // ข้อมูลตัวอย่าง
        destinations.add(createDestination("เชียงใหม่", "CNX", "/assets/images/destinations/chiangmai.jpg", 1290.00, "เมืองเก่าแก่ที่มีวัฒนธรรมล้านนาอันเป็นเอกลักษณ์"));
        destinations.add(createDestination("ภูเก็ต", "HKT", "/assets/images/destinations/phuket.jpg", 1590.00, "เกาะที่ใหญ่ที่สุดในประเทศไทย มีชายหาดสวยงาม"));
        destinations.add(createDestination("กระบี่", "KBV", "/assets/images/destinations/krabi.jpg", 1490.00, "จุดหมายปลายทางที่มีชื่อเสียงด้านธรรมชาติทางทะเล"));
        destinations.add(createDestination("เชียงราย", "CEI", "/assets/images/destinations/chiangrai.jpg", 1390.00, "บ้านเกิดของวัดร่องขุ่น และวัดสวยงามมากมาย"));
        destinations.add(createDestination("หาดใหญ่", "HDY", "/assets/images/destinations/hatyai.jpg", 1290.00, "เมืองการค้าและแหล่งช้อปปิ้งชื่อดังทางภาคใต้"));
        destinations.add(createDestination("ขอนแก่น", "KKC", "/assets/images/destinations/khonkaen.jpg", 1190.00, "ศูนย์กลางการศึกษาและวัฒนธรรมของภาคอีสาน"));
        
        return destinations;
    }
    
    // API สำหรับโปรโมชั่นพิเศษ
    @GetMapping("/promotions/featured")
    public List<Map<String, Object>> getFeaturedPromotions() {
        List<Map<String, Object>> promotions = new ArrayList<>();
        
        // ข้อมูลตัวอย่าง
        promotions.add(createPromotion("โปรโมชั่นซัมเมอร์ 2025", "ลดสูงสุด 30% สำหรับเส้นทางภายในประเทศและต่างประเทศ", "/assets/images/promotions/summer_2025.jpg", 1090.00));
        promotions.add(createPromotion("โปรโมชั่นเที่ยวบินไป-กลับ", "รับส่วนลด 20% สำหรับเที่ยวบินไป-กลับทุกเส้นทางในประเทศ", "/assets/images/promotions/round_trip.jpg", 2190.00));
        promotions.add(createPromotion("แพ็คเกจเที่ยวบิน + โรงแรม", "ประหยัดสูงสุด 30% เมื่อจองเที่ยวบินพร้อมที่พัก 3 คืนขึ้นไป", "/assets/images/promotions/flight_hotel.jpg", 3990.00));
        
        return promotions;
    }
    
    // API สำหรับการสมัครรับข่าวสาร
    @PostMapping("/newsletter/subscribe")
    public Map<String, Object> subscribeNewsletter(@RequestBody Map<String, String> subscription) {
        String email = subscription.get("email");
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "ลงทะเบียนอีเมล " + email + " สำเร็จแล้ว");
        return response;
    }
    
    // Helper methods
    private Map<String, Object> createCity(String name, String code, String country) {
        Map<String, Object> city = new HashMap<>();
        city.put("name", name);
        city.put("code", code);
        city.put("country", country);
        return city;
    }
    
    private Map<String, Object> createDestination(String name, String code, String imageUrl, double price, String description) {
        Map<String, Object> destination = new HashMap<>();
        destination.put("name", name);
        destination.put("code", code);
        destination.put("imageUrl", imageUrl);
        destination.put("price", price);
        destination.put("description", description);
        return destination;
    }
    
    private Map<String, Object> createPromotion(String title, String details, String imageUrl, double price) {
        Map<String, Object> promotion = new HashMap<>();
        promotion.put("title", title);
        promotion.put("details", details);
        promotion.put("imageUrl", imageUrl);
        promotion.put("price", price);
        promotion.put("id", "PROMO" + Math.floor(Math.random() * 1000));
        return promotion;
    }
}