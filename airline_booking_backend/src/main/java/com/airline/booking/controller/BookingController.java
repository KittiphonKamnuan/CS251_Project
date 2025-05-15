package com.airline.booking.controller;

import com.airline.booking.dto.BookingDTO;
import com.airline.booking.model.Booking;
import com.airline.booking.model.Passenger;
import com.airline.booking.model.Payment;
import com.airline.booking.model.Seat;
import com.airline.booking.repository.SeatRepository;
import com.airline.booking.service.BookingService;
import com.airline.booking.exception.ResourceNotFoundException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    private static final Logger logger = LoggerFactory.getLogger(BookingController.class);

    @Autowired
    private BookingService bookingService;

    // ดึงการจองทั้งหมด - ใช้ DTO
    @GetMapping
    public ResponseEntity<?> getAllBookings() {
        try {
            logger.debug("เริ่มการดึงข้อมูลการจองทั้งหมด");
            List<Booking> bookings = bookingService.getAllBookings();
            List<BookingDTO> bookingDTOs = bookings.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            logger.debug("ดึงข้อมูลการจองทั้งหมดสำเร็จ จำนวน: {}", bookings.size());
            return new ResponseEntity<>(bookingDTOs, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการดึงข้อมูลการจองทั้งหมด: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการดึงข้อมูลการจอง: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ดึงการจองตาม ID - ใช้ DTO
    @GetMapping("/{id}")
    public ResponseEntity<?> getBookingById(@PathVariable(value = "id") String bookingId) {
        try {
            logger.debug("เริ่มการดึงข้อมูลการจองตาม ID: {}", bookingId);
            Booking booking = bookingService.getBookingById(bookingId);
            BookingDTO bookingDTO = convertToDTO(booking);
            logger.debug("ดึงข้อมูลการจองสำเร็จ: {}", booking);
            return new ResponseEntity<>(bookingDTO, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            logger.error("ไม่พบการจองกับ ID: {}", bookingId, e);
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการดึงข้อมูลการจอง: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการดึงข้อมูลการจอง: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ค้นหาการจองตามผู้ใช้
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getBookingsByUser(@PathVariable String userId) {
        try {
            List<Booking> bookings = bookingService.getBookingsByUserId(userId);
            List<BookingDTO> bookingDTOs = bookings.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(bookingDTOs);
        } catch (ResourceNotFoundException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการดึงข้อมูลการจอง: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }    

    // ค้นหาการจองตามเที่ยวบิน - ใช้ DTO
    @GetMapping("/flight/{flightId}")
    public ResponseEntity<?> getBookingsByFlight(@PathVariable(value = "flightId") String flightId) {
        try {
            logger.debug("เริ่มการดึงข้อมูลการจองตามเที่ยวบิน ID: {}", flightId);
            List<Booking> bookings = bookingService.getBookingsByFlightId(flightId);
            List<BookingDTO> bookingDTOs = bookings.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            logger.debug("ดึงข้อมูลการจองตามเที่ยวบินสำเร็จ จำนวน: {}", bookings.size());
            return new ResponseEntity<>(bookingDTOs, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการดึงข้อมูลการจองตามเที่ยวบิน: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการดึงข้อมูลการจองตามเที่ยวบิน: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ค้นหาการจองตามสถานะการจอง - ใช้ DTO
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getBookingsByStatus(@PathVariable(value = "status") String bookingStatus) {
        try {
            logger.debug("เริ่มการดึงข้อมูลการจองตามสถานะ: {}", bookingStatus);
            List<Booking> bookings = bookingService.getBookingsByStatus(bookingStatus);
            List<BookingDTO> bookingDTOs = bookings.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            logger.debug("ดึงข้อมูลการจองตามสถานะสำเร็จ จำนวน: {}", bookings.size());
            return new ResponseEntity<>(bookingDTOs, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการดึงข้อมูลการจองตามสถานะ: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการดึงข้อมูลการจองตามสถานะ: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ค้นหาการจองตามช่วงวันที่ - ใช้ DTO
    @GetMapping("/date")
    public ResponseEntity<?> getBookingsByDateRange(
            @RequestParam(value = "from") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(value = "to") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        try {
            logger.debug("เริ่มการดึงข้อมูลการจองตามช่วงวันที่: {} ถึง {}", fromDate, toDate);
            List<Booking> bookings = bookingService.getBookingsByDateRange(fromDate, toDate);
            List<BookingDTO> bookingDTOs = bookings.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            logger.debug("ดึงข้อมูลการจองตามช่วงวันที่สำเร็จ จำนวน: {}", bookings.size());
            return new ResponseEntity<>(bookingDTOs, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการดึงข้อมูลการจองตามช่วงวันที่: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการดึงข้อมูลการจองตามช่วงวันที่: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping
    public ResponseEntity<?> createBooking(
        @RequestBody BookingDTO bookingDTO,
        @RequestParam(required = false) String userId,
        @RequestParam(required = false) String flightId) {
    try {
        logger.debug("เริ่มการสร้างการจองใหม่");
        
        if (bookingDTO == null) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "ข้อมูลการจองไม่ถูกต้อง");
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }
        
        // Set userId and flightId from query parameters if provided
        if (userId != null && !userId.isEmpty()) {
            bookingDTO.setUserId(userId);
            logger.debug("กำหนด userId จาก query parameter: {}", userId);
        }
        
        if (flightId != null && !flightId.isEmpty()) {
            bookingDTO.setFlightId(flightId);
            logger.debug("กำหนด flightId จาก query parameter: {}", flightId);
        }
        
        // เพิ่มการตรวจสอบการจองซ้ำ - ตรวจสอบว่ามีการจองเที่ยวบินนี้โดยผู้ใช้นี้ในเวลาใกล้เคียงกันหรือไม่
        String actualUserId = bookingDTO.getUserId();
        String actualFlightId = bookingDTO.getFlightId();
        
        if (actualUserId != null && actualFlightId != null) {
            // ตรวจสอบการจองในช่วง 5 นาทีที่ผ่านมา
            LocalDateTime fiveMinutesAgo = LocalDateTime.now().minusMinutes(5);
            List<Booking> recentBookings = bookingService.findRecentBookings(
                actualUserId, actualFlightId, fiveMinutesAgo.toLocalDate());
            
            if (!recentBookings.isEmpty()) {
                logger.warn("พบการจองซ้ำสำหรับ userId: {} และ flightId: {}", actualUserId, actualFlightId);
                
                // ส่งคืนข้อมูลการจองที่มีอยู่แล้ว
                BookingDTO existingBookingDTO = convertToDTO(recentBookings.get(0));
                Map<String, Object> response = new HashMap<>();
                response.put("message", "คุณได้ทำการจองเที่ยวบินนี้ไปแล้ว");
                response.put("booking", existingBookingDTO);
                return new ResponseEntity<>(existingBookingDTO, HttpStatus.OK);
            }
        }
        
        // ตั้งค่าสถานะเป็น "Confirmed" ทันที
        bookingDTO.setBookingStatus("Confirmed");
        
        // Convert DTO to entity
        Booking booking = convertDTOToBooking(bookingDTO);
        
        logger.debug("สร้างการจองด้วย userId: {} และ flightId: {}", actualUserId, actualFlightId);
        
        // Create booking through service
        Booking newBooking = bookingService.createBooking(booking, actualUserId, actualFlightId);
        
        // Convert back to DTO for response
        BookingDTO responseDTO = convertToDTO(newBooking);
        
        logger.debug("สร้างการจองใหม่สำเร็จ: {}", newBooking);
        return new ResponseEntity<>(responseDTO, HttpStatus.CREATED);
        } catch (ResourceNotFoundException e) {
            logger.error("ไม่พบทรัพยากรที่จำเป็น: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการสร้างการจอง: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการสร้างการจอง: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // ตัวอย่าง method แปลง DTO เป็น Entity - ปรับปรุงใหม่
    private Booking convertDTOToBooking(BookingDTO dto) {
        if (dto == null) {
            return null;
        }
        
        Booking booking = new Booking();
        
        // เซ็ต ID เฉพาะเมื่อมีการให้มา (สำหรับการอัปเดต)
        if (dto.getBookingId() != null && !dto.getBookingId().isEmpty()) {
            booking.setBookingId(dto.getBookingId());
        }
        
        // ไม่ต้องเซ็ต User/Flight ตรงๆ - ให้ Service จัดการ
        booking.setBookingDate(dto.getBookingDate());
        booking.setBookingStatus(dto.getBookingStatus());
        booking.setTotalPrice(dto.getTotalPrice());
        booking.setContactEmail(dto.getContactEmail());
        booking.setContactPhone(dto.getContactPhone());
        
        // เซ็ต userId และ flightId สำหรับส่งต่อให้ Service
        if (dto.getUserId() != null && !dto.getUserId().isEmpty()) {
            booking.setUserId(dto.getUserId());
        }
        
        if (dto.getFlightId() != null && !dto.getFlightId().isEmpty()) {
            booking.setFlightId(dto.getFlightId());
        }
        
        // แปลงผู้โดยสาร
        if (dto.getPassengers() != null && !dto.getPassengers().isEmpty()) {
            Set<Passenger> passengers = new HashSet<>();
            for (BookingDTO.PassengerDTO passengerDTO : dto.getPassengers()) {
                Passenger passenger = convertPassengerDTOToEntity(passengerDTO);
                if (passenger != null) {
                    passenger.setBooking(booking);
                    passengers.add(passenger);
                }
            }
            booking.setPassengers(passengers);
        }
        
        // แปลงข้อมูลการชำระเงิน
        if (dto.getPayment() != null) {
            Payment payment = convertPaymentDTOToEntity(dto.getPayment());
            if (payment != null) {
                payment.setBooking(booking);
                booking.setPayment(payment);
            }
        }
        
        return booking;
    }
    
    @Autowired
    private SeatRepository seatRepository;

    private Passenger convertPassengerDTOToEntity(BookingDTO.PassengerDTO dto) {
        if (dto == null) return null;

        Passenger passenger = new Passenger();
        passenger.setPassengerId(dto.getPassengerId());
        passenger.setFirstName(dto.getFirstName());
        passenger.setLastName(dto.getLastName());

        if (dto.getDateOfBirth() != null && !dto.getDateOfBirth().isEmpty()) {
            try {
                passenger.setDateOfBirth(LocalDate.parse(dto.getDateOfBirth()));
            } catch (Exception e) {
                // handle exception
            }
        }
        passenger.setPassportNumber(dto.getDocumentId());

        // --- เพิ่มโค้ดนี้ ---
        if (dto.getSeatId() != null && !dto.getSeatId().isEmpty()) {
            Seat seat = seatRepository.findById(dto.getSeatId())
                    .orElseThrow(() -> new ResourceNotFoundException("Seat not found with ID: " + dto.getSeatId()));
            passenger.setSeat(seat);
        } else {
            passenger.setSeat(null);
        }
        // -----------------

        return passenger;
    }

    
    private Payment convertPaymentDTOToEntity(BookingDTO.PaymentDTO dto) {
        if (dto == null) return null;
        
        Payment payment = new Payment();
        payment.setPaymentId(dto.getPaymentId());
        payment.setAmount(dto.getAmount());
        payment.setPaymentStatus(dto.getPaymentStatus());
        
        // Set payment method
        if (dto.getPaymentMethod() != null && !dto.getPaymentMethod().isEmpty()) {
            payment.setPaymentMethod(dto.getPaymentMethod());
        } else {
            payment.setPaymentMethod("Online Payment");
        }
        
        // Convert payment date
        if (dto.getPaymentDate() != null && !dto.getPaymentDate().isEmpty()) {
            try {
                payment.setPaymentDate(LocalDate.parse(dto.getPaymentDate()));
            } catch (Exception e) {
                logger.warn("Invalid date format for payment date: {}", dto.getPaymentDate());
                // Use current date or set to null
                payment.setPaymentDate(LocalDate.now());
            }
        }
        
        return payment;
    }    

    // อัปเดตข้อมูลการจอง - ใช้ DTO
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBooking(
            @PathVariable(value = "id") String bookingId,
            @RequestBody Booking bookingDetails) {
        try {
            logger.debug("เริ่มการอัปเดตข้อมูลการจอง ID: {}", bookingId);
            Booking updatedBooking = bookingService.updateBooking(bookingId, bookingDetails);
            BookingDTO bookingDTO = convertToDTO(updatedBooking);
            logger.debug("อัปเดตข้อมูลการจองสำเร็จ: {}", updatedBooking);
            return new ResponseEntity<>(bookingDTO, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            logger.error("ไม่พบการจองกับ ID: {}", bookingId, e);
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการอัปเดตข้อมูลการจอง: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการอัปเดตข้อมูลการจอง: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // อัปเดตสถานะการจอง - ใช้ DTO
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateBookingStatus(
            @PathVariable(value = "id") String bookingId,
            @RequestBody Map<String, String> statusUpdate) {
        try {
            String newStatus = statusUpdate.get("status");
            if (newStatus == null || newStatus.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "ต้องระบุสถานะใหม่");
                return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
            }
            
            logger.debug("เริ่มการอัปเดตสถานะการจอง ID: {} เป็น: {}", bookingId, newStatus);
            Booking updatedBooking = bookingService.updateBookingStatus(bookingId, newStatus);
            BookingDTO bookingDTO = convertToDTO(updatedBooking);
            logger.debug("อัปเดตสถานะการจองสำเร็จ: {}", updatedBooking);
            return new ResponseEntity<>(bookingDTO, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            logger.error("ไม่พบการจองกับ ID: {}", bookingId, e);
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการอัปเดตสถานะการจอง: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการอัปเดตสถานะการจอง: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ยกเลิกการจอง - ใช้ DTO
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable(value = "id") String bookingId) {
        try {
            logger.debug("เริ่มการยกเลิกการจอง ID: {}", bookingId);
            Booking cancelledBooking = bookingService.cancelBooking(bookingId);
            BookingDTO bookingDTO = convertToDTO(cancelledBooking);
            logger.debug("ยกเลิกการจองสำเร็จ: {}", cancelledBooking);
            return new ResponseEntity<>(bookingDTO, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            logger.error("ไม่พบการจองกับ ID: {}", bookingId, e);
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการยกเลิกการจอง: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการยกเลิกการจอง: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ลบการจอง
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBooking(@PathVariable(value = "id") String bookingId) {
        try {
            logger.debug("เริ่มการลบการจอง ID: {}", bookingId);
            bookingService.deleteBooking(bookingId);
            logger.debug("ลบการจองสำเร็จ ID: {}", bookingId);
            
            Map<String, Boolean> response = new HashMap<>();
            response.put("deleted", Boolean.TRUE);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            logger.error("ไม่พบการจองกับ ID: {}", bookingId, e);
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการลบการจอง: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการลบการจอง: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // เพิ่มผู้โดยสารในการจอง - ใช้ DTO
    @PostMapping("/{id}/passengers")
    public ResponseEntity<?> addPassengerToBooking(
            @PathVariable(value = "id") String bookingId,
            @RequestBody Passenger passenger) {
        try {
            logger.debug("เริ่มการเพิ่มผู้โดยสารในการจอง ID: {}", bookingId);
            Booking updatedBooking = bookingService.addPassengerToBooking(bookingId, passenger);
            BookingDTO bookingDTO = convertToDTO(updatedBooking);
            logger.debug("เพิ่มผู้โดยสารในการจองสำเร็จ: {}", updatedBooking);
            return new ResponseEntity<>(bookingDTO, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            logger.error("ไม่พบการจองกับ ID: {}", bookingId, e);
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการเพิ่มผู้โดยสาร: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการเพิ่มผู้โดยสาร: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // ลบผู้โดยสารจากการจอง - ใช้ DTO
    @DeleteMapping("/{bookingId}/passengers/{passengerId}")
    public ResponseEntity<?> removePassengerFromBooking(
            @PathVariable(value = "bookingId") String bookingId,
            @PathVariable(value = "passengerId") String passengerId) {
        try {
            logger.debug("เริ่มการลบผู้โดยสารจากการจอง bookingId: {}, passengerId: {}", bookingId, passengerId);
            Booking updatedBooking = bookingService.removePassengerFromBooking(bookingId, passengerId);
            BookingDTO bookingDTO = convertToDTO(updatedBooking);
            logger.debug("ลบผู้โดยสารจากการจองสำเร็จ: {}", updatedBooking);
            return new ResponseEntity<>(bookingDTO, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            logger.error("ไม่พบการจองหรือผู้โดยสาร: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการลบผู้โดยสาร: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "เกิดข้อผิดพลาดในการลบผู้โดยสาร: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // เพิ่มส่วนลดในการจอง - ใช้ DTO
   @PostMapping("/{bookingId}/discounts/{discountId}")
   public ResponseEntity<?> applyDiscountToBooking(
           @PathVariable(value = "bookingId") String bookingId,
           @PathVariable(value = "discountId") String discountId) {
       try {
           logger.debug("เริ่มการเพิ่มส่วนลดในการจอง bookingId: {}, discountId: {}", bookingId, discountId);
           Booking updatedBooking = bookingService.applyDiscountToBooking(bookingId, discountId);
           BookingDTO bookingDTO = convertToDTO(updatedBooking);
           logger.debug("เพิ่มส่วนลดในการจองสำเร็จ: {}", updatedBooking);
           return new ResponseEntity<>(bookingDTO, HttpStatus.OK);
       } catch (ResourceNotFoundException e) {
           logger.error("ไม่พบการจองหรือส่วนลด: {}", e.getMessage(), e);
           Map<String, String> error = new HashMap<>();
           error.put("message", e.getMessage());
           return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
       } catch (Exception e) {
           logger.error("เกิดข้อผิดพลาดในการเพิ่มส่วนลด: {}", e.getMessage(), e);
           Map<String, String> error = new HashMap<>();
           error.put("message", "เกิดข้อผิดพลาดในการเพิ่มส่วนลด: " + e.getMessage());
           return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
       }
   }
   
   @GetMapping("/{id}/passengers")
   public ResponseEntity<?> getBookingPassengers(@PathVariable(value = "id") String bookingId) {
       try {
           logger.debug("เริ่มการดึงข้อมูลผู้โดยสารในการจอง ID: {}", bookingId);
           List<Passenger> passengers = bookingService.getBookingPassengers(bookingId);
           List<BookingDTO.PassengerDTO> passengerDTOs = passengers.stream()
                   .map(this::convertPassengerToDTO)
                   .collect(Collectors.toList());
           logger.debug("ดึงข้อมูลผู้โดยสารในการจองสำเร็จ จำนวน: {}", passengers.size());
           return new ResponseEntity<>(passengerDTOs, HttpStatus.OK);
       } catch (ResourceNotFoundException e) {
           logger.error("ไม่พบการจองกับ ID: {}", bookingId, e);
           Map<String, String> error = new HashMap<>();
           error.put("message", e.getMessage());
           return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
       } catch (Exception e) {
           logger.error("เกิดข้อผิดพลาดในการดึงข้อมูลผู้โดยสาร: {}", e.getMessage(), e);
           Map<String, String> error = new HashMap<>();
           error.put("message", "เกิดข้อผิดพลาดในการดึงข้อมูลผู้โดยสาร: " + e.getMessage());
           return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
       }
   }
   
   // ตรวจสอบสถานะการชำระเงิน
   @GetMapping("/{id}/payment-status")
   public ResponseEntity<?> getBookingPaymentStatus(@PathVariable(value = "id") String bookingId) {
       try {
           logger.debug("เริ่มการตรวจสอบสถานะการชำระเงินของการจอง ID: {}", bookingId);
           Map<String, Object> paymentStatus = bookingService.getBookingPaymentStatus(bookingId);
           logger.debug("ตรวจสอบสถานะการชำระเงินสำเร็จ: {}", paymentStatus);
           return new ResponseEntity<>(paymentStatus, HttpStatus.OK);
       } catch (ResourceNotFoundException e) {
           logger.error("ไม่พบการจองกับ ID: {}", bookingId, e);
           Map<String, String> error = new HashMap<>();
           error.put("message", e.getMessage());
           return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
       } catch (Exception e) {
           logger.error("เกิดข้อผิดพลาดในการตรวจสอบสถานะการชำระเงิน: {}", e.getMessage(), e);
           Map<String, String> error = new HashMap<>();
           error.put("message", "เกิดข้อผิดพลาดในการตรวจสอบสถานะการชำระเงิน: " + e.getMessage());
           return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
       }
   }
   
   // Helper methods for DTO conversion
   private BookingDTO convertToDTO(Booking booking) {
       if (booking == null) {
           return null;
       }
       
       BookingDTO dto = new BookingDTO();
       dto.setBookingId(booking.getBookingId());
       dto.setUserId(booking.getUserId());
       dto.setFlightId(booking.getFlightId());
       dto.setBookingDate(booking.getBookingDate());
       dto.setBookingStatus(booking.getBookingStatus());
       dto.setTotalPrice(booking.getTotalPrice());
       dto.setContactEmail(booking.getContactEmail());
       dto.setContactPhone(booking.getContactPhone());
       
       // Convert passengers if available
       if (booking.getPassengers() != null && !booking.getPassengers().isEmpty()) {
           List<BookingDTO.PassengerDTO> passengerDTOs = booking.getPassengers().stream()
                   .map(this::convertPassengerToDTO)
                   .collect(Collectors.toList());
           dto.setPassengers(passengerDTOs);
       }
       
       // Convert payment if available
       if (booking.getPayment() != null) {
           dto.setPayment(convertPaymentToDTO(booking.getPayment()));
       }
       
       return dto;
   }

// แก้ไขให้มี method นี้แค่ครั้งเดียว
private BookingDTO.PassengerDTO convertPassengerToDTO(Passenger passenger) {
    if (passenger == null) {
        return null;
    }
    
    BookingDTO.PassengerDTO dto = new BookingDTO.PassengerDTO();
    dto.setPassengerId(passenger.getPassengerId());
    dto.setFirstName(passenger.getFirstName());
    dto.setLastName(passenger.getLastName());
    
    if (passenger.getDateOfBirth() != null) {
        dto.setDateOfBirth(passenger.getDateOfBirth().toString());
    }
    
    dto.setDocumentId(passenger.getPassportNumber());
    
    if (passenger.getSeat() != null) {
        dto.setSeatNumber(passenger.getSeat().getSeatNumber());
        dto.setSeatId(passenger.getSeat().getSeatId());
    } else {
        dto.setSeatNumber(null);
        dto.setSeatId(null);
    }
    
    dto.setTitle(null);
    dto.setNationality(null);
    dto.setSpecialService(null);
    
    return dto;
}

// เพิ่ม method convertPaymentToDTO ให้มีอยู่ในคลาส BookingController
private BookingDTO.PaymentDTO convertPaymentToDTO(Payment payment) {
    if (payment == null) {
        return null;
    }
    
    BookingDTO.PaymentDTO dto = new BookingDTO.PaymentDTO();
    dto.setPaymentId(payment.getPaymentId());
    dto.setAmount(payment.getAmount());
    dto.setPaymentStatus(payment.getPaymentStatus());
    dto.setPaymentMethod(payment.getPaymentMethod() != null ? payment.getPaymentMethod() : "Online Payment");
    
    if (payment.getPaymentDate() != null) {
        dto.setPaymentDate(payment.getPaymentDate().toString());
    }
    
    return dto;
}

}