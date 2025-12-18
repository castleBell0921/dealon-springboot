package com.dealOn.user.model.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.dealOn.user.model.vo.Seller;
import org.springframework.stereotype.Service;

import com.dealOn.common.S3Service;
import com.dealOn.common.model.vo.ReviewVO;
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

	/*
	 * public void updateUser(User user, MultipartFile imageFile, String nickname,
	 * String email) { String imageUrl = null;
	 * 
	 * // 이미지 업로드 if (imageFile != null && !imageFile.isEmpty()) { try { imageUrl =
	 * s3Service.uploadFile(imageFile); } catch (IOException e) {
	 * 
	 * e.printStackTrace(); } }
	 * 
	 * // 유저 정보 업데이트 user.setNickname(nickname); user.setEmail(email); if (imageUrl
	 * != null) { user.setImageUrl(imageUrl); }
	 * 
	 * mapper.updateUser(user); }
	 */

	public void updateUserProfile(User user, String id, String nickname, String email, String avatarUrl, String pwd) {
		user.setNickname(nickname);
		user.setEmail(email);
		user.setPwd(pwd);

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
	
	public String findId(User user) {
		return mapper.findId(user);
	}
	
	public User findUserByIdAndEmail(User user) {
	    return mapper.findUserByIdAndEmail(user);
	}

	public void updatePassword(String id, String encodedPwd) {
		HashMap<String, String> data = new HashMap<String, String>();
		data.put("id", id);
		data.put("pwd", encodedPwd);
		
	    mapper.updatePassword(data);
	}

	public User findUserByUuid(String uuid) {
		return mapper.findUserByUuid(uuid);
	}

	public List<Seller> findReviewsBySellerNo(String userNo) {
		return mapper.findReviewsBySellerNo(userNo);
	}

	public ReviewVO reviewDetail(String reviewNo) {
		return mapper.reviewDetail(reviewNo);
	}

	public int writeReview(ReviewVO reviewVO) {
		return mapper.writeReview(reviewVO);
	}
}
