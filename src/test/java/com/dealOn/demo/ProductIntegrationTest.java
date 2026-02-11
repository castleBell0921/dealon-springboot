package com.dealOn.demo;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

import com.dealOn.product.controller.ProductController;

import io.github.cdimascio.dotenv.Dotenv;

@SpringBootTest
@ActiveProfiles("local")
@TestPropertySource(locations = "file:.env")
class ProductIntegrationTest {
	
	// 클래스 수준에서 환경변수를 먼저 세팅합니다.
    static {
        Dotenv dotenv = Dotenv.load();
        dotenv.entries().forEach(entry ->
            System.setProperty(entry.getKey(), entry.getValue())
        );
    }

	@Autowired
    private ProductController pController; // 가짜가 아니라 진짜 Bean을 주입받습니다.

    @Test
    @DisplayName("통합 테스트: 실제로 DB의 상품 날짜가 업데이트 되는지 확인")
    void upProduct_integration_test() {
        // 1. Given (실제 DB에 존재하는 상품 번호를 사용해야 합니다)
        int productNo = 149; 

        // 2. When (컨트롤러부터 DB까지 전체 라인을 태웁니다)
        ResponseEntity<?> response = pController.upProduct(productNo);

        // 3. Then
        // 응답 코드가 200인지 확인
        assertThat(response.getStatusCodeValue()).isEqualTo(200);
 
    }
}
	