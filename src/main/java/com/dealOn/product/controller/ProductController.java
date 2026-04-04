package com.dealOn.product.controller;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.dealOn.chat.model.service.ChatService;
import com.dealOn.chat.model.vo.ChatRoom;
import com.dealOn.common.model.vo.CategoryVO;
import com.dealOn.common.model.vo.ReviewVO;
import com.dealOn.product.model.service.ProductService;
import com.dealOn.product.model.vo.AddProductVO;
import com.dealOn.product.model.vo.ProductVO;
import com.dealOn.user.model.service.UserService;
import com.dealOn.user.model.vo.User;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
@RequestMapping("/product")
public class ProductController {

    private final ProductService productService;
    private final UserService uService;
    private final ChatService chatService;

    private User getLoginUser(HttpSession session) {
        return (User) session.getAttribute("loginUser");
    }

    @GetMapping("/list")
    public String productList(
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "minPrice", required = false) Integer minPrice,
            @RequestParam(value = "maxPrice", required = false) Integer maxPrice,
            @RequestParam(value = "availableOnly", required = false) Boolean availableOnly,
            Model model, HttpSession session) {
        User loginUser = getLoginUser(session);
        Map<String, Object> filters = new HashMap<>();
        filters.put("category", category);
        filters.put("location", location);
        filters.put("minPrice", minPrice);
        filters.put("maxPrice", maxPrice);
        filters.put("availableOnly", Boolean.TRUE.equals(availableOnly));

        model.addAttribute("products", productService.findProducts(filters));
        model.addAttribute("categories", productService.findAllCategories());
        model.addAttribute("filters", filters);
        model.addAttribute("loginUser", loginUser);
        return "/list";
    }

    @GetMapping("/detail/{productNo}")
    public String getProductDetail(@PathVariable("productNo") int productNo, Model model, HttpSession session) {
        ProductVO product = productService.getProductDetail(productNo);
        if (product == null) {
            return "redirect:/product/list";
        }

        User loginUser = getLoginUser(session);
        User productUser = uService.getProductUser(product);
        if (productUser == null) {
            return "redirect:/product/list";
        }

        boolean isWishlisted = false;
        if (loginUser != null) {
            isWishlisted = productService.isWishlisted(Integer.parseInt(loginUser.getUserNo()), productNo);
        }

        model.addAttribute("isWishlisted", isWishlisted);
        model.addAttribute("trust", productUser.getTrust());
        model.addAttribute("product", product);
        model.addAttribute("loginUser", loginUser);

        if (Objects.equals(product.getProductType(), "AUCTION")) {
            return "/auctionDetail";
        }
        return "/normalDetail";
    }

    @GetMapping("/form")
    public String productForm(Model model) {
        model.addAttribute("categories", productService.findAllCategories());
        return "/ProductForm";
    }

    @PostMapping("/addNormal")
    public String addNormalProduct(@ModelAttribute AddProductVO product,
                                   HttpSession session,
                                   RedirectAttributes redirectAttributes) {
        User loginUser = getLoginUser(session);
        if (loginUser == null) {
            redirectAttributes.addFlashAttribute("errorMessage", "로그인이 필요한 서비스입니다.");
            return "redirect:/";
        }

        try {
            product.setUserNo(Integer.parseInt(loginUser.getUserNo()));
            productService.addNormalProduct(product);
            redirectAttributes.addFlashAttribute("message", "상품이 등록되었습니다.");
            return "redirect:/";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "상품 등록에 실패했습니다.");
            return "redirect:/product/form";
        }
    }

    @GetMapping("/updateForm/{productNo}")
    public String productUpdateForm(@PathVariable("productNo") int productNo, Model model, HttpSession session) {
        User loginUser = getLoginUser(session);
        ProductVO product = productService.getProductDetail(productNo);

        if (loginUser == null || product == null || !Objects.equals(product.getUserNo(), loginUser.getUserNo())) {
            return "redirect:/product/detail/" + productNo;
        }

        model.addAttribute("product", product);
        model.addAttribute("categories", productService.findAllCategories());
        return "product/productUpdateForm";
    }

    @PostMapping("/updateNormal")
    public String updateNormalProduct(@ModelAttribute AddProductVO product,
                                      @RequestParam(value = "deletedImages", required = false) String deletedImagesStr,
                                      HttpSession session,
                                      RedirectAttributes redirectAttributes) {
        User loginUser = getLoginUser(session);
        if (loginUser == null || !Objects.equals(String.valueOf(product.getUserNo()), loginUser.getUserNo())) {
            redirectAttributes.addFlashAttribute("errorMessage", "수정 권한이 없습니다.");
            return "redirect:/";
        }

        List<String> deletedImages = new ArrayList<>();
        if (deletedImagesStr != null && !deletedImagesStr.isEmpty()) {
            deletedImages = Arrays.asList(deletedImagesStr.split(","));
        }

        try {
            productService.updateNormalProduct(product, deletedImages);
            redirectAttributes.addFlashAttribute("message", "상품이 수정되었습니다.");
            return "redirect:/product/detail/" + product.getProductNo();
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "상품 수정에 실패했습니다.");
            return "redirect:/product/updateForm/" + product.getProductNo();
        }
    }

    @GetMapping("/search")
    public String productSearch(@RequestParam("searchText") String value,
                                @RequestParam(value = "category", required = false) String category,
                                @RequestParam(value = "location", required = false) String location,
                                @RequestParam(value = "minPrice", required = false) Integer minPrice,
                                @RequestParam(value = "maxPrice", required = false) Integer maxPrice,
                                @RequestParam(value = "availableOnly", required = false) Boolean availableOnly,
                                Model model, HttpSession session) {
        User loginUser = getLoginUser(session);
        Map<String, Object> filters = new HashMap<>();
        filters.put("category", category);
        filters.put("location", location);
        filters.put("minPrice", minPrice);
        filters.put("maxPrice", maxPrice);
        filters.put("availableOnly", Boolean.TRUE.equals(availableOnly));
        filters.put("value", value);

        model.addAttribute("filters", filters);
        model.addAttribute("products", productService.productSearch(filters));
        model.addAttribute("loginUser", loginUser);
        return "/list";
    }

    @PostMapping("/delete/{productNo}")
    public String deleteProduct(@PathVariable("productNo") int productNo,
                                HttpSession session,
                                RedirectAttributes redirectAttributes) {
        User loginUser = getLoginUser(session);
        ProductVO product = productService.getProductDetail(productNo);

        if (loginUser == null || product == null || !Objects.equals(product.getUserNo(), loginUser.getUserNo())) {
            redirectAttributes.addFlashAttribute("errorMessage", "삭제 권한이 없습니다.");
            return "redirect:/product/detail/" + productNo;
        }

        try {
            productService.deleteProduct(productNo);
            redirectAttributes.addFlashAttribute("message", "상품이 삭제되었습니다.");
            return "redirect:/product/list";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "삭제 중 오류가 발생했습니다.");
            return "redirect:/product/detail/" + productNo;
        }
    }

    @PostMapping("/wishlist/toggle")
    @ResponseBody
    public String toggleWishlist(@RequestParam("productNo") int productNo, HttpSession session) {
        User loginUser = getLoginUser(session);
        if (loginUser == null) {
            return "login_required";
        }
        return productService.toggleWishlist(Integer.parseInt(loginUser.getUserNo()), productNo);
    }

    @PostMapping("/updateStatus")
    public ResponseEntity<?> updateStatus(@RequestBody ProductVO product, HttpSession session) {
        User loginUser = getLoginUser(session);
        if (loginUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("login_required");
        }

        ProductVO currentProduct = productService.getProductDetail(product.getProductNo());
        if (currentProduct == null || !Objects.equals(currentProduct.getUserNo(), loginUser.getUserNo())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("forbidden");
        }

        HashMap<Object, Object> result = new HashMap<>();
        if (product.getStatus() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("invalid_status");
        }

        int data = productService.updateStatus(product);
        int resultData = 0;
        if (!"S".equals(product.getStatus())) {
            if (data > 0) {
                List<ReviewVO> beforeData = productService.getReview(loginUser.getUserNo());
                for (ReviewVO review : beforeData) {
                    if (review.getProductNo() == product.getProductNo()) {
                        resultData = productService.deleteReview(product.getProductNo());
                    }
                }
                result.put("state", "success");
                result.put("resultData", resultData);
                return ResponseEntity.ok(result);
            }
            result.put("state", "fail");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(result);
        }

        if (data > 0) {
            List<ChatRoom> chatList = chatService.selectChatRoom(product);
            result.put("data", chatList);
            return ResponseEntity.ok(result);
        }
        result.put("state", "fail");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(result);
    }

    @GetMapping("/reviewCreate")
    public String reviewCreate(@RequestParam("chatNo") int chatNo,
                               @RequestParam("buyerNo") int buyerNo,
                               @RequestParam("productNo") int productNo,
                               HttpSession session) {
        User loginUser = getLoginUser(session);
        if (loginUser == null) {
            return "redirect:/";
        }

        ProductVO currentProduct = productService.getProductDetail(productNo);
        if (currentProduct == null || !Objects.equals(currentProduct.getUserNo(), loginUser.getUserNo())) {
            return "redirect:/product/detail/" + productNo;
        }

        HashMap<Object, Object> map = new HashMap<>();
        map.put("buyerNo", buyerNo);
        map.put("chatNo", chatNo);
        map.put("productNo", productNo);
        map.put("sellerNo", loginUser.getUserNo());

        int createResult = productService.createReview(map);
        if (createResult > 0) {
            return "redirect:/user/myProduct";
        }
        return "redirect:/product/detail/" + productNo;
    }

    @GetMapping("/getReview")
    @ResponseBody
    public List<ReviewVO> getReview(HttpSession session) {
        User loginUser = getLoginUser(session);
        if (loginUser == null) {
            return List.of();
        }
        List<ReviewVO> data = productService.getReview(loginUser.getUserNo());
        return data != null ? data : List.of();
    }

    @PostMapping("/ai/category")
    @ResponseBody
    public Map<String, Object> analyzeCategory(@RequestParam("image") MultipartFile image, HttpServletRequest request) {
        if (image == null || image.isEmpty()) {
            return Map.of("categoryNo", 0, "categoryName", "기타");
        }

        String aiCategoryName = productService.analyzeImageWithAI(image, request);
        List<CategoryVO> categoryList = productService.findAllCategories();

        CategoryVO matchedCategory = categoryList.stream()
                .filter(cat -> Objects.equals(cat.getName(), aiCategoryName))
                .findFirst()
                .orElseGet(() -> categoryList.stream()
                        .filter(cat -> "기타".equals(cat.getName()) || "湲고?".equals(cat.getName()))
                        .findFirst()
                        .orElse(null));

        if (matchedCategory == null) {
            return Map.of("categoryNo", 0, "categoryName", "기타");
        }

        return Map.of(
                "categoryNo", matchedCategory.getNo(),
                "categoryName", matchedCategory.getName()
        );
    }

    @PostMapping("/upProduct")
    public ResponseEntity<?> upProduct(@RequestBody int productNo, HttpSession session) {
        User loginUser = getLoginUser(session);
        if (loginUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("login_required");
        }

        ProductVO product = productService.getProductDetail(productNo);
        if (product == null || !Objects.equals(product.getUserNo(), loginUser.getUserNo())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("forbidden");
        }

        int result = productService.upProduct(productNo);
        if (result > 0) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("fail");
    }
}
