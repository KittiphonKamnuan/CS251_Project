package com.airline.booking.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class DiscountDTO {
    
    private String discountId;
    private Integer pointRequired;
    private BigDecimal discountValue;
    private String expiryDate;  // เปลี่ยนเป็น String เพื่อความง่ายในการ serialize/deserialize
    
    // Constructors
    public DiscountDTO() {
    }
    
    public DiscountDTO(String discountId, Integer pointRequired, BigDecimal discountValue, String expiryDate) {
        this.discountId = discountId;
        this.pointRequired = pointRequired;
        this.discountValue = discountValue;
        this.expiryDate = expiryDate;
    }
    
    // Getters and Setters
    public String getDiscountId() {
        return discountId;
    }
    
    public void setDiscountId(String discountId) {
        this.discountId = discountId;
    }
    
    public Integer getPointRequired() {
        return pointRequired;
    }
    
    public void setPointRequired(Integer pointRequired) {
        this.pointRequired = pointRequired;
    }
    
    public BigDecimal getDiscountValue() {
        return discountValue;
    }
    
    public void setDiscountValue(BigDecimal discountValue) {
        this.discountValue = discountValue;
    }
    
    // Convenience method for setting discount value as double
    public void setDiscountValue(double discountValue) {
        this.discountValue = BigDecimal.valueOf(discountValue);
    }
    
    public String getExpiryDate() {
        return expiryDate;
    }
    
    public void setExpiryDate(String expiryDate) {
        this.expiryDate = expiryDate;
    }
    
    @Override
    public String toString() {
        return "DiscountDTO{" +
                "discountId='" + discountId + '\'' +
                ", pointRequired=" + pointRequired +
                ", discountValue=" + discountValue +
                ", expiryDate='" + expiryDate + '\'' +
                '}';
    }
}