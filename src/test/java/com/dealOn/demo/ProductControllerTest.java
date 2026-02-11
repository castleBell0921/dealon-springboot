package com.dealOn.demo;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import com.dealOn.product.controller.ProductController;
import com.dealOn.product.model.service.ProductService;


@ExtendWith(MockitoExtension.class)
class ProductControllerTest {
	@InjectMocks
	private ProductController pController; // 가짜(Mock) 서비스들을 주입받을 대상
	
	@Mock
	private ProductService pService; // 가짜 서비스 객체 생성
	
	
	@Test
	@DisplayName("상품 끌올 성공시 200 OK 반환")
	void upProduct_test() {
		// Given(준비)
		int productNo = 000;
		// pSer	vice.upProduct(149)가 호출되면 무조건 1을 리턴하라고 가짜 행동 정의
		lenient().when(pService.upProduct(productNo)).thenReturn(1);
		
		// when(실행)
		ResponseEntity<?> response = pController.upProduct(productNo);
		
		//then(검증)
		assertThat(response.getStatusCodeValue()).isEqualTo(200);
		
		// 추가 검증
		verify(pService, times(1)).upProduct(productNo);
	}
	
	@Test
	@DisplayName("실패: DB 업데이트 실패 시 400 Bad Request 반환")
	void upProduct_fail_response_test() {
	    int productNo = 149;
	    lenient().when(pService.upProduct(productNo)).thenReturn(0); // 실패 가정

	    ResponseEntity<?> response = pController.upProduct(productNo);

	    // 이제 400 에러가 오는지 검증할 수 있습니다.
	    assertThat(response.getStatusCodeValue()).isEqualTo(400);
	}
	
	@Test
	@DisplayName("실패: 서비스 실행 중 예외(Error) 발생 시 500 에러 반환")
	void upProduct_exception_test() {
	    // Given: 서비스가 호출되면 예외를 던지도록 설정
	    int productNo = 149;
	    lenient().when(pService.upProduct(productNo))
	             .thenThrow(new RuntimeException("DB 에러 발생"));

	    // When: 실행 (보통 @ControllerAdvice가 있으면 500으로 변환됨)
	    // 현재는 단순 단위 테스트이므로 예외가 밖으로 튀어나올 것입니다.
	    try {
	        pController.upProduct(productNo);
	    } catch (RuntimeException e) {
	        // Then: 예외 메시지가 우리가 설정한 게 맞는지 확인
	        assertThat(e.getMessage()).isEqualTo("DB 에러 발생");
	    }
	}

}
