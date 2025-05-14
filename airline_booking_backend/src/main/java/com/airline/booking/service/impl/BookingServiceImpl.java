package com.airline.booking.service.impl;

import com.airline.booking.model.Booking;
import com.airline.booking.model.Discount;
import com.airline.booking.model.Flight;
import com.airline.booking.model.Passenger;
import com.airline.booking.model.Payment;
import com.airline.booking.model.User;
import com.airline.booking.repository.BookingRepository;
import com.airline.booking.repository.DiscountRepository;
import com.airline.booking.repository.FlightRepository;
import com.airline.booking.repository.PassengerRepository;
import com.airline.booking.repository.PaymentRepository;
import com.airline.booking.repository.UserRepository;
import com.airline.booking.service.BookingService;
import com.airline.booking.exception.ResourceNotFoundException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import java.util.UUID;

@Service
public class BookingServiceImpl implements BookingService {

    private static final Logger logger = LoggerFactory.getLogger(BookingServiceImpl.class);

    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private FlightRepository flightRepository;
    
    @Autowired
    private PassengerRepository passengerRepository;
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private DiscountRepository discountRepository;

    @Override
    public List<Booking> getAllBookings() {
        logger.debug("ดึงข้อมูลการจองทั้งหมดจากฐานข้อมูล");
        return bookingRepository.findAll();
    }

    @Override
    public Booking getBookingById(String bookingId) throws ResourceNotFoundException {
        logger.debug("ดึงข้อมูลการจองตามรหัส: {}", bookingId);
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("ไม่พบการจองกับรหัส: " + bookingId));
    }

    @Override
    public List<Booking> getBookingsByUserId(String userId) {
        logger.debug("ดึงข้อมูลการจองตามรหัสผู้ใช้: {}", userId);
        return bookingRepository.findByUserUserId(userId);
    }

    @Override
    public List<Booking> getBookingsByFlightId(String flightId) {
        logger.debug("ดึงข้อมูลการจองตามรหัสเที่ยวบิน: {}", flightId);
        return bookingRepository.findByFlightFlightId(flightId);
    }

    @Override
    public List<Booking> getBookingsByStatus(String status) {
        logger.debug("ดึงข้อมูลการจองตามสถานะ: {}", status);
        return bookingRepository.findByBookingStatus(status);
    }

    @Override
    public List<Booking> getBookingsByDateRange(LocalDate fromDate, LocalDate toDate) {
        logger.debug("ดึงข้อมูลการจองตามช่วงวันที่: {} ถึง {}", fromDate, toDate);
        return bookingRepository.findByBookingDateBetween(fromDate, toDate);
    }

    @Override
    @Transactional
    public Booking createBooking(Booking booking, String userId, String flightId) throws ResourceNotFoundException {
        try {
            logger.debug("เริ่มสร้างการจองใหม่สำหรับผู้ใช้: {} และเที่ยวบิน: {}", userId, flightId);
            
            // ตรวจสอบและดึงข้อมูลผู้ใช้
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("ไม่พบผู้ใช้กับรหัส: " + userId));
            
            // ตรวจสอบและดึงข้อมูลเที่ยวบิน
            Flight flight = flightRepository.findById(flightId)
                    .orElseThrow(() -> new ResourceNotFoundException("ไม่พบเที่ยวบินกับรหัส: " + flightId));
            
            // สร้างรหัสการจองถ้าไม่มี
            if (booking.getBookingId() == null || booking.getBookingId().isEmpty()) {
                // สร้างรหัสการจองแบบสุ่ม (รูปแบบ BK-XXXXXXXX)
                String randomBookingId = "BK-" + String.format("%08d", new Random().nextInt(100000000));
                booking.setBookingId(randomBookingId);
                logger.debug("สร้างรหัสการจองใหม่: {}", randomBookingId);
            }
            
            // ตั้งค่าความสัมพันธ์
            booking.setUser(user);
            booking.setFlight(flight);
            
            // ตั้งค่าวันที่จองถ้าไม่มี
            if (booking.getBookingDate() == null) {
                booking.setBookingDate(LocalDate.now());
            }
            
            // ตั้งค่าสถานะการจองเริ่มต้นถ้าไม่มี
            if (booking.getBookingStatus() == null || booking.getBookingStatus().isEmpty()) {
                booking.setBookingStatus("Pending");
            }
            
            // ตรวจสอบราคาถ้าไม่มี
            if (booking.getTotalPrice() == null) {
                // Use the correct getter method from your Flight class
                booking.setTotalPrice(flight.getBasePrice()); // or whatever field name your Flight class uses
            }
            
            // บันทึกการจอง
            Booking savedBooking = bookingRepository.save(booking);
            logger.debug("บันทึกการจองสำเร็จ: {}", savedBooking);
            
            // จัดการข้อมูลผู้โดยสาร
            if (booking.getPassengers() != null && !booking.getPassengers().isEmpty()) {
                logger.debug("พบข้อมูลผู้โดยสาร จำนวน: {}", booking.getPassengers().size());
                
                for (Passenger passenger : booking.getPassengers()) {
                    // สร้างรหัสผู้โดยสารถ้าไม่มี
                    if (passenger.getPassengerId() == null || passenger.getPassengerId().isEmpty()) {
                        // สร้างรหัสผู้โดยสารแบบสุ่ม (รูปแบบ P-XXXXXXXX)
                        String randomPassengerId = "P-" + String.format("%08d", new Random().nextInt(100000000));
                        passenger.setPassengerId(randomPassengerId);
                    }
                    
                    // ตั้งค่าความสัมพันธ์กับการจอง
                    passenger.setBooking(savedBooking);
                    
                    // บันทึกข้อมูลผู้โดยสาร
                    passengerRepository.save(passenger);
                    logger.debug("บันทึกข้อมูลผู้โดยสารสำเร็จ: {}", passenger);
                }
            }
            
            // อัปเดตและดึงข้อมูลการจองล่าสุดพร้อมความสัมพันธ์
            return bookingRepository.findById(savedBooking.getBookingId())
                    .orElseThrow(() -> new ResourceNotFoundException("ไม่พบการจองหลังจากบันทึก: " + booking.getBookingId()));
        } catch (ResourceNotFoundException e) {
            logger.error("ไม่พบทรัพยากรที่จำเป็นสำหรับการสร้างการจอง: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการสร้างการจอง: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public Booking updateBooking(String bookingId, Booking bookingDetails) throws ResourceNotFoundException {
        try {
            logger.debug("เริ่มอัปเดตข้อมูลการจอง ID: {}", bookingId);
            
            // ตรวจสอบและดึงข้อมูลการจองเดิม
            Booking existingBooking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new ResourceNotFoundException("ไม่พบการจองกับรหัส: " + bookingId));
            
            // อัปเดตข้อมูลพื้นฐาน (ไม่รวมความสัมพันธ์)
            if (bookingDetails.getBookingDate() != null) {
                existingBooking.setBookingDate(bookingDetails.getBookingDate());
            }
            
            if (bookingDetails.getBookingStatus() != null) {
                existingBooking.setBookingStatus(bookingDetails.getBookingStatus());
            }
            
            if (bookingDetails.getTotalPrice() != null) {
                existingBooking.setTotalPrice(bookingDetails.getTotalPrice());
            }
            
            // บันทึกการเปลี่ยนแปลง
            Booking updatedBooking = bookingRepository.save(existingBooking);
            logger.debug("อัปเดตข้อมูลการจองสำเร็จ: {}", updatedBooking);
            
            return updatedBooking;
        } catch (ResourceNotFoundException e) {
            logger.error("ไม่พบการจองสำหรับการอัปเดต: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการอัปเดตข้อมูลการจอง: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public Booking updateBookingStatus(String bookingId, String status) throws ResourceNotFoundException {
        try {
            logger.debug("เริ่มอัปเดตสถานะการจอง ID: {} เป็น: {}", bookingId, status);
            
            // ตรวจสอบและดึงข้อมูลการจองเดิม
            Booking existingBooking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new ResourceNotFoundException("ไม่พบการจองกับรหัส: " + bookingId));
            
            // อัปเดตสถานะ
            existingBooking.setBookingStatus(status);
            
            // บันทึกการเปลี่ยนแปลง
            Booking updatedBooking = bookingRepository.save(existingBooking);
            logger.debug("อัปเดตสถานะการจองสำเร็จ: {}", updatedBooking);
            
            return updatedBooking;
        } catch (ResourceNotFoundException e) {
            logger.error("ไม่พบการจองสำหรับการอัปเดตสถานะ: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการอัปเดตสถานะการจอง: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public Booking cancelBooking(String bookingId) throws ResourceNotFoundException {
        try {
            logger.debug("เริ่มยกเลิกการจอง ID: {}", bookingId);
            
            // ตรวจสอบและดึงข้อมูลการจองเดิม
            Booking existingBooking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new ResourceNotFoundException("ไม่พบการจองกับรหัส: " + bookingId));
            
            // ตรวจสอบสถานะปัจจุบัน
            if ("Cancelled".equals(existingBooking.getBookingStatus())) {
                logger.warn("การจองนี้ถูกยกเลิกไปแล้ว: {}", bookingId);
                return existingBooking;
            }
            
            // อัปเดตสถานะเป็นยกเลิก
            existingBooking.setBookingStatus("Cancelled");
            
            // บันทึกการเปลี่ยนแปลง
            Booking cancelledBooking = bookingRepository.save(existingBooking);
            logger.debug("ยกเลิกการจองสำเร็จ: {}", cancelledBooking);
            
            return cancelledBooking;
        } catch (ResourceNotFoundException e) {
            logger.error("ไม่พบการจองสำหรับการยกเลิก: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการยกเลิกการจอง: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void deleteBooking(String bookingId) throws ResourceNotFoundException {
        try {
            logger.debug("เริ่มลบการจอง ID: {}", bookingId);
            
            // ตรวจสอบว่ามีการจองนี้หรือไม่
            if (!bookingRepository.existsById(bookingId)) {
                throw new ResourceNotFoundException("ไม่พบการจองกับรหัส: " + bookingId);
            }
            
            // ลบการจอง
            bookingRepository.deleteById(bookingId);
            logger.debug("ลบการจองสำเร็จ ID: {}", bookingId);
        } catch (ResourceNotFoundException e) {
            logger.error("ไม่พบการจองสำหรับการลบ: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการลบการจอง: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public Booking addPassengerToBooking(String bookingId, Passenger passenger) throws ResourceNotFoundException {
        try {
            logger.debug("เริ่มเพิ่มผู้โดยสารในการจอง ID: {}", bookingId);
            
            // ตรวจสอบและดึงข้อมูลการจอง
            Booking existingBooking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new ResourceNotFoundException("ไม่พบการจองกับรหัส: " + bookingId));
            
            // สร้างรหัสผู้โดยสารถ้าไม่มี
            if (passenger.getPassengerId() == null || passenger.getPassengerId().isEmpty()) {
                // สร้างรหัสผู้โดยสารแบบสุ่ม (รูปแบบ P-XXXXXXXX)
                String randomPassengerId = "P-" + String.format("%08d", new Random().nextInt(100000000));
                passenger.setPassengerId(randomPassengerId);
            }
            
            // ตั้งค่าความสัมพันธ์กับการจอง
            passenger.setBooking(existingBooking);
            
            // บันทึกข้อมูลผู้โดยสาร
            passengerRepository.save(passenger);
            logger.debug("เพิ่มผู้โดยสารในการจองสำเร็จ: {}", passenger);
            
            // อัปเดตและดึงข้อมูลการจองล่าสุดพร้อมความสัมพันธ์
            return bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new ResourceNotFoundException("ไม่พบการจองหลังจากเพิ่มผู้โดยสาร: " + bookingId));
        } catch (ResourceNotFoundException e) {
            logger.error("ไม่พบการจองสำหรับการเพิ่มผู้โดยสาร: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการเพิ่มผู้โดยสาร: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public Booking removePassengerFromBooking(String bookingId, String passengerId) throws ResourceNotFoundException {
        try {
            logger.debug("เริ่มลบผู้โดยสารจากการจอง bookingId: {}, passengerId: {}", bookingId, passengerId);
            
            // ตรวจสอบและดึงข้อมูลการจอง
            Booking existingBooking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new ResourceNotFoundException("ไม่พบการจองกับรหัส: " + bookingId));
            
            // ตรวจสอบและดึงข้อมูลผู้โดยสาร
            Passenger passenger = passengerRepository.findById(passengerId)
                    .orElseThrow(() -> new ResourceNotFoundException("ไม่พบผู้โดยสารกับรหัส: " + passengerId));
            
            // ตรวจสอบว่าผู้โดยสารนี้อยู่ในการจองนี้หรือไม่
            if (!passenger.getBooking().getBookingId().equals(bookingId)) {
                throw new IllegalArgumentException("ผู้โดยสารนี้ไม่ได้อยู่ในการจองที่ระบุ");
            }
            
            // ลบความสัมพันธ์
            existingBooking.removePassenger(passenger);
            
            // ลบข้อมูลผู้โดยสาร
            passengerRepository.delete(passenger);
            logger.debug("ลบผู้โดยสารจากการจองสำเร็จ: {}", passenger);
            
            // อัปเดตและดึงข้อมูลการจองล่าสุดพร้อมความสัมพันธ์
            return bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new ResourceNotFoundException("ไม่พบการจองหลังจากลบผู้โดยสาร: " + bookingId));
        } catch (ResourceNotFoundException e) {
            logger.error("ไม่พบการจองหรือผู้โดยสารสำหรับการลบ: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการลบผู้โดยสาร: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public Booking applyDiscountToBooking(String bookingId, String discountId) throws ResourceNotFoundException {
        try {
            logger.debug("เริ่มเพิ่มส่วนลดในการจอง bookingId: {}, discountId: {}", bookingId, discountId);
            
            // ตรวจสอบและดึงข้อมูลการจอง
            Booking existingBooking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new ResourceNotFoundException("ไม่พบการจองกับรหัส: " + bookingId));
            
            // ตรวจสอบและดึงข้อมูลส่วนลด
            Discount discount = discountRepository.findById(discountId)
                    .orElseThrow(() -> new ResourceNotFoundException("ไม่พบส่วนลดกับรหัส: " + discountId));
            
            // ตรวจสอบว่าส่วนลดนี้ถูกใช้ในการจองนี้แล้วหรือไม่
            if (existingBooking.getDiscounts().contains(discount)) {
                logger.warn("ส่วนลดนี้ถูกใช้ในการจองนี้แล้ว: {}", discountId);
                return existingBooking;
            }
            
            // เพิ่มส่วนลดในการจอง
            existingBooking.getDiscounts().add(discount);
            
            // คำนวณราคาใหม่หลังใช้ส่วนลด
            BigDecimal originalPrice = existingBooking.getTotalPrice();
            BigDecimal discountAmount = discount.getAmount(); // Use the actual getter method name 
            BigDecimal discountPercentage = discount.getPercentage(); // Use the actual getter method name
            BigDecimal newPrice = originalPrice;
            
            // คำนวณส่วนลดตามประเภท
            if (discountAmount != null && discountAmount.compareTo(BigDecimal.ZERO) > 0) {
                // ส่วนลดแบบจำนวนเงิน
                newPrice = originalPrice.subtract(discountAmount);
            } else if (discountPercentage != null && discountPercentage.compareTo(BigDecimal.ZERO) > 0) {
                // ส่วนลดแบบเปอร์เซ็นต์
                BigDecimal discountValue = originalPrice.multiply(discountPercentage.divide(new BigDecimal(100)));
                newPrice = originalPrice.subtract(discountValue);
            }
            
            // ตรวจสอบว่าราคาไม่ติดลบ
            if (newPrice.compareTo(BigDecimal.ZERO) < 0) {
                newPrice = BigDecimal.ZERO;
            }
            
            // อัปเดตราคารวม
            existingBooking.setTotalPrice(newPrice);
            
            // บันทึกการเปลี่ยนแปลง
            Booking updatedBooking = bookingRepository.save(existingBooking);
            logger.debug("เพิ่มส่วนลดในการจองสำเร็จ ราคาใหม่: {}", newPrice);
            
            return updatedBooking;
        } catch (ResourceNotFoundException e) {
            logger.error("ไม่พบการจองหรือส่วนลดสำหรับการเพิ่ม: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการเพิ่มส่วนลด: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public List<Passenger> getBookingPassengers(String bookingId) throws ResourceNotFoundException {
        try {
            logger.debug("เริ่มดึงข้อมูลผู้โดยสารในการจอง ID: {}", bookingId);
            
            // ตรวจสอบและดึงข้อมูลการจอง
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new ResourceNotFoundException("ไม่พบการจองกับรหัส: " + bookingId));
            
            // แปลง Set เป็น List
            List<Passenger> passengerList = new ArrayList<>(booking.getPassengers());
            logger.debug("ดึงข้อมูลผู้โดยสารในการจองสำเร็จ จำนวน: {}", passengerList.size());
            
            return passengerList;
        } catch (ResourceNotFoundException e) {
            logger.error("ไม่พบการจองสำหรับการดึงข้อมูลผู้โดยสาร: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการดึงข้อมูลผู้โดยสาร: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public Map<String, Object> getBookingPaymentStatus(String bookingId) throws ResourceNotFoundException {
        try {
            logger.debug("เริ่มตรวจสอบสถานะการชำระเงินของการจอง ID: {}", bookingId);
            
            // ตรวจสอบและดึงข้อมูลการจอง
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new ResourceNotFoundException("ไม่พบการจองกับรหัส: " + bookingId));
            
            // ดึงข้อมูลการชำระเงิน
            Payment payment = booking.getPayment();
            
            // สร้าง Map เพื่อส่งค่ากลับ
            Map<String, Object> paymentStatus = new HashMap<>();
            paymentStatus.put("bookingId", bookingId);
            paymentStatus.put("bookingStatus", booking.getBookingStatus());
            paymentStatus.put("totalPrice", booking.getTotalPrice());
            
            if (payment != null) {
                paymentStatus.put("paymentId", payment.getPaymentId());
                paymentStatus.put("paymentMethod", payment.getMethod()); // Use the actual getter method name
                paymentStatus.put("paymentStatus", payment.getPaymentStatus());
                paymentStatus.put("paymentDate", payment.getPaymentDate());
                paymentStatus.put("paymentAmount", payment.getAmount());
                paymentStatus.put("isPaid", "Completed".equals(payment.getPaymentStatus()));
            } else {
                paymentStatus.put("paymentStatus", "Not Found");
                paymentStatus.put("isPaid", false);
            }
            
            logger.debug("ตรวจสอบสถานะการชำระเงินสำเร็จ: {}", paymentStatus);
            return paymentStatus;
        } catch (ResourceNotFoundException e) {
            logger.error("ไม่พบการจองสำหรับการตรวจสอบสถานะการชำระเงิน: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("เกิดข้อผิดพลาดในการตรวจสอบสถานะการชำระเงิน: {}", e.getMessage(), e);
            throw e;
        }
    }
}