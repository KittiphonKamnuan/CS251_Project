package com.airline.booking.repository;

import com.airline.booking.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    User findByUsername(String username);
    
    boolean existsByUsername(String username);
    
    boolean existsByEmail(String email);
    
    List<User> findByRole(String role);
    
    List<User> findTop5ByOrderByUserIdDesc();
    
    List<User> findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(String username, String email);
    
    // OR use positional parameters like this:
    // @Query(value = "SELECT * FROM users LIMIT ?2 OFFSET ?1", nativeQuery = true)
    // List<User> findWithPagination(int offset, Integer limit);
}