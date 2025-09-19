package com.dealOn.product.model.service;


import com.dealOn.common.model.vo.CategoryVO;
import com.dealOn.product.model.vo.ProductVO;
import org.springframework.stereotype.Service;
import com.dealOn.product.model.mapper.ProductMapper;

import java.util.List;
import java.util.Map;

@Service
public class ProductService {

    private final ProductMapper productMapper;

    public ProductService(ProductMapper productMapper) {
        this.productMapper = productMapper;
    }

    public List<ProductVO> findProducts(Map<String, Object> filters) {
        return productMapper.findProducts(filters);
    }

    public List<CategoryVO> findAllCategories() {
        return productMapper.findAllCategories();
    }
}