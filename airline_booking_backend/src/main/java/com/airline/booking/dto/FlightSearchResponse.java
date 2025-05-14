package com.airline.booking.dto;

import java.util.List;

public class FlightSearchResponse {
    private List<FlightDTO> flights;
    private int totalFlights;
    private int currentPage;
    private int totalPages;

    // Constructors
    public FlightSearchResponse() {
    }

    public FlightSearchResponse(List<FlightDTO> flights, int totalFlights, int currentPage, int totalPages) {
        this.flights = flights;
        this.totalFlights = totalFlights;
        this.currentPage = currentPage;
        this.totalPages = totalPages;
    }

    // Getters and Setters
    public List<FlightDTO> getFlights() {
        return flights;
    }

    public void setFlights(List<FlightDTO> flights) {
        this.flights = flights;
    }

    public int getTotalFlights() {
        return totalFlights;
    }

    public void setTotalFlights(int totalFlights) {
        this.totalFlights = totalFlights;
    }

    public int getCurrentPage() {
        return currentPage;
    }

    public void setCurrentPage(int currentPage) {
        this.currentPage = currentPage;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(int totalPages) {
        this.totalPages = totalPages;
    }
}