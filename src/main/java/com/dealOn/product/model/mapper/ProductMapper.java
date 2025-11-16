package com.dealOn.product.model.mapper;

import com.dealOn.common.model.vo.CategoryVO;
import com.dealOn.product.model.vo.ProductVO;
import com.dealOn.product.model.vo.AddProductVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface ProductMapper {
    List<ProductVO> findProducts(Map<String, Object> params);
    List<CategoryVO> findAllCategories();
    List<String> findImagesByProductNo(int productNo);
    ProductVO findProductDetailById(int productNo);
    int insertProduct(AddProductVO product);
    int insertNormalProduct(AddProductVO product);
    int insertImage(@Param("entityId") int entityId, @Param("entityType") String entityType, @Param("imageUrl") String imageUrl, @Param("displayOrder") int displayOrder);

    int updateProduct(AddProductVO product);

    int updateNormalProduct(AddProductVO product);

    int findImageCountByProductNo(int productNo);

    int deleteImagesByUrl(@Param("productNo") int productNo, @Param("urls") List<String> urls);
}