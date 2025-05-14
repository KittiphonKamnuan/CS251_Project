package com.airline.booking.service;

import com.airline.booking.model.Booking;
import com.airline.booking.model.Passenger;
import com.airline.booking.exception.ResourceNotFoundException;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface BookingService {
    
    /**
     * ดึงการจองทั้งหมดในระบบ
     */
    List<Booking> getAllBookings();
    
    /**
     * ดึงการจองตาม ID
     * @param bookingId รหัสการจอง
     * @return ข้อมูลการจอง
     * @throws ResourceNotFoundException ถ้าไม่พบการจอง
     */
    Booking getBookingById(String bookingId) throws ResourceNotFoundException;
    
    /**
     * ดึงการจองตามผู้ใช้
     * @param userId รหัสผู้ใช้
     * @return รายการการจองของผู้ใช้
     */
    List<Booking> getBookingsByUserId(String userId);
    
    /**
     * ดึงการจองตามเที่ยวบิน
     * @param flightId รหัสเที่ยวบิน
     * @return รายการการจองสำหรับเที่ยวบิน
     */
    List<Booking> getBookingsByFlightId(String flightId);
    
    /**
     * ดึงการจองตามสถานะ
     * @param status สถานะการจอง
     * @return รายการการจองที่มีสถานะตามที่ระบุ
     */
    List<Booking> getBookingsByStatus(String status);
    
    /**
     * ดึงการจองตามช่วงวันที่
     * @param fromDate วันที่เริ่มต้น
     * @param toDate วันที่สิ้นสุด
     * @return รายการการจองในช่วงวันที่
     */
    List<Booking> getBookingsByDateRange(LocalDate fromDate, LocalDate toDate);
    
    /**
     * สร้างการจองใหม่
     * @param booking ข้อมูลการจอง
     * @param userId รหัสผู้ใช้
     * @param flightId รหัสเที่ยวบิน
     * @return ข้อมูลการจองที่สร้างใหม่
     * @throws ResourceNotFoundException ถ้าไม่พบผู้ใช้หรือเที่ยวบิน
     */
    Booking createBooking(Booking booking, String userId, String flightId) throws ResourceNotFoundException;
    
    /**
     * อัปเดตข้อมูลการจอง
     * @param bookingId รหัสการจอง
     * @param bookingDetails ข้อมูลการจองใหม่
     * @return ข้อมูลการจองที่อัปเดตแล้ว
     * @throws ResourceNotFoundException ถ้าไม่พบการจอง
     */
    Booking updateBooking(String bookingId, Booking bookingDetails) throws ResourceNotFoundException;
    
    /**
     * อัปเดตสถานะการจอง
     * @param bookingId รหัสการจอง
     * @param status สถานะใหม่
     * @return ข้อมูลการจองที่อัปเดตแล้ว
     * @throws ResourceNotFoundException ถ้าไม่พบการจอง
     */
    Booking updateBookingStatus(String bookingId, String status) throws ResourceNotFoundException;
    
    /**
     * ยกเลิกการจอง
     * @param bookingId รหัสการจอง
     * @return ข้อมูลการจองที่ยกเลิกแล้ว
     * @throws ResourceNotFoundException ถ้าไม่พบการจอง
     */
    Booking cancelBooking(String bookingId) throws ResourceNotFoundException;
    
    /**
     * ลบการจอง
     * @param bookingId รหัสการจอง
     * @throws ResourceNotFoundException ถ้าไม่พบการจอง
     */
    void deleteBooking(String bookingId) throws ResourceNotFoundException;
    
/**
     * เพิ่มผู้โดยสารในการจอง
     * @param bookingId รหัสการจอง
     * @param passenger ข้อมูลผู้โดยสาร
     * @return ข้อมูลการจองที่อัปเดตแล้ว
     * @throws ResourceNotFoundException ถ้าไม่พบการจอง
     */
    Booking addPassengerToBooking(String bookingId, Passenger passenger) throws ResourceNotFoundException;
    
    /**
     * ลบผู้โดยสารจากการจอง
     * @param bookingId รหัสการจอง
     * @param passengerId รหัสผู้โดยสาร
     * @return ข้อมูลการจองที่อัปเดตแล้ว
     * @throws ResourceNotFoundException ถ้าไม่พบการจองหรือผู้โดยสาร
     */
    Booking removePassengerFromBooking(String bookingId, String passengerId) throws ResourceNotFoundException;
    
    /**
     * เพิ่มส่วนลดในการจอง
     * @param bookingId รหัสการจอง
     * @param discountId รหัสส่วนลด
     * @return ข้อมูลการจองที่อัปเดตแล้ว
     * @throws ResourceNotFoundException ถ้าไม่พบการจองหรือส่วนลด
     */
    Booking applyDiscountToBooking(String bookingId, String discountId) throws ResourceNotFoundException;
    
    /**
     * ดึงผู้โดยสารในการจอง
     * @param bookingId รหัสการจอง
     * @return รายการผู้โดยสารในการจอง
     * @throws ResourceNotFoundException ถ้าไม่พบการจอง
     */
    List<Passenger> getBookingPassengers(String bookingId) throws ResourceNotFoundException;
    
    /**
     * ตรวจสอบสถานะการชำระเงิน
     * @param bookingId รหัสการจอง
     * @return ข้อมูลสถานะการชำระเงิน
     * @throws ResourceNotFoundException ถ้าไม่พบการจอง
     */
    Map<String, Object> getBookingPaymentStatus(String bookingId) throws ResourceNotFoundException;
}