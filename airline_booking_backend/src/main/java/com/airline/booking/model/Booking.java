package com.airline.booking.model;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "Booking")
public class Booking {

    @Id
    @Column(name = "BookingID", length = 10)
    private String bookingId;

    @ManyToOne
    @JoinColumn(name = "UserID", referencedColumnName = "UserID")
    private User user;

    @ManyToOne
    @JoinColumn(name = "FlightID", referencedColumnName = "FlightID")
    private Flight flight;

    @Column(name = "BookingDate")
    private LocalDate bookingDate;

    @Column(name = "BookingStatus", length = 20)
    private String bookingStatus;

    @Column(name = "TotalPrice", precision = 10, scale = 2)
    private BigDecimal totalPrice;

    // Relationships
    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL)
    private Set<Passenger> passengers = new HashSet<>();

    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL)
    private Payment payment;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL)
    private Set<LoyaltyPoints> loyaltyPoints = new HashSet<>();

    @ManyToMany
    @JoinTable(
        name = "Redeems",
        joinColumns = @JoinColumn(name = "BookingID"),
        inverseJoinColumns = @JoinColumn(name = "DiscountID")
    )
    private Set<Discount> discounts = new HashSet<>();

    // Constructors
    public Booking() {
    }

    public Booking(String bookingId, User user, Flight flight, LocalDate bookingDate, 
                  String bookingStatus, BigDecimal totalPrice) {
        this.bookingId = bookingId;
        this.user = user;
        this.flight = flight;
        this.bookingDate = bookingDate;
        this.bookingStatus = bookingStatus;
        this.totalPrice = totalPrice;
    }

    // Getters and Setters
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

    public Set<Passenger> getPassengers() {
        return passengers;
    }

    public void setPassengers(Set<Passenger> passengers) {
        this.passengers = passengers;
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

    public Set<Discount> getDiscounts() {
        return discounts;
    }

    public void setDiscounts(Set<Discount> discounts) {
        this.discounts = discounts;
    }

    // Helper methods
    public void addPassenger(Passenger passenger) {
        this.passengers.add(passenger);
        passenger.setBooking(this);
    }

    public void removePassenger(Passenger passenger) {
        this.passengers.remove(passenger);
        passenger.setBooking(null);
    }

    @Override
    public String toString() {
        return "Booking{" +
                "bookingId='" + bookingId + '\'' +
                ", userId='" + (user != null ? user.getUserId() : "null") + '\'' +
                ", flightId='" + (flight != null ? flight.getFlightId() : "null") + '\'' +
                ", bookingDate=" + bookingDate +
                ", bookingStatus='" + bookingStatus + '\'' +
                ", totalPrice=" + totalPrice +
                '}';
    }
}