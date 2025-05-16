package com.airline.booking.service;

import com.airline.booking.model.Booking;
import com.airline.booking.model.Discount;
import com.airline.booking.repository.BookingRepository;
import com.airline.booking.repository.DiscountRepository;
import com.airline.booking.exception.ResourceNotFoundException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class DiscountService {

    private static final Logger logger = LoggerFactory.getLogger(DiscountService.class);

    @Autowired
    private DiscountRepository discountRepository;
    
    public long countAllDiscounts() {
        return discountRepository.count();
    }    
    
    @Autowired
    private BookingRepository bookingRepository;

    // ดึงข้อมูลส่วนลดทั้งหมด
    public List<Discount> getAllDiscounts() {
        logger.debug("เรียกดูส่วนลดทั้งหมด");
        return discountRepository.findAll();
    }
    
    // ดึงข้อมูลส่วนลดตาม ID
    public Discount getDiscountById(String discountId) {
        logger.debug("เรียกดูส่วนลดด้วย ID: {}", discountId);
        return discountRepository.findById(discountId)
                .orElseThrow(() -> new ResourceNotFoundException("ไม่พบส่วนลดด้วย ID: " + discountId));
    }
    
    // ตรวจสอบโค้ดส่วนลด
    public Discount validateDiscountCode(String discountCode) {
        logger.debug("ตรวจสอบโค้ดส่วนลด: {}", discountCode);
        LocalDate currentDate = LocalDate.now();
        
        return discountRepository.findByDiscountIdAndExpiryDateGreaterThanEqual(discountCode, currentDate)
                .orElseThrow(() -> new ResourceNotFoundException("โค้ดส่วนลด " + discountCode + " ไม่ถูกต้องหรือหมดอายุแล้ว"));
    }
    
    // สร้างโค้ดส่วนลดใหม่
    @Transactional
    public Discount createDiscount(Discount discount) {
        logger.debug("สร้างโค้ดส่วนลดใหม่");
        
        // ตรวจสอบว่ามี ID หรือไม่
        if (discount.getDiscountId() == null || discount.getDiscountId().isEmpty()) {
            // สร้าง ID ใหม่
            discount.setDiscountId("DISC" + UUID.randomUUID().toString().substring(0, 6).toUpperCase());
        }
        
        // ตรวจสอบว่าวันหมดอายุมากกว่าวันปัจจุบันหรือไม่
        if (discount.getExpiryDate() == null || discount.getExpiryDate().isBefore(LocalDate.now())) {
            // กำหนดวันหมดอายุเป็น 30 วันนับจากวันปัจจุบัน
            discount.setExpiryDate(LocalDate.now().plusDays(30));
        }
        
        return discountRepository.save(discount);
    }
    
    // อัปเดตข้อมูลส่วนลด
    @Transactional
    public Discount updateDiscount(String discountId, Discount discountDetails) {
        logger.debug("อัปเดตส่วนลด ID: {}", discountId);
        Discount discount = getDiscountById(discountId);
        
        // อัปเดตข้อมูล
        if (discountDetails.getPointRequired() != null) {
            discount.setPointRequired(discountDetails.getPointRequired());
        }
        
        if (discountDetails.getDiscountValue() != null) {
            discount.setDiscountValue(discountDetails.getDiscountValue());
        }
        
        if (discountDetails.getExpiryDate() != null) {
            discount.setExpiryDate(discountDetails.getExpiryDate());
        }
        
        return discountRepository.save(discount);
    }
    
    // ใช้โค้ดส่วนลดกับการจอง
    @Transactional
    public Map<String, Object> applyDiscountToBooking(String bookingId, String discountCode) {
        logger.debug("ใช้โค้ดส่วนลด {} กับการจอง {}", discountCode, bookingId);
        
        // ตรวจสอบการจองและส่วนลด
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("ไม่พบการจองด้วย ID: " + bookingId));
        
        Discount discount = validateDiscountCode(discountCode);
        
        // ตรวจสอบว่าส่วนลดนี้ถูกใช้กับการจองนี้ไปแล้วหรือไม่
        if (booking.getDiscounts().contains(discount)) {
            throw new IllegalStateException("ส่วนลดนี้ถูกใช้กับการจองนี้ไปแล้ว");
        }
        
        // คำนวณราคาใหม่
        BigDecimal originalPrice = booking.getTotalPrice();
        BigDecimal discountValue = discount.getDiscountValue();
        
        BigDecimal newPrice = originalPrice.subtract(discountValue);
        if (newPrice.compareTo(BigDecimal.ZERO) < 0) {
            newPrice = BigDecimal.ZERO;
        }
        
        // บันทึกการเปลี่ยนแปลง
        booking.setTotalPrice(newPrice);
        discount.addBooking(booking);
        Booking updatedBooking = bookingRepository.save(booking);
        
        // สร้าง response
        Map<String, Object> result = new HashMap<>();
        result.put("bookingId", updatedBooking.getBookingId());
        result.put("discountId", discount.getDiscountId());
        result.put("originalPrice", originalPrice);
        result.put("discountValue", discountValue);
        result.put("newPrice", newPrice);
        result.put("message", "ใช้โค้ดส่วนลดสำเร็จ ได้รับส่วนลด ฿" + discountValue);
        
        return result;
    }
    
    // ดึงส่วนลดที่ใช้ได้ตามคะแนนสะสม
    public List<Discount> getAvailableDiscountsByPoints(Integer points) {
        logger.debug("เรียกดูส่วนลดที่ใช้ได้ด้วยคะแนน: {}", points);
        return discountRepository.findAvailableDiscountsByPoints(points, LocalDate.now());
    }
    
    // ดึงส่วนลดที่ใช้ในการจอง
    public List<Discount> getDiscountsByBookingId(String bookingId) {
        logger.debug("เรียกดูส่วนลดที่ใช้ในการจอง ID: {}", bookingId);
        return discountRepository.findDiscountsByBookingId(bookingId);
    }
    
    // ลบส่วนลด
    @Transactional
    public void deleteDiscount(String discountId) {
        logger.debug("ลบส่วนลด ID: {}", discountId);
        Discount discount = getDiscountById(discountId);
        discountRepository.delete(discount);
    }
}