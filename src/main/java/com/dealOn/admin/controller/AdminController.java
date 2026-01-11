package com.dealOn.admin.controller;

import java.util.List;

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
import com.dealOn.product.model.service.ProductService;
import com.dealOn.product.model.vo.ProductVO;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
@RequestMapping("/admin")
public class AdminController {
	private final ProductService productService;
	private final AdminService adminService;
	
	@GetMapping("main")
	public String admAcc(HttpServletRequest request, Model model) {
		model.addAttribute("requestURI",request.getRequestURI());
		return "admin/dashboard";
	}
	
	@GetMapping("userMng")
	public String joinUsrMng(HttpServletRequest request, Model model) {
		model.addAttribute("requestURI",request.getRequestURI());
		return "admin/userMng";
	}
	
	@GetMapping("productMng")
	public String joinProductMng(HttpServletRequest request, Model model) {
		List<ProductVO> productList = adminService.getAllProduct();
		System.out.println("productList: " + productList);
		model.addAttribute("requestURI",request.getRequestURI());
		model.addAttribute("productList", productList);
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
	
	@GetMapping("/product/search")
	@ResponseBody
	public List<ProductVO> searchProducts(@RequestParam("keyword") String keyword) {
	    return adminService.searchProducts(keyword);
	}

}
