package com.dealOn.product.model.service;


import com.dealOn.common.S3Service;
import com.dealOn.common.model.vo.CategoryVO;
import com.dealOn.product.model.vo.AddProductVO;
import com.dealOn.product.model.vo.ProductVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.dealOn.product.model.mapper.ProductMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductMapper productMapper;
    private final S3Service s3Service;


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

    @Transactional(rollbackFor = Exception.class)
    public void addNormalProduct(AddProductVO product) throws Exception {
        // 1. PRODUCT 테이블에 기본 정보 저장
        productMapper.insertProduct(product); // insert 후 product.productNo에 PK가 채워짐

        // 2. NORMAL 테이블에 가격 등 추가 정보 저장
        productMapper.insertNormalProduct(product);

        // 3. 이미지 파일 S3에 업로드 및 IMAGES 테이블에 저장
        List<MultipartFile> imageFiles = product.getProductImages();
        if (imageFiles != null && !imageFiles.isEmpty()) {
            for (int i = 0; i < imageFiles.size(); i++) {
                MultipartFile file = imageFiles.get(i);
                if (file != null && !file.isEmpty()) {
                    String imageUrl = s3Service.uploadFile(file);
                    productMapper.insertImage(product.getProductNo(), "PRODUCT", imageUrl, i);
                }
            }
        }
    }
}