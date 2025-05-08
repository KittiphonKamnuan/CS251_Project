// src/main/java/com/example/airlinebooking/model/User.java
package com.example.airlinebooking.model;

import jakarta.persistence.*;
import java.util.Set;

@Entity
@Table(name = "user")
public class User {
    @Id
    private String userId;
    
    @Column(unique = true, nullable = false)
    private String username;
    
    @Column(nullable = false)
    private String password;
    
    private String email;
    private String firstName;
    private String lastName;
    private String address;
    private String phone;
    private String role;
    
    // Constructors, Getters, Setters
}