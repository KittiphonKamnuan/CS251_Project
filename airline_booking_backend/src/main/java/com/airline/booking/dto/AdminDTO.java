package com.airline.booking.dto;

import java.io.Serializable;

/**
 * Data Transfer Object (DTO) สำหรับข้อมูลแดชบอร์ดของผู้ดูแลระบบ
 * ใช้สำหรับส่งข้อมูลสถิติรวมและการเปลี่ยนแปลงไปยังหน้าแดชบอร์ด
 */
public class AdminDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    // สถิติทั่วไป
    private int totalUsers;          // จำนวนผู้ใช้ทั้งหมด
    private int totalBookings;       // จำนวนการจองทั้งหมด
    private int totalFlights;        // จำนวนเที่ยวบินทั้งหมด
    private int totalSeats;          // จำนวนที่นั่งทั้งหมด
    private int totalDiscounts;      // จำนวนส่วนลดทั้งหมด
    
    // เปอร์เซ็นต์การเปลี่ยนแปลง
    private int userChange;          // การเปลี่ยนแปลงของจำนวนผู้ใช้ (%)
    private int bookingChange;       // การเปลี่ยนแปลงของจำนวนการจอง (%)
    private double totalRevenue;     // รายได้ทั้งหมด
    private int revenueChange;       // การเปลี่ยนแปลงของรายได้ (%)
    private int flightChange;        // การเปลี่ยนแปลงของจำนวนเที่ยวบิน (%)
    
    // ข้อมูลเพิ่มเติม (ไม่ได้ใช้ในแดชบอร์ดตอนนี้ แต่อาจเพิ่มในอนาคต)
    private String topDepartureCity; // เมืองต้นทางยอดนิยม
    private String topArrivalCity;   // เมืองปลายทางยอดนิยม
    private int pendingBookingsCount; // จำนวนการจองที่รอดำเนินการ

    // Constructor แบบไม่มีพารามิเตอร์
    public AdminDTO() {
    }

    // Constructor หลักที่ใช้ในการสร้าง DTO จาก Controller
    public AdminDTO(int totalUsers, int totalBookings, int totalFlights, int totalSeats, int totalDiscounts,
                   int userChange, int bookingChange, double totalRevenue, int revenueChange, int flightChange) {
        this.totalUsers = totalUsers;
        this.totalBookings = totalBookings;
        this.totalFlights = totalFlights;
        this.totalSeats = totalSeats;
        this.totalDiscounts = totalDiscounts;
        this.userChange = userChange;
        this.bookingChange = bookingChange;
        this.totalRevenue = totalRevenue;
        this.revenueChange = revenueChange;
        this.flightChange = flightChange;
    }

    // Constructor แบบเต็มรูปแบบที่มีพารามิเตอร์ทั้งหมด
    public AdminDTO(int totalUsers, int totalBookings, int totalFlights, int totalSeats, int totalDiscounts,
                   int userChange, int bookingChange, double totalRevenue, int revenueChange, int flightChange,
                   String topDepartureCity, String topArrivalCity, int pendingBookingsCount) {
        this.totalUsers = totalUsers;
        this.totalBookings = totalBookings;
        this.totalFlights = totalFlights;
        this.totalSeats = totalSeats;
        this.totalDiscounts = totalDiscounts;
        this.userChange = userChange;
        this.bookingChange = bookingChange;
        this.totalRevenue = totalRevenue;
        this.revenueChange = revenueChange;
        this.flightChange = flightChange;
        this.topDepartureCity = topDepartureCity;
        this.topArrivalCity = topArrivalCity;
        this.pendingBookingsCount = pendingBookingsCount;
    }

    // Getters and Setters
    public int getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(int totalUsers) {
        this.totalUsers = totalUsers;
    }

    public int getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(int totalBookings) {
        this.totalBookings = totalBookings;
    }

    public int getTotalFlights() {
        return totalFlights;
    }

    public void setTotalFlights(int totalFlights) {
        this.totalFlights = totalFlights;
    }

    public int getTotalSeats() {
        return totalSeats;
    }

    public void setTotalSeats(int totalSeats) {
        this.totalSeats = totalSeats;
    }

    public int getTotalDiscounts() {
        return totalDiscounts;
    }

    public void setTotalDiscounts(int totalDiscounts) {
        this.totalDiscounts = totalDiscounts;
    }

    public int getUserChange() {
        return userChange;
    }

    public void setUserChange(int userChange) {
        this.userChange = userChange;
    }

    public int getBookingChange() {
        return bookingChange;
    }

    public void setBookingChange(int bookingChange) {
        this.bookingChange = bookingChange;
    }

    public double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public int getRevenueChange() {
        return revenueChange;
    }

    public void setRevenueChange(int revenueChange) {
        this.revenueChange = revenueChange;
    }

    public int getFlightChange() {
        return flightChange;
    }

    public void setFlightChange(int flightChange) {
        this.flightChange = flightChange;
    }

    public String getTopDepartureCity() {
        return topDepartureCity;
    }

    public void setTopDepartureCity(String topDepartureCity) {
        this.topDepartureCity = topDepartureCity;
    }

    public String getTopArrivalCity() {
        return topArrivalCity;
    }

    public void setTopArrivalCity(String topArrivalCity) {
        this.topArrivalCity = topArrivalCity;
    }

    public int getPendingBookingsCount() {
        return pendingBookingsCount;
    }

    public void setPendingBookingsCount(int pendingBookingsCount) {
        this.pendingBookingsCount = pendingBookingsCount;
    }

    @Override
    public String toString() {
        return "AdminDTO{" +
                "totalUsers=" + totalUsers +
                ", totalBookings=" + totalBookings +
                ", totalFlights=" + totalFlights +
                ", totalSeats=" + totalSeats +
                ", totalDiscounts=" + totalDiscounts +
                ", userChange=" + userChange + "%" +
                ", bookingChange=" + bookingChange + "%" +
                ", totalRevenue=" + totalRevenue +
                ", revenueChange=" + revenueChange + "%" +
                ", flightChange=" + flightChange + "%" +
                (topDepartureCity != null ? ", topDepartureCity='" + topDepartureCity + '\'' : "") +
                (topArrivalCity != null ? ", topArrivalCity='" + topArrivalCity + '\'' : "") +
                (pendingBookingsCount > 0 ? ", pendingBookingsCount=" + pendingBookingsCount : "") +
                '}';
    }
}