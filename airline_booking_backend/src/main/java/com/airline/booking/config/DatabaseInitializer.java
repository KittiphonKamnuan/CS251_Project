package com.airline.booking.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

@Configuration
public class DatabaseInitializer {

    @Autowired
    private Environment env;

    @Bean
    public CommandLineRunner createDatabaseIfNotExist() {
        return args -> {
            System.out.println("Checking if database exists or needs to be created");
            
            String url = "jdbc:mysql://localhost:3306?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true";
            String username = env.getProperty("spring.datasource.username");
            String password = env.getProperty("spring.datasource.password");
            
            try (Connection connection = DriverManager.getConnection(url, username, password);
                 Statement statement = connection.createStatement()) {
                
                statement.executeUpdate("CREATE DATABASE IF NOT EXISTS AirlineBooking");
                System.out.println("Database AirlineBooking created or already exists");
                
                // เลือกใช้ฐานข้อมูล
                statement.executeUpdate("USE AirlineBooking");
                System.out.println("Using AirlineBooking database");
                
            } catch (Exception e) {
                e.printStackTrace();
                System.err.println("Error creating database: " + e.getMessage());
            }
        };
    }
}