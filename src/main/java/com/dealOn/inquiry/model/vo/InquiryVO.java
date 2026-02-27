package com.dealOn.inquiry.model.vo;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class InquiryVO {

    private int inquiryId;
    private int userNo;
    private String category;
    private String title;
    private String status;
    private LocalDateTime createdAt;
    private String imageUrl;
    // 상세 메시지 목록
    private List<InquiryDetailVO> details;

}
