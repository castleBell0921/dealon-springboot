package com.dealOn.product.model.mapper;

import com.dealOn.common.model.vo.CategoryVO;
import com.dealOn.product.model.vo.ProductVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface ProductMapper {
    List<ProductVO> findProducts(Map<String, Object> params);
    List<CategoryVO> findAllCategories();
    List<String> findImagesByProductNo(int productNo);
    ProductVO findProductDetailById(int productNo);
}