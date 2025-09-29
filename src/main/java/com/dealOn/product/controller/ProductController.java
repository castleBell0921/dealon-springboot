package com.dealOn.product.controller;

import com.dealOn.common.model.vo.CategoryVO;
import com.dealOn.product.model.service.ProductService;
import com.dealOn.product.model.vo.ProductVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Controller
@RequiredArgsConstructor
@RequestMapping("/product")
public class ProductController {

    private final ProductService productService;


    @GetMapping("/list")
    public String ProductList(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer minPrice,
            @RequestParam(required = false) Integer maxPrice,
            @RequestParam(required = false) Boolean availableOnly,
            Model model
    ) {
        Map<String, Object> filters = new HashMap<>();
        filters.put("category", category);
        filters.put("location", location);
        filters.put("minPrice", minPrice);
        filters.put("maxPrice", maxPrice);
        filters.put("availableOnly", availableOnly != null);

        List<ProductVO> products = productService.findProducts(filters);
        List<CategoryVO> categories = productService.findAllCategories();

        model.addAttribute("products", products);
        model.addAttribute("categories", categories);
        model.addAttribute("filters", filters);

        return "product/list";
    }

    @GetMapping("/detail/{productNo}")
    public String getProductDetail(@PathVariable("productNo") int productNo, Model model) {
        ProductVO product = productService.getProductDetail(productNo);

        if (product == null) {
            return "redirect:/product/list";
        }

        model.addAttribute("product", product);
        if (Objects.equals(product.getProductType(), "AUCTION")) {
            return "product/auctionDetail"; // 경매 상품일 경우
        } else {
            return "product/normalDetail";  // 일반 상품일 경우
        }
    }

    @GetMapping("/form")
    public String productForm()
    {
        return "/ProductForm";
    }

}
