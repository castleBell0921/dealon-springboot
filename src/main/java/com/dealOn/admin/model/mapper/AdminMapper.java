package com.dealOn.admin.model.mapper;

import java.util.List;
import java.util.Map;

import com.dealOn.admin.model.vo.AdminStats;
import com.dealOn.admin.model.vo.UserDetail;
import com.dealOn.admin.model.vo.UserList;
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

	int checkReportUser(@Param("userNo") String userNo,@Param("sellerNo") String sellerNo);

	int selectUserListCount();
	List<UserList> selectUserList(RowBounds rowBounds);
	UserDetail selectUserDetail(int userNo);

	int getSearchUserCount(@Param("keyword") String keyword);
	List<UserList> searchUsers(@Param("keyword") String keyword, RowBounds rowBounds);

	// 회원 상태 변경
	int updateUserStatus(@Param("userNo") int userNo, @Param("status") String status);

	// 회원 정보 수정
	int updateUser(UserDetail userDetail);

    AdminStats getAdminStats();
}
