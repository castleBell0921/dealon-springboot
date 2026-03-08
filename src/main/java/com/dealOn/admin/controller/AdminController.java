package com.dealOn.admin.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
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

import com.dealOn.admin.model.service.AdminService;
import com.dealOn.admin.model.vo.AdminStats;
import com.dealOn.admin.model.vo.UserDetail;
import com.dealOn.admin.model.vo.UserList;
import com.dealOn.chat.model.service.ChatService;
import com.dealOn.chat.model.vo.ChatRoom;
import com.dealOn.common.Pagination;
import com.dealOn.common.model.vo.PageInfo;
import com.dealOn.inquiry.model.service.InquiryService;
import com.dealOn.inquiry.model.vo.InquiryDetailVO;
import com.dealOn.inquiry.model.vo.InquiryVO;
import com.dealOn.product.model.service.ProductService;
import com.dealOn.product.model.vo.ProductVO;
import com.dealOn.user.model.vo.User;

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
	private final PasswordEncoder passwordEncoder;
	private final InquiryService iService;

	@ModelAttribute("stats")
	public AdminStats globalAdminStats() {
		return adminService.getAdminStats();
	}

	
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

	@GetMapping("/user/search")
	@ResponseBody
	public Map<String, Object> searchUsers(
			@RequestParam(value = "keyword", required = false, defaultValue = "") String keyword,
			@RequestParam(value = "page", defaultValue = "1") int currentPage) {

		int listCount;
		List<UserList> userList;
		int boardLimit = 10; // 페이지당 10명

		// 검색어 유무에 따른 분기
		if (keyword == null || keyword.trim().isEmpty()) {
			listCount = adminService.selectUserListCount();
			PageInfo pi = Pagination.getPageInfo(currentPage, listCount, boardLimit);
			userList = adminService.selectUserList(pi);

			Map<String, Object> result = new HashMap<>();
			result.put("userList", userList);
			result.put("pi", pi);
			return result;
		}

		// 검색 로직
		listCount = adminService.getSearchUserCount(keyword);
		PageInfo pi = Pagination.getPageInfo(currentPage, listCount, boardLimit);
		userList = adminService.searchUsers(keyword, pi);

		Map<String, Object> result = new HashMap<>();
		result.put("userList", userList);
		result.put("pi", pi);
		return result;
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


	@PostMapping("/user/toggleStatus")
	@ResponseBody
	public ResponseEntity<String> toggleUserStatus(@RequestBody Map<String, Object> req) {
		int userNo = Integer.parseInt(req.get("userNo").toString());
		String newStatus = req.get("newStatus").toString(); // 'Y' or 'N'

		int result = adminService.updateUserStatus(userNo, newStatus);

		if(result > 0) {
			return ResponseEntity.ok("success");
		} else {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("fail");
		}
	}

	@PostMapping("/user/update")
	@ResponseBody
	public ResponseEntity<String> updateUser(@RequestBody UserDetail userDetail) {
		// 비밀번호가 입력되었다면 암호화 처리
		if (userDetail.getPwd() != null && !userDetail.getPwd().trim().isEmpty()) {
			String encodedPwd = passwordEncoder.encode(userDetail.getPwd());
			userDetail.setPwd(encodedPwd);
		} else {
			// 비밀번호를 변경하지 않는 경우 null 처리하여 Mapper에서 제외
			userDetail.setPwd(null);
		}

		int result = adminService.updateUser(userDetail);

		if (result > 0) {
			return ResponseEntity.ok("success");
		} else {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("fail");
		}
	}
	
	@GetMapping("/inquiry")
	public String inquiryList(Model model, HttpServletRequest request, @RequestParam(value = "page", defaultValue="1") int currentPage) {
		int listCount = iService.getAllInquiryCount();
		int boardLimit = 8;
		
		PageInfo pi = Pagination.getPageInfo(currentPage, listCount, boardLimit);
		
		List<InquiryVO> inquirys = iService.getAllInquiryList(pi);
		System.out.println("inquiryList: " + inquirys);
		System.out.println(inquirys);
		for(InquiryVO inquiry : inquirys) {
			switch(inquiry.getCategory()) {
				case "account":
		    		inquiry.setCategory("계정문의");
		    	break;
		    	case "system":
		    		inquiry.setCategory("시스템 문의");
	    		break;
		    	case "etc":
		    		inquiry.setCategory("기타");
		    	break;
			}
		}
		model.addAttribute("inquiryList", inquirys).addAttribute("requestURI", request.getRequestURL()).addAttribute("pi", pi);
		return "admin/inquiryList";
	}
	@GetMapping("/helpPage/{id}")
	public String helpDetail(@PathVariable("id") int inquiryId, Model model) {
		InquiryVO inquiry = iService.getInquiry(inquiryId);
		List<InquiryDetailVO> list = iService.getInquiryDetail(inquiryId);
		model.addAttribute("inquiryDetails", list).addAttribute("inquiry", inquiry);
		return "admin/helpPage";
	}
	
	@GetMapping("/finishedInquiry")
	@ResponseBody
	public ResponseEntity<?> finishedInquiryList(
	        @RequestParam(value="page", defaultValue="1") int currentPage){

	    int listCount = iService.getFinishedInquiryCount();
	    int boardLimit = 8;

	    PageInfo pi = Pagination.getPageInfo(currentPage, listCount, boardLimit);
	    List<InquiryVO> list = iService.getFinishedInquiry(pi);

	    for(InquiryVO inquiry : list) {
			switch(inquiry.getCategory()) {
				case "account":
		    		inquiry.setCategory("계정문의");
		    	break;
		    	case "system":
		    		inquiry.setCategory("시스템 문의");
	    		break;
		    	case "etc":
		    		inquiry.setCategory("기타");
		    	break;
			}
		}
	    Map<String, Object> result = new HashMap<>();
	    result.put("list", list);
	    result.put("pi", pi);

	    return ResponseEntity.ok(result);
	}
	
	@GetMapping("/inquiryList")
	@ResponseBody
	public ResponseEntity<?> inquiringList(
	        @RequestParam(value="page", defaultValue="1") int currentPage){

	    int listCount = iService.getAllInquiryCount();
	    int boardLimit = 8;

	    PageInfo pi = Pagination.getPageInfo(currentPage, listCount, boardLimit);
	    List<InquiryVO> list = iService.getAllInquiryList(pi);
	    for(InquiryVO inquiry : list) {
			switch(inquiry.getCategory()) {
				case "account":
		    		inquiry.setCategory("계정문의");
		    	break;
		    	case "system":
		    		inquiry.setCategory("시스템 문의");
	    		break;
		    	case "etc":
		    		inquiry.setCategory("기타");
		    	break;
			}
		}
	    Map<String, Object> result = new HashMap<>();
	    result.put("list", list);
	    result.put("pi", pi);

	    return ResponseEntity.ok(result);
	}

	@GetMapping("/api/dashboard/charts")
	@ResponseBody
	public Map<String, Object> getDashboardChartData(
			@RequestParam(value = "type", defaultValue = "weekly") String type,
			@RequestParam(value = "year", required = false) String year,
			@RequestParam(value = "month", required = false) String month) {

		Map<String, Object> response = new HashMap<>();

		// 카테고리 및 상태 데이터
		response.put("categoryData", adminService.getCategoryChartData());
		response.put("stateData", adminService.getStateChartData());

		// 방문자 데이터 범위 (최초 접속 기록 ~ 현재)
		Map<String, String> dateRange = adminService.getVisitorDateRange();
		response.put("dateRange", dateRange);

		// 초기 로드 시 파라미터가 없으면 현재 날짜 기준으로 세팅
		if (year == null || year.isEmpty()) {
			year = dateRange.get("MAX_DATE").split("-")[0];
			month = dateRange.get("MAX_DATE").split("-")[1];
		}

		// 방문자 차트 데이터
		response.put("visitorData", adminService.getVisitorChartData(type, year, month));

		return response;
	}
}
