package com.dealOn.admin.model.vo;

import java.sql.Date;

import com.dealOn.user.model.vo.Seller;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Report {
	private int productNo;
	private int chatNo;
	private int reportNo;
	private String category;
	private String detail;
	private int reporter;
	private int violator;
}
