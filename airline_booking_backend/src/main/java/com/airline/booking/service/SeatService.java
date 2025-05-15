package com.airline.booking.service;

import com.airline.booking.model.Seat;
import com.airline.booking.repository.SeatRepository;
import com.airline.booking.exception.ResourceNotFoundException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SeatService {

    private static final Logger logger = LoggerFactory.getLogger(SeatService.class);

    @Autowired
    private SeatRepository seatRepository;
    
    public List<Seat> getAllSeats() {
        logger.debug("เรียกดูที่นั่งทั้งหมด");
        return seatRepository.findAll();
    }
    
    public Seat getSeatById(String seatId) {
        logger.debug("เรียกดูที่นั่งด้วย ID: {}", seatId);
        return seatRepository.findById(seatId)
                .orElseThrow(() -> new ResourceNotFoundException("ไม่พบที่นั่งด้วย ID: " + seatId));
    }
    
    public List<Seat> getSeatsByFlightId(String flightId) {
        logger.debug("เรียกดูที่นั่งตามเที่ยวบิน ID: {}", flightId);
        List<Seat> seats = seatRepository.findByFlightId(flightId);
        if (seats.isEmpty()) {
            logger.warn("ไม่พบที่นั่งสำหรับเที่ยวบิน ID: {}", flightId);
            throw new ResourceNotFoundException("ไม่พบที่นั่งสำหรับเที่ยวบิน ID: " + flightId);
        }
        logger.debug("พบที่นั่งสำหรับเที่ยวบิน ID: {} จำนวน: {}", flightId, seats.size());
        return seats;
    }
    
    public List<Seat> getAvailableSeatsByFlightId(String flightId) {
        logger.debug("เรียกดูที่นั่งว่างตามเที่ยวบิน ID: {}", flightId);
        List<Seat> availableSeats = seatRepository.findByFlightIdAndSeatStatus(flightId, "Available");
        if (availableSeats.isEmpty()) {
            logger.warn("ไม่พบที่นั่งว่างสำหรับเที่ยวบิน ID: {}", flightId);
            throw new ResourceNotFoundException("ไม่พบที่นั่งว่างสำหรับเที่ยวบิน ID: " + flightId);
        }
        logger.debug("พบที่นั่งว่างสำหรับเที่ยวบิน ID: {} จำนวน: {}", flightId, availableSeats.size());
        return availableSeats;
    }
    
    public List<Seat> getSeatsByFlightIdAndClass(String flightId, String seatClass) {
        logger.debug("เรียกดูที่นั่งตามเที่ยวบิน ID: {} และชั้นโดยสาร: {}", flightId, seatClass);
        List<Seat> seats = seatRepository.findByFlightIdAndSeatClass(flightId, seatClass);
        if (seats.isEmpty()) {
            logger.warn("ไม่พบที่นั่งสำหรับเที่ยวบิน ID: {} และชั้นโดยสาร: {}", flightId, seatClass);
            throw new ResourceNotFoundException("ไม่พบที่นั่งสำหรับเที่ยวบิน ID: " + flightId + " และชั้นโดยสาร: " + seatClass);
        }
        logger.debug("พบที่นั่งสำหรับเที่ยวบิน ID: {} และชั้นโดยสาร: {} จำนวน: {}", flightId, seatClass, seats.size());
        return seats;
    }
    
    public Seat createSeat(Seat seat) {
        logger.debug("สร้างที่นั่งใหม่: {}", seat);
        return seatRepository.save(seat);
    }
    
    public Seat updateSeat(String seatId, Seat seatDetails) {
        logger.debug("อัปเดตที่นั่ง ID: {}", seatId);
        Seat seat = getSeatById(seatId);
        
        seat.setSeatNumber(seatDetails.getSeatNumber());
        seat.setFlight(seatDetails.getFlight());  // ใช้ setFlight แทน setFlightId
        seat.setSeatClass(seatDetails.getSeatClass());
        seat.setSeatStatus(seatDetails.getSeatStatus());
        seat.setPrice(seatDetails.getPrice());
        
        logger.debug("ที่นั่งหลังอัปเดต: {}", seat);
        return seatRepository.save(seat);
    }
    
    public Seat updateSeatStatus(String seatId, String newStatus) {
        logger.debug("อัปเดตสถานะที่นั่ง ID: {} เป็น: {}", seatId, newStatus);
        Seat seat = getSeatById(seatId);
        
        // ตรวจสอบสถานะที่ถูกต้อง
        if (!newStatus.equals("Available") && !newStatus.equals("Booked") && 
            !newStatus.equals("Reserved") && !newStatus.equals("Unavailable")) {
            logger.warn("สถานะที่นั่งไม่ถูกต้อง: {}", newStatus);
            throw new IllegalArgumentException("สถานะที่นั่งไม่ถูกต้อง: " + newStatus);
        }
        
        seat.setSeatStatus(newStatus);
        logger.debug("ที่นั่งหลังอัปเดตสถานะ: {}", seat);
        return seatRepository.save(seat);
    }
    
    public void deleteSeat(String seatId) {
        logger.debug("ลบที่นั่ง ID: {}", seatId);
        Seat seat = getSeatById(seatId);
        seatRepository.delete(seat);
        logger.debug("ลบที่นั่งสำเร็จ ID: {}", seatId);
    }
}