package com.dealOn.product.model.vo;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;
import java.util.List;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductVO {

    // 공통 정보 (목록 & 상세)
    private int productNo;
    private String name; 
    private String createDate; 
    private String location; 
    private String productType; 
    private BigDecimal currentPriceUnified; // 리스트 페이지용 가격
    private int views; 

    // 썸네일 이미지
    private String thumbnailUrl;

    // 상세 페이지 전용
    private String detail; 
    private String categoryName; 
    private String sellerNickname; 
    private String sellerProfileImage; 
    private List<String> imageUrls; // 상품의 모든 이미지 URL 리스트
    private int sellerTrust;

    // 일반 상품 정보
    private String productState;
    private BigDecimal price;

    // 경매 상품 정보
    private BigDecimal startPrice;
    private BigDecimal currentPrice;
    private Date endDate; 
}