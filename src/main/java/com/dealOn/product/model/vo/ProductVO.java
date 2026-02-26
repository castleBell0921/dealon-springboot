package com.dealOn.product.model.vo;


import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Date;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductVO {

    // 공통 정보 (목록 & 상세)
    private int productNo;
    private String name; 
    private String createDate;
    public String getCreateDate() {
        // 1. 데이터가 없거나 비어있으면 그대로 반환
        if (this.createDate == null || this.createDate.trim().isEmpty()) {
            return this.createDate;
        }

        try {
            // 2. 유연한 포맷터 생성 (초가 있든 없든 다 읽을 수 있음)
            java.time.format.DateTimeFormatter formatter = new java.time.format.DateTimeFormatterBuilder()
                    .appendPattern("yyyy-MM-dd HH:mm")
                    .optionalStart()
                    .appendPattern(":ss")
                    .optionalEnd()
                    .toFormatter();

            // 3. 파싱 후 9시간 더하기
            java.time.LocalDateTime dateTime = java.time.LocalDateTime.parse(this.createDate, formatter);
            java.time.LocalDateTime kstTime = dateTime.plusHours(9);

            // 4. 다시 예쁜 문자열 포맷으로 변환 (초는 빼고 깔끔하게 출력)
            return kstTime.format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));

        } catch (Exception e) {
            // 5. 에러 발생 시 로그를 찍고, 원본 데이터라도 보여줘서 페이지가 터지는 걸 방지
            System.err.println("날짜 변환 실패: " + this.createDate + " / 에러: " + e.getMessage());
            return this.createDate; 
        }
    }

    private String location; 
    private String productType; 
    private BigDecimal currentPriceUnified; // 리스트 페이지용 가격
    private int views; 
    private String userNo;
    private String status;
    private int wishlistCount;

    // 썸네일 이미지
    private String thumbnailUrl;

    // 상세 페이지 전용
    private String detail; 
    private String categoryName;
    private int categoryNo;
    private String sellerNickname; 
    private String sellerProfileImage; 
    private List<String> imageUrls; // 상품의 모든 이미지 URL 리스트
    private int sellerTrust;
    private String sellerUuid;

    // 일반 상품 정보
    private String productState;
    private BigDecimal price;
    private Date soldDate;

    // 경매 상품 정보
    private BigDecimal startPrice;
    private BigDecimal currentPrice;
    private Date endDate;
    private String reviewText;
    private int reviewNo;
    private String newStatus;
}