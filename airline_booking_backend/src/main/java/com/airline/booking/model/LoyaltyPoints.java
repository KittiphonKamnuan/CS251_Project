package com.airline.booking.model;

import javax.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "LoyaltyPoints")
public class LoyaltyPoints {

    @Id
    @Column(name = "LoyaltyID", length = 10)
    private String loyaltyId;

    @ManyToOne
    @JoinColumn(name = "BookingID", referencedColumnName = "BookingID")
    private Booking booking;

    @Column(name = "PointsBalance")
    private Integer pointsBalance;

    @Column(name = "PointsExpiryDate")
    private LocalDate pointsExpiryDate;

    // Constructors
    public LoyaltyPoints() {
    }

    public LoyaltyPoints(String loyaltyId, Booking booking, Integer pointsBalance, LocalDate pointsExpiryDate) {
        this.loyaltyId = loyaltyId;
        this.booking = booking;
        this.pointsBalance = pointsBalance;
        this.pointsExpiryDate = pointsExpiryDate;
    }

    // Getters and Setters
    public String getLoyaltyId() {
        return loyaltyId;
    }

    public void setLoyaltyId(String loyaltyId) {
        this.loyaltyId = loyaltyId;
    }

    public Booking getBooking() {
        return booking;
    }

    public void setBooking(Booking booking) {
        this.booking = booking;
    }

    public Integer getPointsBalance() {
        return pointsBalance;
    }

    public void setPointsBalance(Integer pointsBalance) {
        this.pointsBalance = pointsBalance;
    }

    public LocalDate getPointsExpiryDate() {
        return pointsExpiryDate;
    }

    public void setPointsExpiryDate(LocalDate pointsExpiryDate) {
        this.pointsExpiryDate = pointsExpiryDate;
    }

    @Override
    public String toString() {
        return "LoyaltyPoints{" +
                "loyaltyId='" + loyaltyId + '\'' +
                ", bookingId='" + (booking != null ? booking.getBookingId() : "null") + '\'' +
                ", pointsBalance=" + pointsBalance +
                ", pointsExpiryDate=" + pointsExpiryDate +
                '}';
    }
}