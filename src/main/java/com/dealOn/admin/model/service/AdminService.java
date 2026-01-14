package com.dealOn.admin.model.service;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.session.RowBounds;
import org.springframework.stereotype.Service;

import com.dealOn.admin.model.mapper.AdminMapper;
import com.dealOn.chat.model.vo.ChatRoom;
import com.dealOn.common.model.vo.PageInfo;
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

	public List<ProductVO> searchProducts(String keyword, PageInfo pi) {
	    int offset = (pi.getCurrentPage() - 1) * pi.getBoardLimit();
	    RowBounds rowBounds = new RowBounds(offset, pi.getBoardLimit());
	    return adminMapper.searchProducts(keyword, rowBounds);
	}
	
	public int getSearchCount(String keyword) {
	    return adminMapper.getSearchCount(keyword);
	}
	
	public int getProductCount() {
	    return adminMapper.getProductCount();
	}
	
	public List<ProductVO> getProductList(PageInfo pi) {
        int offset = (pi.getCurrentPage() - 1) * pi.getBoardLimit();
        int limit = pi.getBoardLimit();
        RowBounds rowBounds = new RowBounds(offset, limit);

        return adminMapper.getProductList(rowBounds);
    }

	public int reportUser(ChatRoom chatInfo, Map<String, Object> data) {
		
		return adminMapper.reportUser(chatInfo, data);
	}

	public int checkReportUser(String userNo, String sellerNo) {
		return adminMapper.checkReportUser(userNo, sellerNo);
	}
	

}
