package com.dealOn.Auth.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.dealOn.user.model.mapper.UserMapper;
import com.dealOn.user.model.vo.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GoogleAuthService {

    private final UserMapper userMapper;


    @Value("${GOOGLE_CLIENT_ID}")
    private String googleClientId;
    @Value("${GOOGLE_CLIENT_SECRET}")
    private String googleClientSecret;
    @Value("${GOOGLE_REDIRECT_URL}")
    private String googleRedirectUri;



    // ✅ 구글
    public String getGoogleAuthUrl() {
        return "https://accounts.google.com/o/oauth2/v2/auth"
                + "?client_id=" + googleClientId
                + "&redirect_uri=" + googleRedirectUri
                + "&response_type=code"
                + "&scope=openid%20email%20profile"
                + "&prompt=select_account"; // ✅ 항상 계정 선택 창

    }

    public Map<String, Object> getGoogleUserInfo(String code) {
        RestTemplate restTemplate = new RestTemplate();

        // 1. 토큰 요청
        String tokenUrl = "https://oauth2.googleapis.com/token";
        Map<String, String> params = new HashMap<>();
        params.put("code", code);
        params.put("client_id", googleClientId);
        params.put("client_secret", googleClientSecret);
        params.put("redirect_uri", googleRedirectUri);
        params.put("grant_type", "authorization_code");

        ResponseEntity<Map> tokenResponse = restTemplate.postForEntity(tokenUrl, params, Map.class);
        Map<String, Object> tokenData = tokenResponse.getBody();
        if (tokenData == null || tokenData.get("access_token") == null) {
            throw new RuntimeException("구글 토큰 요청 실패");
        }
        String accessToken = tokenData.get("access_token").toString();

        // 2. 사용자 정보 요청
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        HttpEntity<?> entity = new HttpEntity<>(headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                HttpMethod.GET,
                entity,
                Map.class
        );

        Map<String, Object> userInfo = response.getBody();
        if (userInfo == null) throw new RuntimeException("구글 사용자 정보 요청 실패");

        Map<String, Object> result = new HashMap<>();
        result.put("id", userInfo.get("id"));
        result.put("nickname", userInfo.get("name"));
        result.put("profileImage", userInfo.get("picture"));
        result.put("email", userInfo.get("email"));
        result.put("accessToken", accessToken);

        return result;
    }

    // ✅ 공통
    public User findUserBySocialId(String socialId) {
        return userMapper.findBySocialId(socialId);
    }
}
