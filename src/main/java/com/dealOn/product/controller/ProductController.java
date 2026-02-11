package com.dealOn.product.controller;

import java.time.ZoneId;
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
import com.dealOn.user.controller.UserController;
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
    private final UserController userController;
    private final UserService uService;
    private final ChatService chatService;


    @GetMapping("/list")
    public String ProductList(
            @RequestParam(value="category", required = false) String category,
            @RequestParam(value="location", required = false) String location,
            @RequestParam(value="minPrice", required = false) Integer minPrice,
            @RequestParam(value="maxPrice", required = false) Integer maxPrice,
            @RequestParam(value="availableOnly", required = false) Boolean availableOnly,
            Model model, HttpSession session
    ) {
    	User loginUser = (User)session.getAttribute("loginUser");
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
        model.addAttribute("loginUser", loginUser);

        return "/list";
    }

    @GetMapping("/detail/{productNo}")
    public String getProductDetail(@PathVariable("productNo") int productNo, Model model, HttpSession session) {
        ProductVO product = productService.getProductDetail(productNo);
        
        if (product == null) {
            return "redirect:/product/list";
        }
        


        User loginUser = (User)session.getAttribute("loginUser");
        System.out.println("product: " + product);        
        User productUser = uService.getProductUser(product);
        
        boolean isWishlisted = false;
        if (loginUser != null) {
            isWishlisted = productService.isWishlisted(Integer.parseInt(loginUser.getUserNo()), productNo);
        }
        
        
        
        model.addAttribute("isWishlisted", isWishlisted); // 뷰로 전달
        model.addAttribute("trust", productUser.getTrust());
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
             Model model, HttpSession session) {
    	 User loginUser = (User)session.getAttribute("loginUser");
    	 Map<String, Object> filters = new HashMap<>();
         filters.put("category", category);
         filters.put("location", location);
         filters.put("minPrice", minPrice);
         filters.put("maxPrice", maxPrice);
         filters.put("availableOnly", availableOnly != null);
         filters.put("value", value);
         
    	List<ProductVO> list = productService.productSearch(filters);
    	
    	System.out.println("검색 값: " + value);
    	System.out.println("상품 LIST: " + list);
    	model.addAttribute("filters", filters);
    	model.addAttribute("products", list);
    	model.addAttribute("loginUser", loginUser);
    	
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
    
    @PostMapping("/updateStatus")
    public ResponseEntity<?> updateStatus(@RequestBody ProductVO product,HttpSession session ) {
    	// A: 판매중, R: 예약중, S: 판매완료
    	String userNo = ((User)session.getAttribute("loginUser")).getUserNo();
    	
    	HashMap<Object, Object> result = new HashMap<Object, Object>();
    	if(product.getStatus() != null ) {
    		int data = productService.updateStatus(product);
    		int resultData=0;
    		if(!product.getStatus().equals("S")) {
	    		if(data > 0) {
	    			List <ReviewVO> beforeData = productService.getReview(userNo);
	    			for (ReviewVO review : beforeData) {
	    			    if (review.getProductNo() == product.getProductNo()) {
	    			    	resultData = productService.deleteReview(product.getProductNo());
	    			    }
	    			}
	    			result.put("state", "성공");
	    			result.put("resultData", resultData);
	    			return ResponseEntity.ok(result);
	    		} else {
	    			result.put("state", "실패");
	    			return ResponseEntity.status(404).body(result);
	    		}
    		} else {
    			if(data > 0) {
					 List<ChatRoom> chatList = chatService.selectChatRoom(product);
					 result.put("data", chatList);	
    				return ResponseEntity.ok(result);
    			} else {
    				result.put("state", "실패");
    				return ResponseEntity.status(404).body(result);
    			}
    		}
    	} else {
    		return ResponseEntity.status(404).body("업데이트할 상품을 찾을 수 없습니다.");
    	}
    }
    @GetMapping("/reviewCreate")
    public String reviewCreate(@RequestParam("chatNo") int chatNo, @RequestParam("buyerNo") int buyerNo, @RequestParam("productNo") int productNo,  HttpSession session) {
    	System.out.println("BackEnd in!");
    	User loginUser = (User)session.getAttribute("loginUser");
    	System.out.println("buyerNo: " + buyerNo);
    	System.out.println("chatNo: " + chatNo);
    	HashMap<Object, Object> map = new HashMap<Object, Object>();
    	map.put("buyerNo", buyerNo);
    	map.put("chatNo", chatNo);
    	map.put("productNo", productNo);
    	map.put("sellerNo", loginUser.getUserNo());
    	
    	int createResult = productService.createReview(map);
    	
    	if(createResult > 0) {
    		return "redirect:/user/myProduct";
    	}
    	return "";
    }
    
    @GetMapping("/getReview")
    @ResponseBody
    public List<ReviewVO> getReview(HttpSession session) {
    	User loginUser = (User)session.getAttribute("loginUser");
    	
    	List<ReviewVO> data = productService.getReview(loginUser.getUserNo());
    	System.out.println("data: " + data);
    	if(data != null) {
    		return data;
    	}
    	return null;
    }
    
    @PostMapping("/ai/category")
    @ResponseBody
    public Map<String, Object> analyzeCategory(@RequestParam("image") MultipartFile image, HttpServletRequest request) { 

        // 1. Python AI 서버에서 카테고리 문자열 받기
        String aiCategoryName = productService.analyzeImageWithAI(image, request);
        // 예: "전자기기", "가구", "기타"

        // 2. DB에 있는 전체 카테고리 조회
        List<CategoryVO> categoryList = productService.findAllCategories();

        // 3. AI 결과와 이름이 같은 카테고리 찾기
        CategoryVO matchedCategory = categoryList.stream()
            .filter(cat -> cat.getName().equals(aiCategoryName))
            .findFirst()
            .orElse(null);

        // 4. 매칭 실패 시 기본 카테고리 처리
        if (matchedCategory == null) {
            matchedCategory = categoryList.stream()
                .filter(cat -> cat.getName().equals("기타"))
                .findFirst()
                .orElse(null);
        }

        return Map.of(
            "categoryNo", matchedCategory.getNo(),
            "categoryName", matchedCategory.getName()
        );
    }
    @PostMapping("/upProduct")
    public ResponseEntity<?> upProduct(@RequestBody int productNo){
    	int result = productService.upProduct(productNo);
    	if(result > 0) {
        	return ResponseEntity.ok().build();
    	} else {
    		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("fail");
    	}
    }
}
