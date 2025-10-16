package com.dealOn.product.controller;

import com.dealOn.common.model.vo.CategoryVO;
import com.dealOn.product.model.service.ProductService;
import com.dealOn.product.model.vo.AddProductVO;
import com.dealOn.product.model.vo.ProductVO;
import com.dealOn.user.model.vo.User;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

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
            @RequestParam(value="category", required = false) String category,
            @RequestParam(value="location", required = false) String location,
            @RequestParam(value="minPrice", required = false) Integer minPrice,
            @RequestParam(value="maxPrice", required = false) Integer maxPrice,
            @RequestParam(value="availableOnly", required = false) Boolean availableOnly,
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

        return "/list";
    }

    @GetMapping("/detail/{productNo}")
    public String getProductDetail(@PathVariable("productNo") int productNo, Model model) {
        ProductVO product = productService.getProductDetail(productNo);

        if (product == null) {
            return "redirect:/product/list";
        }

        model.addAttribute("product", product);
        if (Objects.equals(product.getProductType(), "AUCTION")) {
            return "/auctionDetail"; // 경매 상품일 경우
        } else {
            return "/normalDetail";  // 일반 상품일 경우
        }
    }

    @GetMapping("/form")
    public String productForm(Model model)
    {
        List<CategoryVO> categories = productService.findAllCategories();
        model.addAttribute("categories", categories);
        return "/ProductForm";
    }

    @PostMapping("/addNormal")
    public String addNormalProduct(@ModelAttribute AddProductVO product, RedirectAttributes redirectAttributes, HttpSession session) {
        try {
            User loginUser = (User) session.getAttribute("loginUser");
            product.setUserNo(Integer.parseInt(loginUser.getUserNo()));

            productService.addNormalProduct(product);
            redirectAttributes.addFlashAttribute("message", "상품이 성공적으로 등록되었습니다.");
            return "redirect:/product/list"; // 성공 시 리스트
        } catch (Exception e) {
            e.printStackTrace();
            redirectAttributes.addFlashAttribute("errorMessage", "상품 등록에 실패했습니다: " + e.getMessage());
            return "redirect:/product/form"; // 실패 시 다시 폼으로
        }
    }

}
