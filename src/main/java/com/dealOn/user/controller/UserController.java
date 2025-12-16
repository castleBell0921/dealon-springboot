package com.dealOn.user.controller;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.SessionAttributes;
import org.springframework.web.bind.support.SessionStatus;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.dealOn.Auth.service.EmailService;
import com.dealOn.Auth.service.KakaoAuthService;
import com.dealOn.common.S3Service;
import com.dealOn.common.model.vo.ReviewVO;
import com.dealOn.product.model.service.ProductService;
import com.dealOn.product.model.vo.ProductVO;
import com.dealOn.user.model.service.UserService;
import com.dealOn.user.model.vo.Seller;
import com.dealOn.user.model.vo.User;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
@SessionAttributes("loginUser")
@RequestMapping("/user")
public class UserController {
	private final UserService uService;
	private final EmailService eService;
	private final BCryptPasswordEncoder bcrypt;
	private final KakaoAuthService authService;
	private final S3Service s3Service;
	private final ProductService pService;

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
		user.setUuid(UUID.randomUUID().toString().replaceAll("-", "").substring(0, 12));
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
			// accessToken session 저장
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
	public String logout(SessionStatus session, HttpSession httpSession, RedirectAttributes ra) {
		User loginUser = (User) httpSession.getAttribute("loginUser");

		// 소셜 로그인 유저면 카카오 로그아웃 URL로 redirect
		if (loginUser != null && loginUser.getSocialId() != null) {
			return "redirect:" + authService.getKakaoLogoutUrl();
		} else {

			// 세션 초기화
			session.setComplete();
			httpSession.invalidate();

			ra.addFlashAttribute("logoutSuccessMessage", "로그아웃 성공!");
			return "redirect:/";
		}
	}

	@GetMapping("/myProduct")
	public String myProduct(HttpServletRequest  request, HttpSession session,Model model) {
		User loginUser = (User)session.getAttribute("loginUser");
		List<ProductVO> productList = pService.findByUserNoProducts(loginUser.getUserNo());
		model.addAttribute("productList", productList);
        model.addAttribute("requestURI", request.getRequestURI());

		return "user/myProduct";
	}
	
	@GetMapping("editProfile")
	public String editProfile(HttpServletRequest  request, HttpSession session, Model model) {
		User loginUser = (User)session.getAttribute("loginUser");
		model.addAttribute("loginUser", loginUser);
		model.addAttribute("requestURI", request.getRequestURI());
		return "user/myInfo";
	}
	
	
	
	@PostMapping("/update")
	public String updateUser(@RequestParam("avatarFile") MultipartFile avatar, 
			@ModelAttribute User user,
			@RequestParam(value="newPwd", required = false) String newPwd,
            @RequestParam(value="confirmPwd", required = false) String confirmPwd,
            @RequestParam(value="currentPwd", required = false) String currentPwd,
			HttpSession session,
			RedirectAttributes ra) {

		User loginUser = (User) session.getAttribute("loginUser");
		
		  // 비밀번호 변경 로직
	    if (currentPwd != null && !currentPwd.isEmpty()
	            && newPwd != null && !newPwd.isEmpty()
	            && confirmPwd != null && !confirmPwd.isEmpty()) {
	        if (!newPwd.equals(confirmPwd)) {
	            ra.addFlashAttribute("msg", "새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
	            return "redirect:/user/editProfile";
	        }

	        if (!bcrypt.matches(currentPwd, loginUser.getPwd())) {
	            ra.addFlashAttribute("msg", "현재 비밀번호가 올바르지 않습니다.");
				/*
				 * System.out.println("currentPwd: " + currentPwd);
				 * System.out.println("sessionPwd: " + loginUser.getPwd());
				 */
	            return "redirect:/user/editProfile";
	        }
	        
	        user.setPwd(bcrypt.encode(newPwd));

	    }
		
		// 파일이 있으면 S3에 업로드
		String avatarUrl = null;
		if (!avatar.isEmpty()) {
			try {
				avatarUrl = s3Service.uploadFile(avatar);
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
		// 서비스 레이어에 전달
		uService.updateUserProfile(loginUser, loginUser.getId(), user.getNickname(), user.getEmail(), avatarUrl, user.getPwd());

		ra.addFlashAttribute("msg", "프로필이 수정되었습니다.");
		return "redirect:/user/editProfile";
	}
	
	//아이디 찾기 폼 맵핑
	@GetMapping("/findAccount")
	public String findAccount() {
		return "/findAccount";
	}
	// 비밀번호 찾기 폼 맵핑
	@GetMapping("/findPwd")
	public String findPwd() {
		return "/findPwd";
	}
	
	@PostMapping("/findId")
	public String findId(@ModelAttribute User user, Model model) {
		String id = uService.findId(user);
		if(id != null) {
			model.addAttribute("id", id);
		} else {
			model.addAttribute("errorMessage", "일치하는 회원 정보가 없습니다.");
		}
		
		return "/findAccount"; 
	}
	
	@PostMapping("/findPwd")
	public String findPwd(@ModelAttribute User user,Model model) {

	    // 1. DB에서 유저 조회
	    User userInfo = uService.findUserByIdAndEmail(user);

	    if (userInfo == null) {
	        model.addAttribute("errorMessage", "일치하는 회원정보가 없습니다.");
	        return "/findPwd";
	    }

	    // 2. 임시 비밀번호 생성
	    String tempPwd = eService.generateTempPassword(10); // 10자리 임시 비밀번호
	    String encodedPwd = bcrypt.encode(tempPwd);

	    // 3. DB에 새 비밀번호 업데이트
	    uService.updatePassword(userInfo.getId(), encodedPwd);

	    // 4. 이메일로 임시 비밀번호 전송
	    eService.sendTempPasswordEmail(userInfo.getEmail(), tempPwd);

	    model.addAttribute("sentMessage", "임시 비밀번호가 이메일로 발송되었습니다.");
	    return "/findPwd";
	}



	@GetMapping("/seller/{pathId}")
	public String sellerPage(@PathVariable("pathId") String pathId, Model model) {

		// 1. 유효성 검사 및 UUID 추출
		int lastHyphenIdx = pathId.lastIndexOf('-');

		if (lastHyphenIdx == -1 || lastHyphenIdx == pathId.length() - 1) {
			// 형식이 맞지 않거나 UUID가 없는 경우 메인으로 리다이렉트
			return "redirect:/";
		}

		// 닉네임에 하이픈이 있을때 대비 뒤에서부터
		String uuid = pathId.substring(lastHyphenIdx + 1);

		// 판매자
		User seller = uService.findUserByUuid(uuid);
		if (seller == null) {
			return "redirect:/"; // 존재하지 않는 판매자
		}

		// 판매상품
		List<ProductVO> productList = pService.findByUserNoProducts(seller.getUserNo());

		// 후기
		List<Seller> reviewList = uService.findReviewsBySellerNo(seller.getUserNo());

		model.addAttribute("seller", seller);
		model.addAttribute("products", productList);
		model.addAttribute("reviews", reviewList);

		return "user/sellerPage";
	}
	@GetMapping("/mySellList")
	public String mySesllList(HttpSession session, Model model, HttpServletRequest request) {
		String userNo = ((User)session.getAttribute("loginUser")).getUserNo();
		
		List<ProductVO> list = pService.getMySellList(userNo);
		model.addAttribute("productList", list);
		model.addAttribute("requestURI",request.getRequestURI());
		return "/mySellList";
	}
	
	@GetMapping("/reviewDetails/{reviewNo}")
	@ResponseBody
	public ReviewVO reviewDetail(@PathVariable("reviewNo") String reviewNo) {
		ReviewVO detail = uService.reviewDetail(reviewNo);
		return detail;
	}
}
