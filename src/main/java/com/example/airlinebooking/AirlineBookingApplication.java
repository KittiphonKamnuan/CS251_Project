package com.example.airlinebooking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main application class for the Airline Booking System.
 * This is the entry point of the Spring Boot application.
 */
@SpringBootApplication
@EnableJpaAuditing // Enables JPA Auditing features
@EnableScheduling // Enables scheduling capabilities for tasks like cleaning up expired bookings
public class AirlineBookingApplication {

    /**
     * Main method to start the Spring Boot application.
     * 
     * @param args Command line arguments passed to the application
     */
    public static void main(String[] args) {
        SpringApplication.run(AirlineBookingApplication.class, args);
    }
    
    /**
     * You can add additional beans or configuration methods here if needed.
     * For example:
     */
    /*
    @Bean
    public CommandLineRunner demoData(UserRepository userRepository, 
                                     FlightRepository flightRepository,
                                     PasswordEncoder passwordEncoder) {
        return args -> {
            // Add initial admin user
            if (userRepository.findByUsername("admin").isEmpty()) {
                User admin = new User();
                admin.setUserId("ADMIN001");
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("adminPassword"));
                admin.setEmail("admin@airlinebooking.com");
                admin.setFirstName("Admin");
                admin.setLastName("User");
                admin.setRole("ADMIN");
                userRepository.save(admin);
            }
            
            // Add sample flights
            if (flightRepository.count() == 0) {
                // Sample flights can be added here
                Flight flight1 = new Flight();
                flight1.setFlightId("FL001");
                flight1.setFlightNumber("THA123");
                flight1.setDepartureCity("Bangkok");
                flight1.setArrivalCity("Chiang Mai");
                flight1.setDepartureTime(new Date()); // Set appropriate date
                flight1.setArrivalTime(new Date()); // Set appropriate date
                flight1.setAircraft("Boeing 737");
                flight1.setFlightStatus("Scheduled");
                flightRepository.save(flight1);
                
                // Add more sample flights as needed
            }
        };
    }
    */
}