package com.dealOn.user.controller;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.SessionAttributes;
import org.springframework.web.bind.support.SessionStatus;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.dealOn.user.model.service.UserService;
import com.dealOn.user.model.vo.User;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
@SessionAttributes("loginUser")
@RequestMapping("/user")
public class UserController {
	private final UserService uService;
	private final BCryptPasswordEncoder bcrypt;

	@GetMapping("signIn")
	public String SignIn(@RequestParam(name = "nickname", required = false) String nickname,
			@RequestParam(name = "profileImage", required = false) String profileImage,
			@RequestParam(name = "socialId", required = false) String socialId, Model model) {
		model.addAttribute("nickname", nickname);
		model.addAttribute("profileImage", profileImage);
		model.addAttribute("socialId", socialId);
		return "/SignIn";
	}

	@PostMapping("/signUp")
	public String SignUp(@ModelAttribute User user, RedirectAttributes ra) {
		// 비밀번호 암호화
		user.setPwd(bcrypt.encode(user.getPwd()));

		try {
			// 회원가입 서비스 호출
			int result = uService.insertUser(user);

			// 회원가입 성공
			if (result > 0) {
				// 성공 메시지 담기
				ra.addFlashAttribute("successMessage", "회원가입이 성공적으로 완료되었습니다. 로그인해주세요!");
				// 메인 페이지로 리다이렉트
				return "redirect:/";
			} else {
				// 회원가입 실패
				// 실패 메시지 담기
				ra.addFlashAttribute("errorMessage", "회원가입에 실패했습니다. 다시 시도해 주세요.");

				// 회원가입 페이지로 리다이렉트
				return "redirect:user/signIn";
			}
		} catch (Exception e) {
			// 예외 발생 시 처리 (DB 오류 등)
			ra.addFlashAttribute("errorMessage", "회원가입 처리 중 오류가 발생했습니다.");

			return "redirect:user/signIn";
		}
	}

	@PostMapping("/login")
	public String login(@ModelAttribute User user, Model model, RedirectAttributes ra) {
		User loginUser = uService.login(user);

		if (loginUser == null) {
			ra.addFlashAttribute("loginFailMessage", "아이디 또는 비밀번호가 잘못되었습니다.");
			return "redirect:/";
		}

		// 소셜 로그인 유저
		if (loginUser.getSocialId() != null) {
			model.addAttribute("loginUser", loginUser);
			ra.addFlashAttribute("loginSuccessMessage", "로그인 성공!");
			return "redirect:/";
		}

		// 일반 로그인 유저
		if (bcrypt.matches(user.getPwd(), loginUser.getPwd())) {
			model.addAttribute("loginUser", loginUser);
			ra.addFlashAttribute("loginSuccessMessage", "로그인 성공!");
			return "redirect:/";
		} else {
			ra.addFlashAttribute("loginFailMessage", "아이디 또는 비밀번호가 잘못되었습니다.");
			return "redirect:/";
		}
	}

	@GetMapping("/logout")
	public String logout(SessionStatus session) {
		session.setComplete();
		return "redirect:/";
	}
}
