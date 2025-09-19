package com.dealOn.product.controller;

import com.dealOn.common.model.vo.CategoryVO;
import com.dealOn.product.model.service.ProductService;
import com.dealOn.product.model.vo.ProductVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
@RequestMapping("/product")
public class ProductController {

    private final ProductService productService;


    @GetMapping("/form")
    public String productForm()
    {
        return "/ProductForm";
    }

    @GetMapping("/detail")
    public String productDetail()
    {
        return "/ProductDetail";
    }

    @GetMapping("/list") // GET /products/list 요청을 처리
    public String ProductList(

            @RequestParam(required = false) String category,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer minPrice,
            @RequestParam(required = false) Integer maxPrice,
            @RequestParam(required = false) Boolean availableOnly,
            Model model
    ) {
        // 서비스로 보낼 맵
        Map<String, Object> filters = new HashMap<>();
        filters.put("category", category);
        filters.put("location", location);
        filters.put("minPrice", minPrice);
        filters.put("maxPrice", maxPrice);
        // 'availableOnly'는 체크 시 "on"이라는 문자열로 전달되므로, null이 아닌지 여부로 판단
        filters.put("availableOnly", availableOnly != null);

        // 2. 서비스 호출: 필터링된 상품 목록과 전체 카테고리 목록 조회
        List<ProductVO> products = productService.findProducts(filters);
        List<CategoryVO> categories = productService.findAllCategories();

        // 3. Model에 데이터 추가하여 View(Thymeleaf)로 전달
        model.addAttribute("products", products);
        model.addAttribute("categories", categories);
        model.addAttribute("filters", filters); // 현재 적용된 필터 값을 뷰에 다시 전달

        return "product/list"; // templates/products/list.html
    }
}
