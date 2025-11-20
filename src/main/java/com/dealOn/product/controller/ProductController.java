package com.dealOn.product.controller;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.dealOn.common.model.vo.CategoryVO;
import com.dealOn.product.model.service.ProductService;
import com.dealOn.product.model.vo.AddProductVO;
import com.dealOn.product.model.vo.ProductVO;
import com.dealOn.user.model.vo.User;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

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
    public String getProductDetail(@PathVariable("productNo") int productNo, Model model, HttpSession session) {
        ProductVO product = productService.getProductDetail(productNo);
        User loginUser = (User)session.getAttribute("loginUser");
        if (product == null) {
            return "redirect:/product/list";
        }
        boolean isWishlisted = false;
        if (loginUser != null) {
            isWishlisted = productService.isWishlisted(Integer.parseInt(loginUser.getUserNo()), productNo);
        }
        model.addAttribute("isWishlisted", isWishlisted); // 뷰로 전달
        model.addAttribute("product", product);
        model.addAttribute("loginUser",loginUser);
        System.out.println("loginUser: " + loginUser);
        System.out.println("product: " + product);
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
    public String addNormalProduct(@ModelAttribute AddProductVO product,
                                   HttpSession session, // HttpSession 직접 주입받음
                                   RedirectAttributes redirectAttributes) {

        User loginUser = (User) session.getAttribute("loginUser");

        // 로그인 상태 확인
        if (loginUser == null) {
            redirectAttributes.addFlashAttribute("errorMessage", "로그인이 필요한 서비스입니다.");
            return "redirect:/";
        }

        try {
            product.setUserNo(Integer.parseInt(loginUser.getUserNo()));

            productService.addNormalProduct(product);
            redirectAttributes.addFlashAttribute("message", "상품이 성공적으로 등록되었습니다.");
            return "redirect:/";
        } catch (Exception e) {
            e.printStackTrace();
            redirectAttributes.addFlashAttribute("errorMessage", "상품 등록에 실패했습니다: " + e.getMessage());
            return "redirect:/product/add";
        }
    }

    @GetMapping("/updateForm/{productNo}")
    public String productUpdateForm(@PathVariable("productNo") int productNo, Model model, HttpSession session) {

        User loginUser = (User) session.getAttribute("loginUser");

        // 1. 상품 상세 정보 조회 (기존 getProductDetail 재사용)
        ProductVO product = productService.getProductDetail(productNo);
        // 디버깅로그
        System.out.println("### DEBUG 2: Controller ###");
        if (product != null) {
            System.out.println("Category Name: " + product.getCategoryName());
            System.out.println("Category No: " + product.getCategoryNo());
        } else {
            System.out.println("Product is NULL");
        }
        System.out.println("###########################");
        // 디버깅로그 여기까지

        // 2. 로그인 여부 및 본인 상품 여부 확인
        // *주의*: ProductVO에 userNo 필드가 있고, User VO에 getUserNo()가 String을 반환한다고 가정합니다.
        if (loginUser == null || product == null || !Objects.equals(String.valueOf(product.getUserNo()), loginUser.getUserNo())) {
            // model.addAttribute("errorMessage", "수정 권한이 없습니다.");
            return "redirect:/product/detail/" + productNo; // 권한이 없으면 상세페이지로
        }

        // 3. 카테고리 목록 조회 (기존 findAllCategories 재사용)
        List<CategoryVO> categories = productService.findAllCategories();

        // 4. Model에 담기
        model.addAttribute("product", product); // (상세 정보)
        model.addAttribute("categories", categories); // (카테고리 목록)

        return "product/productUpdateForm"; // (새로 만들 HTML 템플릿)
    }

    /**
     * (POST) 상품 수정 처리
     */
    @PostMapping("/updateNormal")
    public String updateNormalProduct(@ModelAttribute AddProductVO product, // 폼 데이터 바인딩
                                      @RequestParam(value = "deletedImages", required = false) String deletedImagesStr,
                                      HttpSession session,
                                      RedirectAttributes redirectAttributes) {

        User loginUser = (User) session.getAttribute("loginUser");

        // 1. 로그인 확인 및 권한 재확인
        // (product.getUserNo()는 폼에서 hidden으로 전송되어야 함)
        if (loginUser == null || !Objects.equals(String.valueOf(product.getUserNo()), loginUser.getUserNo())) {
            redirectAttributes.addFlashAttribute("errorMessage", "수정 권한이 없습니다.");
            return "redirect:/";
        }

        // 2. 삭제할 이미지 URL 리스트 파싱
        List<String> deletedImages = new ArrayList<>();
        if (deletedImagesStr != null && !deletedImagesStr.isEmpty()) {
            deletedImages = Arrays.asList(deletedImagesStr.split(","));
        }

        // 3. 서비스 호출
        try {
            // product 객체에는 productNo, userNo, name, detail, price, category, salesLocation 및
            // *새로 추가된* productImages(MultipartFile 리스트)가 포함되어 있습니다.
            productService.updateNormalProduct(product, deletedImages);

            redirectAttributes.addFlashAttribute("message", "상품이 성공적으로 수정되었습니다.");
            // 4. 성공 시, 상세 페이지로 리다이렉트
            return "redirect:/product/detail/" + product.getProductNo();

        } catch (Exception e) {
            e.printStackTrace();
            redirectAttributes.addFlashAttribute("errorMessage", "상품 수정에 실패했습니다: " + e.getMessage());
            // 5. 실패 시, 수정 폼으로 다시 리다이렉트
            return "redirect:/product/updateForm/" + product.getProductNo();
        }
    }
    @GetMapping("/search")
    public String ProductSearch(@RequestParam("searchText") String value, 
    		 @RequestParam(value="category", required = false) String category,
             @RequestParam(value="location", required = false) String location,
             @RequestParam(value="minPrice", required = false) Integer minPrice,
             @RequestParam(value="maxPrice", required = false) Integer maxPrice,
             @RequestParam(value="availableOnly", required = false) Boolean availableOnly,
             Model model) {
    	 Map<String, Object> filters = new HashMap<>();
         filters.put("category", category);
         filters.put("location", location);
         filters.put("minPrice", minPrice);
         filters.put("maxPrice", maxPrice);
         filters.put("availableOnly", availableOnly != null);
         filters.put("value", value);
         
    	List<ProductVO> list = productService.productSearch(filters);
    	
    	System.out.println("검색 값: " + value);
    	model.addAttribute("filters", filters);
    	model.addAttribute("products", list);
    	
    	return "/list";
    }

    @GetMapping("/delete/{productNo}")
    public String deleteProduct(@PathVariable("productNo") int productNo,
                                HttpSession session,
                                RedirectAttributes redirectAttributes) {

        User loginUser = (User) session.getAttribute("loginUser");
        ProductVO product = productService.getProductDetail(productNo);

        if (loginUser == null || product == null || !String.valueOf(product.getUserNo()).equals(loginUser.getUserNo())) {
            redirectAttributes.addFlashAttribute("errorMessage", "삭제 권한이 없습니다.");
            return "redirect:/product/detail/" + productNo;
        }

        try {
            productService.deleteProduct(productNo);
            redirectAttributes.addFlashAttribute("message", "상품이 삭제되었습니다.");
            return "redirect:/product/list"; // 삭제 후 목록으로 이동
        } catch (Exception e) {
            e.printStackTrace();
            redirectAttributes.addFlashAttribute("errorMessage", "삭제 중 오류가 발생했습니다.");
            return "redirect:/product/detail/" + productNo;
        }
    }

    @PostMapping("/wishlist/toggle")
    @ResponseBody
    public String toggleWishlist(@RequestParam("productNo") int productNo, HttpSession session) {
        User loginUser = (User) session.getAttribute("loginUser");
        // 로그인 안 된 경우 처리
        if (loginUser == null) {
            return "login_required";
        }
        // ProductService의 메서드 호출
        return productService.toggleWishlist(Integer.parseInt(loginUser.getUserNo()), productNo);
    }
}
