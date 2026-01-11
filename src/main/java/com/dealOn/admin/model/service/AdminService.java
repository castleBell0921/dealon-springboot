package com.dealOn.admin.model.service;

import java.util.List;

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

	public int updateProductStatus(ProductVO req) {
		return adminMapper.updateProductStatus(req);
	}

	public List<ProductVO> getAllProduct() {
		return adminMapper.getAllProduct();
	}

	public List<ProductVO> searchProducts(String keyword) {
		return adminMapper.searchProducts(keyword);
	}
	

}
