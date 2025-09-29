package com.dealOn.user.model.service;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.dealOn.common.S3Service;
import com.dealOn.user.model.mapper.UserMapper;
import com.dealOn.user.model.vo.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

	private final UserMapper mapper;
	private final S3Service s3Service;

	public boolean idCheckService(String id) {
		int result = mapper.idCheck(id);
		if (result == 0) {
			return true;
		} else {
			return false;
		}
	}

	public boolean nicknameService(User user, String nickname) {
		Map<String, String> data = new HashMap<String, String>();
		data.put("nickname", nickname);
		if(user != null) {
			data.put("userNo", user.getUserNo());
		}
		int result = mapper.nicknameCheck(data);
		if (result == 0) {
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

	public boolean phoneCheck(String phone) {
		int result = mapper.phoneCheck(phone);
		if (result == 0) {
			return true;
		} else {
			return false;
		}
	}

	public void updateUser(User user, MultipartFile imageFile, String nickname, String email) {
		String imageUrl = null;

		// 이미지 업로드
		if (imageFile != null && !imageFile.isEmpty()) {
			try {
				imageUrl = s3Service.uploadFile(imageFile);
			} catch (IOException e) {

				e.printStackTrace();
			}
		}

		// 유저 정보 업데이트
		user.setNickname(nickname);
		user.setEmail(email);
		if (imageUrl != null) {
			user.setImageUrl(imageUrl);
		}

		mapper.updateUser(user);
	}

	public void updateUserProfile(User user, String id, String nickname, String email, String avatarUrl) {
		user.setNickname(nickname);
		user.setEmail(email);

		if (avatarUrl != null) {
			user.setImageUrl(avatarUrl); // DB 컬럼에 URL 저장
		}
		mapper.updateUser(user);
		mapper.insertUserProfileImage(user);
	}

	public boolean emailCheck(User user,String email) {
		HashMap<String, String> data = new HashMap<String, String>();
		data.put("email", email);
		if(user != null) {
			data.put("userNo", user.getUserNo());
		}
		if (mapper.emailCheck(data) == 0) {
			return true;
		} else {
			return false;
		}
	}
}
