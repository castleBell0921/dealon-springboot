package com.dealOn;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.dealOn.product.model.service.ProductService;
import com.dealOn.product.model.vo.ProductVO;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class MainController {
	private final ProductService pService;

	@GetMapping("/")
	public String home(Model model, @RequestParam(value = "category", required = false) String category,
			@RequestParam(value = "location", required = false) String location,
			@RequestParam(value = "minPrice", required = false) Integer minPrice,
			@RequestParam(value = "maxPrice", required = false) Integer maxPrice,
			@RequestParam(value = "availableOnly", required = false) Boolean availableOnly) {
		Map<String, Object> filters = new HashMap<>();
		filters.put("category", category);
		filters.put("location", location);
		filters.put("minPrice", minPrice);
		filters.put("maxPrice", maxPrice);
		filters.put("availableOnly", availableOnly != null);
		List<ProductVO> allList = pService.getAllProduct(filters);
		List<ProductVO> topList = allList != null ? allList.subList(0, Math.min(8, allList.size())) : new ArrayList<>();

		model.addAttribute("allList", topList);
		return "index";
	}

	@GetMapping("/products/allProduct")
	public String moreProduct(@RequestParam(value = "source") String source, Model model,
			@RequestParam(value = "category", required = false) String category,
			@RequestParam(value = "location", required = false) String location,
			@RequestParam(value = "minPrice", required = false) Integer minPrice,
			@RequestParam(value = "maxPrice", required = false) Integer maxPrice,
			@RequestParam(value = "availableOnly", required = false) Boolean availableOnly) {
		Map<String, Object> filters = new HashMap<>();
		filters.put("category", category);
		filters.put("location", location);
		filters.put("minPrice", minPrice);
		filters.put("maxPrice", maxPrice);
		filters.put("availableOnly", availableOnly != null);

		if (source.equals("allProduct")) {
			List<ProductVO> list = pService.getAllProduct(filters);
			model.addAttribute("products", list);
			model.addAttribute("filters", filters);
		} else if (source.equals("bestProduct")) {

		} else {

		}
		return "moreProductList";
	}

}
