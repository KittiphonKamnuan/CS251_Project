package com.airline.booking.controller;

import com.airline.booking.dto.DiscountDTO;
import com.airline.booking.model.Discount;
import com.airline.booking.service.DiscountService;
import com.airline.booking.exception.ResourceNotFoundException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/discounts")
@CrossOrigin(origins = "*")
public class DiscountController {

    private static final Logger logger = LoggerFactory.getLogger(DiscountController.class);

    @Autowired
    private DiscountService discountService;

    // ดึงส่วนลดทั้งหมด
    @GetMapping
    public ResponseEntity<?> getAllDiscounts() {
        try {
            logger.debug("เริ่มการดึงข้อมูลส่วนลดทั้งหมด");
            List<Discount> discounts = discountService.getAllDiscounts();
            List<DiscountDTO> discountDTOs = discounts.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            logger.debug("ดึงข้อมูลส่วนลดทั้งหมดสำเร็จ จำนวน: {}", discounts.size());
            return new ResponseEntity<>(discountDTOs, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการดึงข้อมูลส่วนลดทั้งหมด: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการดึงข้อมูลส่วนลด: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ดึงส่วนลดตาม ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getDiscountById(@PathVariable(value = "id") String discountId) {
        try {
            logger.debug("เริ่มการดึงข้อมูลส่วนลดตาม ID: {}", discountId);
            Discount discount = discountService.getDiscountById(discountId);
            DiscountDTO discountDTO = convertToDTO(discount);
            logger.debug("ดึงข้อมูลส่วนลดสำเร็จ: {}", discount);
            return new ResponseEntity<>(discountDTO, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            logger.error("ไม่พบส่วนลดกับ ID: {}", discountId, e);
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการดึงข้อมูลส่วนลด: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการดึงข้อมูลส่วนลด: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ตรวจสอบโค้ดส่วนลด
    @GetMapping("/validate/{code}")
    public ResponseEntity<?> validateDiscountCode(@PathVariable(value = "code") String discountCode) {
        try {
            logger.debug("ตรวจสอบโค้ดส่วนลด: {}", discountCode);
            Discount discount = discountService.validateDiscountCode(discountCode);
            DiscountDTO discountDTO = convertToDTO(discount);
            logger.debug("โค้ดส่วนลดถูกต้อง: {}", discount);
            
            Map<String, Object> response = new HashMap<>();
            response.put("valid", true);
            response.put("discount", discountDTO);
            response.put("discountValue", discountDTO.getDiscountValue());
            response.put("message", "โค้ดส่วนลดถูกต้อง ได้รับส่วนลด ฿" + discountDTO.getDiscountValue());
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            logger.error("โค้ดส่วนลดไม่ถูกต้อง: {}", discountCode);
            
            Map<String, Object> response = new HashMap<>();
            response.put("valid", false);
            response.put("message", "โค้ดส่วนลดไม่ถูกต้องหรือหมดอายุแล้ว");
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการตรวจสอบโค้ดส่วนลด: {}", e.getMessage());
            
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาด: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // สร้างส่วนลดใหม่
    @PostMapping
    public ResponseEntity<?> createDiscount(@RequestBody DiscountDTO discountDTO) {
        try {
            logger.debug("เริ่มการสร้างส่วนลดใหม่: {}", discountDTO);
            Discount discount = convertToEntity(discountDTO);
            Discount newDiscount = discountService.createDiscount(discount);
            DiscountDTO responseDTO = convertToDTO(newDiscount);
            logger.debug("สร้างส่วนลดใหม่สำเร็จ: {}", newDiscount);
            return new ResponseEntity<>(responseDTO, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการสร้างส่วนลด: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการสร้างส่วนลด: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // อัปเดตส่วนลด
    @PutMapping("/{id}")
    public ResponseEntity<?> updateDiscount(
            @PathVariable(value = "id") String discountId,
            @RequestBody DiscountDTO discountDTO) {
        try {
            logger.debug("เริ่มการอัปเดตส่วนลด ID: {}", discountId);
            Discount discount = convertToEntity(discountDTO);
            Discount updatedDiscount = discountService.updateDiscount(discountId, discount);
            DiscountDTO responseDTO = convertToDTO(updatedDiscount);
            logger.debug("อัปเดตส่วนลดสำเร็จ: {}", updatedDiscount);
            return new ResponseEntity<>(responseDTO, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            logger.error("ไม่พบส่วนลดกับ ID: {}", discountId, e);
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการอัปเดตส่วนลด: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการอัปเดตส่วนลด: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ใช้โค้ดส่วนลดกับการจอง
    @PostMapping("/apply")
    public ResponseEntity<?> applyDiscountToBooking(
            @RequestParam(value = "bookingId", required = false) String bookingId,
            @RequestParam(value = "discountCode") String discountCode) {
        try {
            logger.debug("ใช้โค้ดส่วนลด {} กับการจอง {}", discountCode, bookingId);
            
            Map<String, Object> result;
            
            // กรณีมี bookingId - ใช้ส่วนลดกับการจองที่มีอยู่
            if (bookingId != null && !bookingId.isEmpty()) {
                result = discountService.applyDiscountToBooking(bookingId, discountCode);
            } 
            // กรณีไม่มี bookingId - เพียงตรวจสอบส่วนลดและส่งค่ากลับ
            else {
                Discount discount = discountService.validateDiscountCode(discountCode);
                DiscountDTO discountDTO = convertToDTO(discount);
                result = new HashMap<>();
                result.put("discountId", discountDTO.getDiscountId());
                result.put("discountValue", discountDTO.getDiscountValue());
                result.put("message", "ส่วนลดถูกต้อง สามารถใช้ได้");
            }
            
            return new ResponseEntity<>(result, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("valid", false);
            response.put("message", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาด: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ดึงส่วนลดที่ใช้ได้ตามคะแนนสะสม
    @GetMapping("/available")
    public ResponseEntity<?> getAvailableDiscounts(@RequestParam(value = "points") Integer points) {
        try {
            logger.debug("เริ่มการดึงข้อมูลส่วนลดที่ใช้ได้ด้วยคะแนน: {}", points);
            List<Discount> discounts = discountService.getAvailableDiscountsByPoints(points);
            List<DiscountDTO> discountDTOs = discounts.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            logger.debug("ดึงข้อมูลส่วนลดที่ใช้ได้สำเร็จ จำนวน: {}", discounts.size());
            return new ResponseEntity<>(discountDTOs, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการดึงข้อมูลส่วนลดที่ใช้ได้: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการดึงข้อมูลส่วนลดที่ใช้ได้: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // ดึงส่วนลดตามการจอง
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<?> getDiscountsByBookingId(@PathVariable(value = "bookingId") String bookingId) {
        try {
            logger.debug("เริ่มการดึงข้อมูลส่วนลดตามการจอง ID: {}", bookingId);
            List<Discount> discounts = discountService.getDiscountsByBookingId(bookingId);
            List<DiscountDTO> discountDTOs = discounts.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            logger.debug("ดึงข้อมูลส่วนลดตามการจองสำเร็จ จำนวน: {}", discounts.size());
            return new ResponseEntity<>(discountDTOs, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            logger.error("ไม่พบการจองกับ ID: {}", bookingId, e);
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการดึงข้อมูลส่วนลดตามการจอง: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการดึงข้อมูลส่วนลดตามการจอง: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ลบส่วนลด
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDiscount(@PathVariable(value = "id") String discountId) {
        try {
            logger.debug("เริ่มการลบส่วนลด ID: {}", discountId);
            discountService.deleteDiscount(discountId);
            logger.debug("ลบส่วนลดสำเร็จ ID: {}", discountId);
            
            Map<String, Boolean> response = new HashMap<>();
            response.put("deleted", Boolean.TRUE);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            logger.error("ไม่พบส่วนลดกับ ID: {}", discountId, e);
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการลบส่วนลด: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการลบส่วนลด: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Helper method to convert Entity to DTO
    private DiscountDTO convertToDTO(Discount discount) {
        DiscountDTO dto = new DiscountDTO();
        dto.setDiscountId(discount.getDiscountId());
        dto.setPointRequired(discount.getPointRequired());
        dto.setDiscountValue(discount.getDiscountValue());
        
        if (discount.getExpiryDate() != null) {
            DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE;
            dto.setExpiryDate(discount.getExpiryDate().format(formatter));
        }
        
        return dto;
    }
    
    // Helper method to convert DTO to Entity
    private Discount convertToEntity(DiscountDTO dto) {
        Discount entity = new Discount();
        entity.setDiscountId(dto.getDiscountId());
        entity.setPointRequired(dto.getPointRequired());
        entity.setDiscountValue(dto.getDiscountValue());
        
        if (dto.getExpiryDate() != null && !dto.getExpiryDate().isEmpty()) {
            try {
                LocalDate expiryDate = LocalDate.parse(dto.getExpiryDate());
                entity.setExpiryDate(expiryDate);
            } catch (DateTimeParseException e) {
                logger.warn("Invalid date format: {}", dto.getExpiryDate());
                // ใช้วันที่ปัจจุบัน + 1 ปีเป็นค่าเริ่มต้น
                entity.setExpiryDate(LocalDate.now().plusYears(1));
            }
        } else {
            // ใช้วันที่ปัจจุบัน + 1 ปีเป็นค่าเริ่มต้น
            entity.setExpiryDate(LocalDate.now().plusYears(1));
        }
        
        return entity;
    }
}