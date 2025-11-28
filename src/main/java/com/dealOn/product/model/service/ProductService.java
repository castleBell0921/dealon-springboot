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
            if ("NORMAL".equals(productDetail.getProductType())) {
                productMapper.increaseNormalViewCount(productNo);
            } else if ("AUCTION".equals(productDetail.getProductType())) {
                //productMapper.increaseAuctionViewCount(productNo);
            }

            // 화면에도 즉시 반영되도록 가져온 객체의 views 값을 1 증가시킴
            productDetail.setViews(productDetail.getViews() + 1);
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

    @Transactional(rollbackFor = Exception.class)
    public void updateNormalProduct(AddProductVO product, List<String> deletedImagesUrls) throws Exception {

        // 1. PRODUCT 테이블 수정 (이름, 내용, 카테고리, 위치)
        productMapper.updateProduct(product);

        // 2. NORMAL 테이블 수정 (가격)
        productMapper.updateNormalProduct(product);

        // 3. 삭제할 이미지가 있다면 DB와 OCI 버킷에서 삭제
        if (deletedImagesUrls != null && !deletedImagesUrls.isEmpty()) {
            // 3a. DB(IMAGES 테이블)에서 삭제
            productMapper.deleteImagesByUrl(product.getProductNo(), deletedImagesUrls);

            // 3b. OCI 버킷에서 실제 파일 삭제
            for (String imageUrl : deletedImagesUrls) {
                s3Service.deleteFile(imageUrl);
            }
        }

        // 4. 새로 추가할 이미지가 있다면 OCI 버킷에 업로드 및 DB(IMAGES)에 추가
        List<MultipartFile> newImageFiles = product.getProductImages();
        if (newImageFiles != null && !newImageFiles.isEmpty()) {

            // 4a. 현재 이미지 개수를 가져와서 displayOrder 시작점으로 사용
            int displayOrderStart = productMapper.findImageCountByProductNo(product.getProductNo());

            for (int i = 0; i < newImageFiles.size(); i++) {
                MultipartFile file = newImageFiles.get(i);
                if (file != null && !file.isEmpty()) {
                    // 4b. OCI 버킷에 업로드 (기존 S3Service 재사용)
                    String imageUrl = s3Service.uploadFile(file);
                    // 4c. DB(IMAGES 테이블)에 추가 (기존 Mapper 재사용)
                    productMapper.insertImage(product.getProductNo(), "PRODUCT", imageUrl, displayOrderStart + i);
                }
            }
        }
    }

	public List<ProductVO> productSearch(Map<String, Object> filters) {
		return productMapper.productSearch(filters);
		
		
	}

	public List<ProductVO> findByUserNoProducts(String userNo) {
		return productMapper.findByUserNoProducts(userNo);
	}

    @Transactional(rollbackFor = Exception.class)
    public void deleteProduct(int productNo) throws Exception {
        // 이미지 삭제 로직 없이, 상태값만 변경하는 Mapper 호출
        productMapper.deleteProduct(productNo);
    }

    // 찜 체크
    public boolean isWishlisted(int userNo, int productNo) {
        return productMapper.checkWishlist(userNo, productNo) > 0;
    }

    // 토글기능
    @Transactional(rollbackFor = Exception.class)
    public String toggleWishlist(int userNo, int productNo) {
        // 찜했는지 확인
        if (isWishlisted(userNo, productNo)) {
            productMapper.deleteWishlist(userNo, productNo);
            return "removed"; 
        } else {
            productMapper.insertWishlist(userNo, productNo);
            return "added"; 
        }
    }
}