package com.dealOn.Auth.service;	

import java.util.Random;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

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

    // 메일 전송
    public void sendAuthMail(String toEmail, String authCode) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("이메일 인증번호 안내");
        message.setText("인증번호는 " + authCode + " 입니다.");
        javaMailSender.send(message);
    }
}
