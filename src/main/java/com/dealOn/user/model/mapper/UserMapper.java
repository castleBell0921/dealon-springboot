package com.dealOn.user.model.mapper;

import org.apache.ibatis.annotations.Mapper;

import com.dealOn.user.model.vo.User;

@Mapper
public interface UserMapper {

	int idCheck(String id);

	int nicknameCheck(String nickname);

	int insertUser(User user);

	User login(User user);

	int phoneCheck(String phone);

	User findBySocialId(String socialId);

}
