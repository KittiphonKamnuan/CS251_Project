package com.airline.booking.model;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "Booking")
public class Booking {

    @Id
    @Column(name = "BookingID", length = 10)
    private String bookingId;

    @JsonBackReference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "UserID")
    private User user;

    @JsonBackReference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "FlightID")
    private Flight flight;
    
    @Column(name = "BookingDate")
    private LocalDate bookingDate;

    @Column(name = "BookingStatus", length = 20)
    private String bookingStatus;

    @Column(name = "TotalPrice", precision = 10, scale = 2)
    private BigDecimal totalPrice;
    
    @Column(name = "ContactEmail", length = 100)
    private String contactEmail;
    
    @Column(name = "ContactPhone", length = 20)
    private String contactPhone;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "Redeems",
        joinColumns = @JoinColumn(name = "BookingID"),
        inverseJoinColumns = @JoinColumn(name = "DiscountID")
    )
    private Set<Discount> discounts = new HashSet<>();

    @JsonManagedReference(value = "booking-passengers")
    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<Passenger> passengers = new HashSet<>();
    
    @JsonManagedReference(value = "booking-payment")
    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL, fetch = FetchType.LAZY, optional = true)
    private Payment payment;

    // Transient fields (not persisted)
    @Transient
    private Set<LoyaltyPoints> loyaltyPoints = new HashSet<>();

    @Transient
    private List<Passenger> passengerList;

    // Constructors
    public Booking() {
    }

    public Booking(String bookingId, LocalDate bookingDate, String bookingStatus, BigDecimal totalPrice) {
        this.bookingId = bookingId;
        this.bookingDate = bookingDate;
        this.bookingStatus = bookingStatus;
        this.totalPrice = totalPrice;
    }

    // Getters and setters

    public String getBookingId() {
        return bookingId;
    }

    public void setBookingId(String bookingId) {
        this.bookingId = bookingId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Flight getFlight() {
        return flight;
    }

    public void setFlight(Flight flight) {
        this.flight = flight;
    }

    public LocalDate getBookingDate() {
        return bookingDate;
    }

    public void setBookingDate(LocalDate bookingDate) {
        this.bookingDate = bookingDate;
    }

    public String getBookingStatus() {
        return bookingStatus;
    }

    public void setBookingStatus(String bookingStatus) {
        this.bookingStatus = bookingStatus;
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }

    public void setTotalPrice(double totalPrice) {
        this.totalPrice = BigDecimal.valueOf(totalPrice);
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public Set<Discount> getDiscounts() {
        return discounts;
    }

    public void setDiscounts(Set<Discount> discounts) {
        this.discounts = discounts;
    }

    public Set<Passenger> getPassengers() {
        return passengers;
    }

    public void setPassengers(Set<Passenger> passengers) {
        this.passengers = passengers;
    }

    public List<Passenger> getPassengerList() {
        if (passengerList == null) {
            passengerList = new ArrayList<>(passengers);
        }
        return passengerList;
    }

    public void setPassengerList(List<Passenger> passengerList) {
        this.passengerList = passengerList;
        this.passengers = new HashSet<>(passengerList);
    }

    public Payment getPayment() {
        return payment;
    }

    public void setPayment(Payment payment) {
        this.payment = payment;
    }

    public Set<LoyaltyPoints> getLoyaltyPoints() {
        return loyaltyPoints;
    }

    public void setLoyaltyPoints(Set<LoyaltyPoints> loyaltyPoints) {
        this.loyaltyPoints = loyaltyPoints;
    }

    // Helper methods to maintain bidirectional consistency
    public void addPassenger(Passenger passenger) {
        passengers.add(passenger);
        passenger.setBooking(this);
    }

    public void removePassenger(Passenger passenger) {
        passengers.remove(passenger);
        passenger.setBooking(null);
    }

    public void addDiscount(Discount discount) {
        discounts.add(discount);
    }

    public void removeDiscount(Discount discount) {
        discounts.remove(discount);
    }

    // Convenience methods for IDs
    public String getUserId() {
        return user != null ? user.getUserId() : null;
    }

    public void setUserId(String userId) {
        if (userId == null || userId.isEmpty()) {
            this.user = null;
            return;
        }
        if (this.user == null) {
            User newUser = new User();
            newUser.setUserId(userId);
            this.user = newUser;
        } else {
            this.user.setUserId(userId);
        }
    }

    public String getFlightId() {
        return flight != null ? flight.getFlightId() : null;
    }

    public void setFlightId(String flightId) {
        if (flightId == null || flightId.isEmpty()) {
            this.flight = null;
            return;
        }
        if (this.flight == null) {
            Flight newFlight = new Flight();
            newFlight.setFlightId(flightId);
            this.flight = newFlight;
        } else {
            this.flight.setFlightId(flightId);
        }
    }

    public double getTotalPriceAsDouble() {
        return totalPrice != null ? totalPrice.doubleValue() : 0.0;
    }

    public List<Passenger> getPassengersAsList() {
        return new ArrayList<>(this.passengers);
    }

    @Override
    public String toString() {
        return "Booking{" +
                "bookingId='" + bookingId + '\'' +
                ", userId='" + getUserId() + '\'' +
                ", flightId='" + getFlightId() + '\'' +
                ", bookingDate=" + bookingDate +
                ", bookingStatus='" + bookingStatus + '\'' +
                ", totalPrice=" + totalPrice +
                ", passengers=" + (passengers != null ? passengers.size() : 0) +
                '}';
    }
}
