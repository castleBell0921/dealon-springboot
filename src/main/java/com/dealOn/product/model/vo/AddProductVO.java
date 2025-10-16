package com.dealOn.product.model.vo;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@Data
public class AddProductVO {

    // PRODUCT 테이블용 필드
    private String name;
    private String detail;
    private int category; // DB에는 카테고리 번호(FK)가 저장됩니다.
    private String salesLocation;

    // NORMAL 테이블용 필드
    private BigDecimal price;

    // 이미지 파일
    private List<MultipartFile> productImages;

    // --- Service에서 채워줄 필드 ---
    private int userNo;
    private int productNo; // insert 후 생성된 PK를 담을 필드
}
