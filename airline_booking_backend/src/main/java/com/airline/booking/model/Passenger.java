package com.airline.booking.model;

import javax.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "Passenger")
public class Passenger {

    @Id
    @Column(name = "PassengerID", length = 10)
    private String passengerId;

    @Column(name = "FirstName", length = 50)
    private String firstName;

    @Column(name = "LastName", length = 50)
    private String lastName;

    @Column(name = "DateOfBirth")
    private LocalDate dateOfBirth;

    @Column(name = "PassportNumber", length = 20)
    private String passportNumber;

    @ManyToOne
    @JoinColumn(name = "BookingID", referencedColumnName = "BookingID")
    private Booking booking;

    // Constructors
    public Passenger() {
    }

    public Passenger(String passengerId, String firstName, String lastName, 
                    LocalDate dateOfBirth, String passportNumber, Booking booking) {
        this.passengerId = passengerId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.dateOfBirth = dateOfBirth;
        this.passportNumber = passportNumber;
        this.booking = booking;
    }

    // Getters and Setters
    public String getPassengerId() {
        return passengerId;
    }

    public void setPassengerId(String passengerId) {
        this.passengerId = passengerId;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getPassportNumber() {
        return passportNumber;
    }

    public void setPassportNumber(String passportNumber) {
        this.passportNumber = passportNumber;
    }

    public Booking getBooking() {
        return booking;
    }

    public void setBooking(Booking booking) {
        this.booking = booking;
    }

    @Override
    public String toString() {
        return "Passenger{" +
                "passengerId='" + passengerId + '\'' +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", dateOfBirth=" + dateOfBirth +
                ", passportNumber='" + passportNumber + '\'' +
                ", bookingId='" + (booking != null ? booking.getBookingId() : "null") + '\'' +
                '}';
    }
}