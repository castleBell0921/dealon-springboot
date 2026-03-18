package com.dealOn.user.model.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.dealOn.common.S3Service;
import com.dealOn.common.model.vo.ReviewVO;
import com.dealOn.product.model.vo.ProductVO;
import com.dealOn.user.model.mapper.UserMapper;
import com.dealOn.user.model.vo.Seller;
import com.dealOn.user.model.vo.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserMapper mapper;
    private final S3Service s3Service;

    public boolean idCheckService(String id) {
        return mapper.idCheck(id) == 0;
    }

    public boolean nicknameService(User user, String nickname) {
        Map<String, String> data = new HashMap<>();
        data.put("nickname", nickname);
        if (user != null) {
            data.put("userNo", user.getUserNo());
        }
        return mapper.nicknameCheck(data) == 0;
    }

    public int insertUser(User user) {
        return mapper.insertUser(user);
    }

    public User login(User user) {
        return mapper.login(user);
    }

    public boolean phoneCheck(String phone) {
        return mapper.phoneCheck(phone) == 0;
    }

    public void updateUserProfile(User user, String id, String nickname, String email, String avatarUrl, String pwd) {
        user.setNickname(nickname);
        user.setEmail(email);
        user.setPwd(pwd);

        if (avatarUrl != null) {
            user.setImageUrl(avatarUrl);
        }
        mapper.updateUser(user);
        if (avatarUrl != null) {
            mapper.insertUserProfileImage(user);
        }
    }

    public boolean emailCheck(User user, String email) {
        HashMap<String, String> data = new HashMap<>();
        data.put("email", email);
        if (user != null) {
            data.put("userNo", user.getUserNo());
        }
        return mapper.emailCheck(data) == 0;
    }

    public String findId(User user) {
        return mapper.findId(user);
    }

    public User findUserByIdAndEmail(User user) {
        return mapper.findUserByIdAndEmail(user);
    }

    public void updatePassword(String id, String encodedPwd) {
        HashMap<String, String> data = new HashMap<>();
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

    public int reviewStatusUpdate(String reviewNo) {
        return mapper.reviewStatusUpdate(reviewNo);
    }

    public ReviewVO getReviewByProductNo(int productNo) {
        return mapper.getReviewByProductNo(productNo);
    }

    public int modifyTrust(User loginUser) {
        return mapper.modifyTrust(loginUser);
    }

    public User getProductUser(ProductVO product) {
        return mapper.getProductUser(product);
    }
}
