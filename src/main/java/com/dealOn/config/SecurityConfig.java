package com.dealOn.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig { // 설정 파일의 역할을 할 클래스

    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/mySellList/**",
                    "/myBuyerList/**",
                    "/myWishList/**",
                    "/editProfile/**"
                ).authenticated() // 로그인 필요한 경로
                .anyRequest().permitAll() // 나머지는 허용
            )
            // 로그인 안 되어 있으면 index로 이동
            .formLogin(form -> form
                .loginPage("/") // 세션 없거나 인증 안 되어 있으면 index로 보냄
                .permitAll()
            )
            .csrf(csrf -> csrf.disable()); // 개발 중엔 끄기

        return http.build();
    }


    
    
}
