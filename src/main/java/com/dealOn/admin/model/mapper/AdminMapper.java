package com.dealOn.admin.model.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.dealOn.product.model.vo.ProductVO;

@Mapper
public interface AdminMapper {

	ProductVO getProductDetail(int productNo);

	int updateProductStatus(ProductVO req);

	List<ProductVO> getAllProduct();

	List<ProductVO> searchProducts(String keyword);
	
}
