package com.dealOn.Auth.controller;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.support.SessionStatus;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.dealOn.Auth.service.KakaoAuthService;
import com.dealOn.user.controller.UserController;
import com.dealOn.user.model.vo.User;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class KakaoAuthController {

	private final KakaoAuthService authService;
	private final UserController userController;

	@GetMapping("/auth/kakao/auth-url")
	@ResponseBody
	public String getKakaoAuthUrl() {
		return authService.getAuthCodeUrl(); // 프론트에서 fetch로 받아서 redirect
	}

	@GetMapping("/auth/kakao/callback")
	public String kakaoCallback(@RequestParam(value = "code", required = false) String code, HttpSession session, RedirectAttributes ra) {
		try {
			Map<String, Object> userInfo = authService.getUserInfo(code);
			String socialId = String.valueOf(userInfo.get("id"));

			User user = authService.findUserBySocialId(socialId);
			
			
			if (user != null) {
				user.setAccessToken((String) userInfo.get("accessToken")); // VO에 넣기
			}

			if (user == null) {
				// DB에 없으면 회원가입 페이지로 리다이렉트, URL 인코딩 필수
				String signUpParams = String.format("nickname=%s&profileImage=%s&socialId=%s",
						URLEncoder.encode(String.valueOf(userInfo.get("nickname")), StandardCharsets.UTF_8),
						URLEncoder.encode(String.valueOf(userInfo.get("profileImage")), StandardCharsets.UTF_8),
						URLEncoder.encode(socialId, StandardCharsets.UTF_8)

				);
				return "redirect:http://localhost:9090/user/signIn?" + signUpParams + "&msg=yes";
			} else {
				// DB에 있으면 자동 로그인
				session.setAttribute("loginUser", user);
				ra.addFlashAttribute("loginSuccessMessage", "로그인 성공!");
				return "redirect:/";
			}
			
			

		} catch (Exception e) {
			String errorMsg = URLEncoder.encode("카카오 로그인 실패", StandardCharsets.UTF_8);
			return "redirect:http://localhost:9090/?loginError=" + errorMsg;
		}
				
	}
	
	@GetMapping("/auth/kakao/logout-callback")
	public String kakaoLogoutCallback(HttpSession session, SessionStatus status, RedirectAttributes ra) {
	    // 세션 초기화
	    status.setComplete();
	    session.invalidate();
	    ra.addFlashAttribute("logoutSuccessMessage", "로그아웃 성공!");
	    return "redirect:/"; // 홈으로 이동
	}

}
