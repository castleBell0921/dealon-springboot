package com.dealOn.user.model.mapper;

import java.util.HashMap;
import java.util.Map;

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

}
