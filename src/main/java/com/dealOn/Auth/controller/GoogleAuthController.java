package com.dealOn.Auth.controller;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.support.SessionStatus;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.dealOn.Auth.service.GoogleAuthService;
import com.dealOn.user.model.vo.User;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class GoogleAuthController {

    private final GoogleAuthService authService;

    // 구글 로그인 URL
    @GetMapping("/auth/google/auth-url")
    public String getGoogleAuthUrl() {
        return "redirect:" + authService.getGoogleAuthUrl();
    }

    // 구글 로그인 콜백
    @GetMapping("/auth/google/callback")
    public String googleCallback(@RequestParam(value = "code", required = false) String code,
                                 HttpSession session,
                                 RedirectAttributes ra) {
        try {
            Map<String, Object> userInfo = authService.getGoogleUserInfo(code);
            String socialId = String.valueOf(userInfo.get("id"));

            User user = authService.findUserBySocialId(socialId);

            if (user == null) {
                // DB에 없으면 회원가입 페이지로 redirect
                String signUpParams = String.format("nickname=%s&profileImage=%s&socialId=%s",
                        URLEncoder.encode(String.valueOf(userInfo.get("nickname")), StandardCharsets.UTF_8),
                        URLEncoder.encode(String.valueOf(userInfo.get("profileImage")), StandardCharsets.UTF_8),
                        URLEncoder.encode(socialId, StandardCharsets.UTF_8)
                );
                return "redirect:/user/signIn?" + signUpParams + "&msg=yes";
            } else {
                // DB에 있으면 자동 로그인
                session.setAttribute("loginUser", user);
                ra.addFlashAttribute("loginSuccessMessage", "구글 로그인 성공!");
                return "redirect:/";
            }
        } catch (Exception e) {
            String errorMsg = URLEncoder.encode("구글 로그인 실패", StandardCharsets.UTF_8);
            return "redirect:/?loginError=" + errorMsg;
        }
    }

    // 구글 로그아웃 콜백
    @GetMapping("/auth/google/logout-callback")
    public String googleLogoutCallback(HttpSession session, SessionStatus status, RedirectAttributes ra) {
        status.setComplete();
        session.invalidate();
        ra.addFlashAttribute("logoutSuccessMessage", "구글 로그아웃 성공!");
        return "redirect:/";
    }
}
