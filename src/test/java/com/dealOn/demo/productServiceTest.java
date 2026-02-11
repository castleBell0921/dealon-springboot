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

import com.dealOn.product.model.mapper.ProductMapper;
import com.dealOn.product.model.service.ProductService;

@ExtendWith(MockitoExtension.class)
class productServiceTest {
	@InjectMocks
	private ProductService pService;
	
	@Mock
	private ProductMapper pMapper;
	
	@Test
	@DisplayName("서비스 로직 : 상품 번호가 유효하면 DB 업데이트 호출")
	void upProduct_service_logic_test() {
		// Given
		int productNo = 149;
		lenient().when(pMapper.upProduct(productNo)).thenReturn(1);
		
		//when
		int result = pService.upProduct(productNo);
		
		//then
		assertThat(result).isEqualTo(1);
		verify(pMapper, times(1)).upProduct(productNo);
	}

}
