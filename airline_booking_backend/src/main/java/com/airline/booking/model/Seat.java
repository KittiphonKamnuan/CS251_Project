package com.airline.booking.model;

import com.fasterxml.jackson.annotation.JsonBackReference;

import javax.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "Seat")
public class Seat {

    @Id
    @Column(name = "SeatID", length = 10)
    private String seatId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "FlightID", referencedColumnName = "FlightID")
    @JsonBackReference
    private Flight flight;

    @Column(name = "SeatNumber", length = 5)
    private String seatNumber;

    @Column(name = "Class", length = 20)
    private String seatClass;

    @Column(name = "SeatStatus", length = 20)
    private String seatStatus;

    @Column(name = "Price", precision = 10, scale = 2)
    private BigDecimal price;

    // Constructors
    public Seat() {
    }

    public Seat(String seatId, Flight flight, String seatNumber, String seatClass,
                String seatStatus, BigDecimal price) {
        this.seatId = seatId;
        this.flight = flight;
        this.seatNumber = seatNumber;
        this.seatClass = seatClass;
        this.seatStatus = seatStatus;
        this.price = price;
    }

    // Getters and Setters
    public String getSeatId() {
        return seatId;
    }

    public void setSeatId(String seatId) {
        this.seatId = seatId;
    }

    public Flight getFlight() {
        return flight;
    }

    public void setFlight(Flight flight) {
        this.flight = flight;
    }

    public String getSeatNumber() {
        return seatNumber;
    }

    public void setSeatNumber(String seatNumber) {
        this.seatNumber = seatNumber;
    }

    public String getSeatClass() {
        return seatClass;
    }

    public void setSeatClass(String seatClass) {
        this.seatClass = seatClass;
    }

    public String getSeatStatus() {
        return seatStatus;
    }

    public void setSeatStatus(String seatStatus) {
        this.seatStatus = seatStatus;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    // Helper methods
    public String getFlightId() {
        return flight != null ? flight.getFlightId() : null;
    }

    public String getFlightNumber() {
        return flight != null ? flight.getFlightNumber() : null;
    }

    @Override
    public String toString() {
        return "Seat{" +
                "seatId='" + seatId + '\'' +
                ", flight=" + (flight != null ? flight.getFlightId() : "null") +
                ", seatNumber='" + seatNumber + '\'' +
                ", seatClass='" + seatClass + '\'' +
                ", seatStatus='" + seatStatus + '\'' +
                ", price=" + price +
                '}';
    }
}
