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
	private int reviewNo;
	private int productNo;
	private int sellerNo;
	private int buyerNo;
	private String reviewText;
	private String status;
	private float rateScore;
	private Date createDate;
	private String sellerNickname;
	private String buyerNickname;
	private String name;
}
