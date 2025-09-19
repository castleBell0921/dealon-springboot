package com.dealOn.product.model.vo;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data // Getter, Setter, toString, equals, hashCode 자동 생성
@NoArgsConstructor // 파라미터 없는 기본 생성자 생성
@AllArgsConstructor // 모든 필드를 파라미터로 받는 생성자 생성
public class ProductVO {
    private int productNo;
    private String name;
    private String detail;
    private String createDate;
    private int category;
    private String location;
    private BigDecimal currentPriceUnified; // BigDecimal로 숫자 정밀도 유지
    private int views;
    private String productType;
    private String imageUrl;
}