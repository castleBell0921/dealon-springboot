package com.dealOn.product.model.service;


import com.dealOn.common.model.vo.CategoryVO;
import com.dealOn.product.model.vo.ProductVO;
import org.springframework.stereotype.Service;
import com.dealOn.product.model.mapper.ProductMapper;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Map;

@Slf4j
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

    public ProductVO getProductDetail(int productNo) {
        ProductVO productDetail = productMapper.findProductDetailById(productNo);
        log.info(">>>> DB 조회 결과: {}", productDetail);
        if (productDetail != null) {
            List<String> imageUrls = productMapper.findImagesByProductNo(productNo);
            productDetail.setImageUrls(imageUrls);
        }
        return productDetail;
    }
}