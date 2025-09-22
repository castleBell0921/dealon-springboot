package com.dealOn.Auth.service;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.dealOn.user.model.mapper.UserMapper;
import com.dealOn.user.model.vo.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserMapper userMapper;

    @Value("${KAKAO_CLIENT_ID}")
    private String clientId;

    @Value("${KAKAO_REDIRECT_URL}")
    private String redirectUri;

    // 1. 카카오 인가 코드 요청 URL
    public String getAuthCodeUrl() {
        return "https://kauth.kakao.com/oauth/authorize?response_type=code"
                + "&client_id=" + clientId
                + "&redirect_uri=" + redirectUri;
    }
    
    // 2. 인가 코드 -> 토큰 -> 사용자 정보
    public Map<String, Object> getUserInfo(String code) {
        RestTemplate restTemplate = new RestTemplate();

        // --- 토큰 요청 ---
        String tokenUrl = "https://kauth.kakao.com/oauth/token" +
                "?grant_type=authorization_code" +
                "&client_id=" + clientId +
                "&redirect_uri=" + redirectUri +
                "&code=" + code;

        ResponseEntity<Map> tokenResponse = restTemplate.postForEntity(tokenUrl, null, Map.class);
        Map<String, Object> tokenData = tokenResponse.getBody();

        if (tokenData == null || tokenData.get("access_token") == null) {
            throw new RuntimeException("카카오 토큰 요청 실패");
        }

        String accessToken = tokenData.get("access_token").toString();

        // --- 사용자 정보 요청 ---
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        HttpEntity<?> entity = new HttpEntity<>(headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                "https://kapi.kakao.com/v2/user/me?secure_resource=true",
                HttpMethod.GET,
                entity,
                Map.class
        );

        Map<String, Object> userInfo = response.getBody();
        if (userInfo == null) throw new RuntimeException("카카오 사용자 정보 요청 실패");

        Map<String, Object> kakaoAccount = (Map<String, Object>) userInfo.get("kakao_account");
        Map<String, Object> properties = (Map<String, Object>) userInfo.get("properties");

        Map<String, Object> result = new HashMap<>();
        result.put("id", userInfo.get("id"));
        result.put("nickname", properties != null ? properties.getOrDefault("nickname", "") : "");
        result.put("profileImage", properties != null ? properties.getOrDefault("profile_image", "") : "");
        

        return result;
    }

    // 3. DB 조회
    public User findUserBySocialId(String socialId) {
        return userMapper.findBySocialId(socialId);
    }

    // 4. 세션 생성 (예시)
    public void createSession(User user) {
        // SecurityContextHolder 또는 직접 세션 구현 가능
    }
}
