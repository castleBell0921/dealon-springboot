package com.dealOn;

import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import com.dealOn.product.model.service.ProductService;
import com.dealOn.product.model.vo.ProductVO;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class MainController {
	private final ProductService pService;
@GetMapping("/")
public String home(Model model) {
	List<ProductVO> allProduct = pService.getAllProduct();
	model.addAttribute("allList", allProduct);
	return "index";
}
	



}
