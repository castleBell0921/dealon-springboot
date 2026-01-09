package com.dealOn.admin.model.mapper;

import org.apache.ibatis.annotations.Mapper;

import com.dealOn.product.model.vo.ProductVO;

@Mapper
public interface AdminMapper {

	ProductVO getProductDetail(int productNo);
	
}
