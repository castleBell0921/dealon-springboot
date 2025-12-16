package com.dealOn.user.model.mapper;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.dealOn.common.model.vo.ReviewVO;
import com.dealOn.user.model.vo.Seller;
import org.apache.ibatis.annotations.Mapper;

import com.dealOn.user.model.vo.User;



@Mapper
public interface UserMapper {

	int idCheck(String id);

	int nicknameCheck(Map<String, String> data);

	int insertUser(User user);

	User login(User user);

	int phoneCheck(String phone);

	User findBySocialId(String socialId);

	int updateUser(User user);
	
	int insertUserProfileImage(User user);

	int emailCheck(Map<String,String> data);
	
	String findId(User user);

	User findUserByIdAndEmail(User user);

	void updatePassword(HashMap<String, String> data);

	// UUID 유저 조회
	User findUserByUuid(String uuid);

	// 후기 조회
	List<Seller> findReviewsBySellerNo(String userNo);

	ReviewVO reviewDetail(String reviewNo);
}
