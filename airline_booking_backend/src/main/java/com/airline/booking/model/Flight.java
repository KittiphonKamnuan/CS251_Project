package com.airline.booking.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "Flight")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Flight {

    @Id
    @Column(name = "FlightID", length = 10)
    private String flightId;

    @Column(name = "FlightNumber", length = 20)
    private String flightNumber;

    @Column(name = "DepartureCity", length = 50)
    private String departureCity;

    @Column(name = "ArrivalCity", length = 50)
    private String arrivalCity;

    @Column(name = "DepartureTime")
    private LocalDateTime departureTime;

    @Column(name = "ArrivalTime")
    private LocalDateTime arrivalTime;

    @Column(name = "Aircraft", length = 50)
    private String aircraft;

    @Column(name = "FlightStatus", length = 20)
    private String flightStatus;

    // Relationships - ใช้ JsonIgnore เพื่อป้องกัน infinite recursion
    @JsonIgnore
    @OneToMany(mappedBy = "flight", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Booking> bookings = new HashSet<>();

    @JsonIgnore
    @OneToMany(mappedBy = "flight", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Seat> seats = new HashSet<>();

    // Constructors
    public Flight() {
    }

    public Flight(String flightId, String flightNumber, String departureCity, String arrivalCity,
                 LocalDateTime departureTime, LocalDateTime arrivalTime, String aircraft, String flightStatus) {
        this.flightId = flightId;
        this.flightNumber = flightNumber;
        this.departureCity = departureCity;
        this.arrivalCity = arrivalCity;
        this.departureTime = departureTime;
        this.arrivalTime = arrivalTime;
        this.aircraft = aircraft;
        this.flightStatus = flightStatus;
    }

    // Getters and Setters
    public String getFlightId() {
        return flightId;
    }

    public void setFlightId(String flightId) {
        this.flightId = flightId;
    }

    public String getFlightNumber() {
        return flightNumber;
    }

    public void setFlightNumber(String flightNumber) {
        this.flightNumber = flightNumber;
    }

    public String getDepartureCity() {
        return departureCity;
    }

    public void setDepartureCity(String departureCity) {
        this.departureCity = departureCity;
    }

    public String getArrivalCity() {
        return arrivalCity;
    }

    public void setArrivalCity(String arrivalCity) {
        this.arrivalCity = arrivalCity;
    }

    public LocalDateTime getDepartureTime() {
        return departureTime;
    }

    public void setDepartureTime(LocalDateTime departureTime) {
        this.departureTime = departureTime;
    }

    public LocalDateTime getArrivalTime() {
        return arrivalTime;
    }

    public void setArrivalTime(LocalDateTime arrivalTime) {
        this.arrivalTime = arrivalTime;
    }

    public String getAircraft() {
        return aircraft;
    }

    public void setAircraft(String aircraft) {
        this.aircraft = aircraft;
    }

    public String getFlightStatus() {
        return flightStatus;
    }

    public void setFlightStatus(String flightStatus) {
        this.flightStatus = flightStatus;
    }

    public Set<Booking> getBookings() {
        return bookings;
    }

    public void setBookings(Set<Booking> bookings) {
        this.bookings = bookings;
    }

    public Set<Seat> getSeats() {
        return seats;
    }

    public void setSeats(Set<Seat> seats) {
        this.seats = seats;
    }

    // Helper methods
    public void addBooking(Booking booking) {
        this.bookings.add(booking);
        booking.setFlight(this);
    }

    public void removeBooking(Booking booking) {
        this.bookings.remove(booking);
        booking.setFlight(null);
    }

    public void addSeat(Seat seat) {
        this.seats.add(seat);
        seat.setFlight(this);
    }

    public void removeSeat(Seat seat) {
        this.seats.remove(seat);
        seat.setFlight(null);
    }
    
    // เพิ่มเมธอดเพื่อคำนวณราคาเริ่มต้น
    public BigDecimal getBasePrice() {
        if (seats == null || seats.isEmpty()) {
            return new BigDecimal("1290");
        }
        
        return seats.stream()
                .map(Seat::getPrice)
                .min(BigDecimal::compareTo)
                .orElse(new BigDecimal("1290"));
    }

    @Override
    public String toString() {
        return "Flight{" +
                "flightId='" + flightId + '\'' +
                ", flightNumber='" + flightNumber + '\'' +
                ", departureCity='" + departureCity + '\'' +
                ", arrivalCity='" + arrivalCity + '\'' +
                ", departureTime=" + departureTime +
                ", arrivalTime=" + arrivalTime +
                ", aircraft='" + aircraft + '\'' +
                ", flightStatus='" + flightStatus + '\'' +
                '}';
    }
    
    // เพิ่มเมธอดเพื่อคำนวณระยะเวลาเดินทาง
    public long getDurationMinutes() {
        if (departureTime == null || arrivalTime == null) {
            return 0;
        }
        
        return java.time.Duration.between(departureTime, arrivalTime).toMinutes();
    }
    
    public String getFormattedDuration() {
        long minutes = getDurationMinutes();
        long hours = minutes / 60;
        long remainingMinutes = minutes % 60;
        
        return hours + "h " + remainingMinutes + "m";
    }
}