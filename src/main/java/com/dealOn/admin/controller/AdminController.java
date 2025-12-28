package com.dealOn.admin.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
@RequestMapping("/admin")
public class AdminController {
	
	@GetMapping("main")
	public String admAcc() {
		return "admin/dashboard";
	}
	
	@GetMapping("userMng")
	public String joinUsrMng() {
		return "admin/userMng";
	}
	
	@GetMapping("productMng")
	public String joinProductMng() {
		return "admin/productMng";
	}

	@GetMapping("decUser")
	public String decUser() {
		return "admin/decUser";
	}

	@GetMapping("decProduct")
	public String decProduct() {
		return "admin/decProduct";
	}
}
