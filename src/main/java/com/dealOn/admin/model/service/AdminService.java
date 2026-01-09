package com.dealOn.admin.model.service;

import org.springframework.stereotype.Service;

import com.dealOn.admin.model.mapper.AdminMapper;
import com.dealOn.product.model.vo.ProductVO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminService {
	private final AdminMapper adminMapper;
	
	public ProductVO getProductDetail(int productNo) {
		return adminMapper.getProductDetail(productNo);
	}
	

}
