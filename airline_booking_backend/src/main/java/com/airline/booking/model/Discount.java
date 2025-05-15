package com.airline.booking.model;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "Discount")
public class Discount {

    @Id
    @Column(name = "DiscountID", length = 10)
    private String discountId;

    @Column(name = "PointRequired")
    private Integer pointRequired;

    @Column(name = "ExpiryDate")
    private LocalDate expiryDate;
    
    @Column(name = "DiscountValue", precision = 10, scale = 2)
    private BigDecimal discountValue;

    // Use the Redeems join table for bookings
    @ManyToMany(mappedBy = "discounts", fetch = FetchType.LAZY)
    private Set<Booking> bookings = new HashSet<>();

    // Constructors
    public Discount() {
    }

    public Discount(String discountId, Integer pointRequired, BigDecimal discountValue, LocalDate expiryDate) {
        this.discountId = discountId;
        this.pointRequired = pointRequired;
        this.discountValue = discountValue;
        this.expiryDate = expiryDate;
    }

    // Getters and Setters
    public String getDiscountId() {
        return discountId;
    }

    public void setDiscountId(String discountId) {
        this.discountId = discountId;
    }

    public Integer getPointRequired() {
        return pointRequired;
    }

    public void setPointRequired(Integer pointRequired) {
        this.pointRequired = pointRequired;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }
    
    public BigDecimal getDiscountValue() {
        return discountValue;
    }
    
    public void setDiscountValue(BigDecimal discountValue) {
        this.discountValue = discountValue;
    }
    
    // Helper method for setting discount value as double
    public void setDiscountValue(double discountValue) {
        this.discountValue = BigDecimal.valueOf(discountValue);
    }
    
    // Helper method for getting discount value as double
    public double getDiscountValueAsDouble() {
        return discountValue != null ? discountValue.doubleValue() : 0.0;
    }

    public Set<Booking> getBookings() {
        return bookings;
    }

    public void setBookings(Set<Booking> bookings) {
        this.bookings = bookings;
    }
    
    // Helper method for adding booking
    public void addBooking(Booking booking) {
        this.bookings.add(booking);
        booking.getDiscounts().add(this);
    }
    
    // Helper method for removing booking
    public void removeBooking(Booking booking) {
        this.bookings.remove(booking);
        booking.getDiscounts().remove(this);
    }

    @Override
    public String toString() {
        return "Discount{" +
                "discountId='" + discountId + '\'' +
                ", pointRequired=" + pointRequired +
                ", discountValue=" + discountValue +
                ", expiryDate=" + expiryDate +
                '}';
    }
}