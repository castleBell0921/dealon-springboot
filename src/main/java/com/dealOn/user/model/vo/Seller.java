package com.dealOn.user.model.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Seller {
    private int reviewNo;
    private String reviewText;
    private Date createDate;
    private float rateScore;

    // 구매자(작성자) 정보
    private int buyerNo;
    private String buyerNickname;
    private String buyerProfileImage;
    private int productNo;
    private String productThumbnail;
}