package com.airline.booking.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.jdbc.datasource.init.DatabasePopulatorUtils;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;

@Configuration
public class DatabaseInitializer {

    @Autowired
    private Environment env;

    @Autowired
    private DataSource dataSource;

    @Bean
    public CommandLineRunner initializeDatabase() {
        return args -> {
            // สร้างฐานข้อมูล ถ้ายังไม่มี (ต้องใช้ Connection แยกที่ไม่เจาะจง DB)
            createDatabaseIfNotExist();

            // รันไฟล์ SQL ตามลำดับ (schema-drop.sql -> schema.sql -> data.sql)
            runSqlScripts();
        };
    }

    private void createDatabaseIfNotExist() {
        String url = env.getProperty("spring.datasource.url");
        String username = env.getProperty("spring.datasource.username");
        String password = env.getProperty("spring.datasource.password");

        // ดัดแปลง URL ให้เป็นแค่ host+port ไม่รวม database เพื่อสร้าง DB ใหม่ได้
        String baseUrl = url.replaceAll("/[^/]+(\\?.*)?$", "/");

        try (Connection connection = java.sql.DriverManager.getConnection(baseUrl, username, password);
             Statement statement = connection.createStatement()) {

            statement.executeUpdate("CREATE DATABASE IF NOT EXISTS AirlineBooking");
            System.out.println("Database AirlineBooking created or already exists");

        } catch (SQLException e) {
            System.err.println("Error creating database: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void runSqlScripts() {
        try {
            ResourceDatabasePopulator populator = new ResourceDatabasePopulator();
            populator.addScript(new ClassPathResource("schema-drop.sql"));
            populator.addScript(new ClassPathResource("schema.sql"));
            populator.addScript(new ClassPathResource("data.sql"));

            DatabasePopulatorUtils.execute(populator, dataSource);
            System.out.println("Database schema and data scripts executed successfully");

        } catch (Exception e) {
            System.err.println("Error executing SQL scripts: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
