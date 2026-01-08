package com.dealOn.admin.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
@RequestMapping("/admin")
public class AdminController {
	
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
		model.addAttribute("requestURI",request.getRequestURI());
		return "admin/productMng";
	}

	@GetMapping("decMng")
	   public String decMng(HttpServletRequest request, Model model) {
		model.addAttribute("requestURI",request.getRequestURI());
	    return "admin/decMng";
	}
}
