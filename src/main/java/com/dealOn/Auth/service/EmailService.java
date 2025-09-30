package com.dealOn.Auth.service;

import java.util.Random;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailService {

	private final JavaMailSender javaMailSender;

	// 인증번호 생성
	public String createAuthCode() {
		Random random = new Random();
		StringBuilder key = new StringBuilder();
		for (int i = 0; i < 6; i++) {
			key.append(random.nextInt(10)); // 0~9 숫자
		}
		return key.toString();
	}

	// 랜덤 임시 비밀번호 생성
	public String generateTempPassword(int length) {
		String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
		StringBuilder sb = new StringBuilder();
		Random random = new Random();
		for (int i = 0; i < length; i++) {
			sb.append(chars.charAt(random.nextInt(chars.length())));
		}
		return sb.toString();
	}

	// 이메일 인증
	public void sendVerificationEmail(String toEmail, String authCode) {
		sendHtmlEmail(toEmail, "DealOn 이메일 인증번호 안내",
				"<div style='font-family:Arial, sans-serif; padding:20px; border:1px solid #ddd; border-radius:8px; max-width:500px; margin:auto;'>"
						+ "  <h2 style='color:#2c3e50; text-align:center;'>이메일 인증</h2>"
						+ "  <p style='font-size:14px; color:#333;'>안녕하세요 👋<br>" + "  요청하신 이메일 인증번호를 아래에서 확인해주세요.</p>"
						+ "  <div style='text-align:center; margin:20px 0;'>"
						+ "    <span style='display:inline-block; background:#3498db; color:#fff; font-size:20px; font-weight:bold; padding:10px 20px; border-radius:5px;'>"
						+ authCode + "    </span>" + "  </div>"
						+ "  <p style='font-size:12px; color:#888;'>본 메일은 발신 전용입니다.</p>" + "</div>");
	}

	// 임시 비밀번호 발송
	public void sendTempPasswordEmail(String toEmail, String tempPwd) {
		String htmlContent = "<div style='font-family:Arial, sans-serif; padding:30px; border:1px solid #ddd; border-radius:10px; max-width:500px; margin:auto; background:#f9f9f9;'>"
				+ "  <h2 style='color:#2c3e50; text-align:center; margin-bottom:20px;'>DealOn 임시 비밀번호 안내</h2>"
				+ "  <p style='font-size:14px; color:#333; line-height:1.6;'>" + "    요청하신 임시 비밀번호가 발급되었습니다.<br>"
				+ "    아래 임시 비밀번호로 로그인 후, 반드시 비밀번호를 변경해주세요." + "  </p>"
				+ "  <div style='text-align:center; margin:30px 0;'>"
				+ "    <span style='display:inline-block; background:#3498db; color:#fff; font-size:22px; font-weight:bold; padding:15px 25px; border-radius:8px; letter-spacing:2px;'>"
				+ tempPwd + "    </span>" + "  </div>"
				+ "  <p style='font-size:12px; color:#888; text-align:center;'>본 메일은 발신 전용입니다.</p>" + "</div>";
		sendHtmlEmail(toEmail, "DealOn 임시 비밀번호 안내", htmlContent);
	}

	// 실제 전송 로직 공통
	private void sendHtmlEmail(String toEmail, String subject, String htmlContent) {
		try {
			MimeMessage message = javaMailSender.createMimeMessage();
			MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
			helper.setTo(toEmail);
			helper.setSubject(subject);

			// HTML 본문 적용 (중복 wrapper 제거)
			helper.setText(htmlContent, true);
			javaMailSender.send(message);

		} catch (MessagingException e) {
			e.printStackTrace();
			throw new RuntimeException("이메일 발송 중 오류 발생", e);
		}
	}

}
