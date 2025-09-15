package com.dealOn.ajax;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.solapi.sdk.SolapiClient;
import com.solapi.sdk.message.exception.SolapiMessageNotReceivedException;
import com.solapi.sdk.message.model.Message;
import com.solapi.sdk.message.service.DefaultMessageService;

import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api")
@Slf4j
public class AjaxController {

	@Value("${coolsms.api.key}")
	private String apiKey;

	@Value("${coolsms.api.secret}")
	private String apiSecret;

	@Value("${coolsms.from.phone}") // 발신번호
	private String fromPhone;



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
		String authNumber = generateAuthNumber();

		DefaultMessageService messageService = SolapiClient.INSTANCE.createInstance(apiKey, apiSecret);

		Message message = new Message();
		message.setFrom(fromPhone);
		message.setTo(phone);
		message.setText("[DealOn] 인증번호 [" + authNumber + "]를 입력해주세요.");

		Map<String, Object> resp = new HashMap<>();

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
	} 

	// 인증번호 확인 API
	@PostMapping("/verify-auth")
	public Map<String, Object> verifyAuth(@RequestBody Map<String, String> request) {
		String phone = request.get("phone");
		String authNumber = request.get("authNumber");

		Map<String, Object> resp = new HashMap<>();
//		String stored = authCache.get(phone);

//		if (stored != null && stored.equals(authNumber)) {
//			authCache.remove(phone);
//			resp.put("success", true);
//			resp.put("message", "인증에 성공했습니다.");
//		} else {
//			resp.put("success", false);
//			resp.put("message", "인증번호가 일치하지 않습니다.");
//		}
		return resp;
	}
}
