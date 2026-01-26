package com.dealOn.admin.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;


import com.dealOn.admin.model.vo.UserDetail;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.dealOn.admin.model.service.AdminService;
import com.dealOn.chat.model.service.ChatService;
import com.dealOn.chat.model.vo.ChatRoom;
import com.dealOn.common.Pagination;
import com.dealOn.common.model.vo.PageInfo;
import com.dealOn.product.model.mapper.ProductMapper;
import com.dealOn.product.model.service.ProductService;
import com.dealOn.product.model.vo.ProductVO;
import com.dealOn.user.model.vo.User;
import com.dealOn.admin.model.vo.UserList;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
@RequestMapping("/admin")
public class AdminController {
	
	private final ChatService chatService;
	private final ProductService productService;
	private final AdminService adminService;
	
	@GetMapping("main")
	public String admAcc(HttpServletRequest request, Model model) {
		model.addAttribute("requestURI",request.getRequestURI());
		return "admin/dashboard";
	}
	
	@GetMapping("userMng")
	public String joinUsrMng(@RequestParam(value = "page", defaultValue = "1") int currentPage, HttpServletRequest request, Model model) {
		int listCount = adminService.selectUserListCount();

		PageInfo pi = Pagination.getPageInfo(currentPage, listCount, 10);

		List<UserList> userList = adminService.selectUserList(pi);

		model.addAttribute("userList", userList);
		model.addAttribute("pi", pi);

		return "admin/userMng";
	}

	@ResponseBody
	@GetMapping("/user/detail")
	public UserDetail getUserDetail(@RequestParam("userNo") int userNo) {
		return adminService.selectUserDetail(userNo);
	}
	
	@GetMapping("/productMng")
	public String joinProductMng(
	        @RequestParam(value = "page", defaultValue = "1") int currentPage,
	        HttpServletRequest request,
	        Model model) {

	    int listCount = adminService.getProductCount(); // 전체 상품 수
	    int boardLimit = 9; // 한 페이지당 9개 (3x3)

	    PageInfo pi = Pagination.getPageInfo(currentPage, listCount, boardLimit);
	    List<ProductVO> productList = adminService.getProductList(pi); // 페이징된 리스트만 가져오기

	    model.addAttribute("productList", productList);
	    model.addAttribute("pi", pi);
	    model.addAttribute("requestURI", request.getRequestURI());

	    return "admin/productMng";
	}


	@GetMapping("decMng")
	   public String decMng(HttpServletRequest request, Model model) {
		model.addAttribute("requestURI",request.getRequestURI());
		
		
		
	    return "admin/decMng";
	}
	
	@GetMapping("/getProductDetail")
	@ResponseBody
	public ProductVO getProductDetail(@RequestParam("productNo") int productNo) {
	    return adminService.getProductDetail(productNo);
	}
	
	@PostMapping("/toggleProductStatus")
	@ResponseBody
	public ResponseEntity<String> toggleProductStatus(@RequestBody ProductVO req) {
		
//		System.out.println("productNo: " + req.getProductNo());
//		System.out.println("newStatus: " + req.getNewStatus());
		int result = adminService.updateProductStatus(req);
		
		if(result > 0) {
			return ResponseEntity.ok("success");	
		} else {
	        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("fail");
		}
	}
	
	/*
	 * @GetMapping("/product/search")
	 * 
	 * @ResponseBody public List<ProductVO> searchProducts(@RequestParam("keyword")
	 * String keyword) { return adminService.searchProducts(keyword); }
	 */
	
	@GetMapping("/product/search")
	@ResponseBody
	public Map<String, Object> searchProducts(
	        @RequestParam(value = "keyword", required = false, defaultValue = "") String keyword,
	        @RequestParam(value = "page", defaultValue = "1") int currentPage) {

	    // ✅ 검색어가 비어있거나 공백이면 전체 조회로 전환
	    if (keyword == null || keyword.trim().isEmpty()) {
	        int listCount = adminService.getProductCount(); // 전체 상품 수
	        int boardLimit = 9;
	        PageInfo pi = Pagination.getPageInfo(currentPage, listCount, boardLimit);
	        List<ProductVO> productList = adminService.getProductList(pi); // 전체 상품 목록
	        Map<String, Object> result = new HashMap<>();
	        result.put("productList", productList);
	        result.put("pi", pi);
	        return result;
	    }

	    // ✅ 검색어가 있을 경우 검색 로직 실행
	    int listCount = adminService.getSearchCount(keyword);
	    int boardLimit = 9;
	    PageInfo pi = Pagination.getPageInfo(currentPage, listCount, boardLimit);
	    List<ProductVO> productList = adminService.searchProducts(keyword, pi);

	    Map<String, Object> result = new HashMap<>();
	    result.put("productList", productList);
	    result.put("pi", pi);
	    return result;
	}
	
	@PostMapping("/report")
	@ResponseBody
	public int reportUser(@RequestBody Map<String, Object> request, HttpSession session) {
		
		System.out.println("컨트롤러 옴0");
		
		User loginUser = (User) session.getAttribute("loginUser");
		String chatNo = (String)request.get("chatNo");
		
		//신고 카테고리
		String reason = (String)request.get("reason");
		
		//신고 내용
		String detail = (String)request.get("detail");
		
		//상품 이름
		int productNo = Integer.parseInt((String) request.get("productNo"));
		
		ChatRoom chatInfo = chatService.findByChatInfo(chatNo, loginUser.getUserNo());
		
		System.out.println("컨트롤러 옴1");
		
		Map<String, Object> data = new HashMap<>();
	    data.put("loginUser", loginUser); // 신고자 객체 통째로 넣기
	    data.put("reason", reason);
	    data.put("detail", detail);
	    data.put("productNo", productNo);
		
	    System.out.println("컨트롤러 옴2");
	    
	    int checkReportUser = adminService.checkReportUser(loginUser.getUserNo(), chatInfo.getSellerNo());
	    System.out.println(checkReportUser);
	    int result = 0;
	    
	    if(!(checkReportUser > 0)) {
	    	//신고 하는 중
			result = adminService.reportUser(chatInfo, data);
	    }
	    
	    
		
		
			
		return result;
	}



}
