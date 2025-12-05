package com.dealOn.common.model.vo;

import java.util.Date;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewVO {
	private String readStatus;
	private String reviewNo;
	private String productNo;
	private String sellerNo;
	private String buyerNo;
	private String reviewText;
	private String status;
	private float rateScore;
	private Date createDate;
}
