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
    @JoinColumn(name = "UserID", referencedColumnName = "UserID", nullable = false)
    private User user;

    // This should match your actual database schema
    // Note: There is no BookingID in your actual database schema
    @Column(name = "UserID", insertable = false, updatable = false)
    private String userId;

    @Column(name = "PointsBalance")
    private Integer pointsBalance;

    @Column(name = "PointsExpiryDate")
    private LocalDate pointsExpiryDate;

    // Constructors
    public LoyaltyPoints() {
    }

    public LoyaltyPoints(String loyaltyId, User user, Integer pointsBalance, LocalDate pointsExpiryDate) {
        this.loyaltyId = loyaltyId;
        this.user = user;
        this.pointsBalance = pointsBalance;
        this.pointsExpiryDate = pointsExpiryDate;
        if (user != null) {
            this.userId = user.getUserId();
        }
    }

    // Getters and Setters
    public String getLoyaltyId() {
        return loyaltyId;
    }

    public void setLoyaltyId(String loyaltyId) {
        this.loyaltyId = loyaltyId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
        if (user != null) {
            this.userId = user.getUserId();
        }
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
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

    // Helper method to add points
    public void addPoints(Integer points) {
        if (this.pointsBalance == null) {
            this.pointsBalance = 0;
        }
        this.pointsBalance += points;
    }

    // Helper method to use points
    public boolean usePoints(Integer points) {
        if (this.pointsBalance == null || this.pointsBalance < points) {
            return false;
        }
        this.pointsBalance -= points;
        return true;
    }

    @Override
    public String toString() {
        return "LoyaltyPoints{" +
                "loyaltyId='" + loyaltyId + '\'' +
                ", userId='" + userId + '\'' +
                ", pointsBalance=" + pointsBalance +
                ", pointsExpiryDate=" + pointsExpiryDate +
                '}';
    }
}