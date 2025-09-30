package com.dealOn.ajax;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dealOn.Auth.service.EmailService;
import com.dealOn.user.model.service.UserService;
import com.dealOn.user.model.vo.User;
import com.solapi.sdk.SolapiClient;
import com.solapi.sdk.message.exception.SolapiMessageNotReceivedException;
import com.solapi.sdk.message.model.Message;
import com.solapi.sdk.message.service.DefaultMessageService;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
@Slf4j
public class AjaxController {
	private final EmailService emailService;
	private final Map<String, String> authStore = new HashMap<>();

	@Value("${coolsms.api.key}")
	private String apiKey;

	@Value("${coolsms.api.secret}")
	private String apiSecret;

	@Value("${coolsms.from.phone}") // 발신번호
	private String fromPhone;

	private final UserService uService;

	// 6자리 인증번호 생성
	private String generateAuthNumber() {
		Random random = new Random();
		int number = random.nextInt(1000000);
		return String.format("%06d", number);
	}

	// 인증번호 발송 API
	@PostMapping("/send-auth")
	public Map<String, Object> sendAuth(@RequestBody Map<String, String> request, HttpSession session) {
		String phone = request.get("phone");

		boolean phoneCheck = uService.phoneCheck(phone);

		String authNumber = generateAuthNumber();
		Map<String, Object> resp = new HashMap<>();
		if (phoneCheck) {
			DefaultMessageService messageService = SolapiClient.INSTANCE.createInstance(apiKey, apiSecret);

			Message message = new Message();
			message.setFrom(fromPhone);
			message.setTo(phone);
			message.setText("[DealOn] 인증번호 [" + authNumber + "]를 입력해주세요.");

			try {
				messageService.send(message);

				session.setAttribute("authNumber", authNumber);
				session.setAttribute("authPhone", phone);

				resp.put("success", true);
				resp.put("message", "인증번호를 발송했습니다.");
			} catch (SolapiMessageNotReceivedException exception) {
				// 발송에 실패한 메시지 목록을 확인할 수 있습니다!
				System.out.println(exception.getFailedMessageList());
				System.out.println(exception.getMessage());
			} catch (Exception exception) {
				System.out.println(exception.getMessage());
			}

			return resp;
		} else {
			resp.put("success", false);
			resp.put("message", "이미 가입되어있는 번호입니다.");

			return resp;

		}
	}

	// 인증번호 확인 API
	@PostMapping("/verify-auth")
	public Map<String, Object> verifyAuth(@RequestBody Map<String, Object> request, HttpSession session) {
		/* String phone = (String)session.getAttribute("authPhoner"); */
		String authCode = (String) session.getAttribute("authNumber");
		String inputAuthCode = (String) request.get("authCode");

		System.out.println("authCode: " + authCode);
		System.out.println("inputAuthCode: " + inputAuthCode);

		Map<String, Object> result = new HashMap<String, Object>();

		if (authCode.equals(inputAuthCode)) {
			result.put("success", true);
		} else {
			result.put("success", false);
		}

		return result;
	}

	// 아이디 중복확인
	@PostMapping("/idCheck")
	public boolean idCheck(@RequestBody Map<String, Object> request) {
		Map<String, Object> result = new HashMap<String, Object>();
		String id = (String) request.get("idValue");
		boolean idCheck = uService.idCheckService(id);
		return idCheck;
	}

	@PostMapping("/nicknameCheck")
	public Map<String, Object> nicknameCheck(@RequestBody Map<String, Object> request, HttpSession session) {
	    User user = (User) session.getAttribute("loginUser");
	    String nickname = (String) request.get("nickname");
	    String email = (String) request.get("email");

	    boolean nicknameAvailable = uService.nicknameService(user, nickname);
	    boolean emailUnchanged = (user != null && email.equals(user.getEmail()));

	    Map<String, Object> result = new HashMap<>();
	    result.put("nicknameAvailable", nicknameAvailable);
	    result.put("emailUnchanged", emailUnchanged);
	    return result;
	}


	// 이메일 인증
	// 인증번호 요청
	@PostMapping("/email/send")
	public String sendEmail(@RequestParam("email") String email, HttpSession session) {
		User user = (User) session.getAttribute("loginUser");
		boolean emailCheck = uService.emailCheck(user, email);
		
		
		if (emailCheck) {
			String code = emailService.createAuthCode();
			emailService.sendVerificationEmail(email, code);
			authStore.put(email, code);
			return "메일 발송 완료";
		} else {
			return "중복된 이메일입니다.";
		}
	}

	// 인증번호 확인
	@PostMapping("/email/verify")
	public boolean verifyCode(@RequestParam("email") String email, @RequestParam("code") String code, HttpSession session) {
		boolean isVerified = code.equals(authStore.get(email));
        if (isVerified) {
            authStore.remove(email); 
        }
        return isVerified;
	}

}
