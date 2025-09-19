package com.dealOn.user.model.service;

import org.springframework.stereotype.Service;

import com.dealOn.user.model.mapper.UserMapper;
import com.dealOn.user.model.vo.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

	private final UserMapper mapper;

	public boolean idCheckService(String id) {
		int result = mapper.idCheck(id);
		if (result == 0) {
			return true;
		} else {
			return false;
		}
	}

	public boolean nicknameService(String nickname) {
		int result = mapper.nicknameCheck(nickname);
		if(result==0) {
			return true;
		} else {
			return false;
		}
	}

	public int insertUser(User user) {
		return mapper.insertUser(user);
	}

	public User login(User user) {
		return mapper.login(user);
	}
}
