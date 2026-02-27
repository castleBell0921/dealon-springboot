package com.dealOn.inquiry.model.vo;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InquiryDetailVO {

    private int detailId;
    private int inquiryId;
    private int writerId;
    private String role;
    private String content;
    private LocalDateTime createdAt;

}

