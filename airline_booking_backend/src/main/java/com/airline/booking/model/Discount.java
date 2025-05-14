package com.airline.booking.model;

import javax.persistence.*;
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

    @ManyToMany(mappedBy = "discounts")
    private Set<Booking> bookings = new HashSet<>();

    // Constructors
    public Discount() {
    }

    public Discount(String discountId, Integer pointRequired, LocalDate expiryDate) {
        this.discountId = discountId;
        this.pointRequired = pointRequired;
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

    public Set<Booking> getBookings() {
        return bookings;
    }

    public void setBookings(Set<Booking> bookings) {
        this.bookings = bookings;
    }

    @Override
    public String toString() {
        return "Discount{" +
                "discountId='" + discountId + '\'' +
                ", pointRequired=" + pointRequired +
                ", expiryDate=" + expiryDate +
                '}';
    }
}