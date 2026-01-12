package com.dealOn.admin.model.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.session.RowBounds;

import com.dealOn.chat.model.vo.ChatRoom;
import com.dealOn.product.model.vo.ProductVO;

@Mapper
public interface AdminMapper {

	ProductVO getProductDetail(int productNo);

	int updateProductStatus(ProductVO req);

	List<ProductVO> getAllProduct();
	
	int getSearchCount(@Param("keyword") String keyword);
	
	List<ProductVO> searchProducts(@Param("keyword") String keyword, RowBounds rowBounds);

	int getProductCount();

    List<ProductVO> getProductList(RowBounds rowBounds);

	int reportUser(
			@Param("chatInfo") ChatRoom chatInfo, 
			@Param("data") Map<String, Object> data);
}
