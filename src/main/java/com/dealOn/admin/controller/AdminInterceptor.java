package com.dealOn.admin.controller;

import org.springframework.web.servlet.HandlerInterceptor;

import com.dealOn.user.model.vo.User;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

public class AdminInterceptor implements HandlerInterceptor {
	
	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception{
		HttpSession session = request.getSession();
		User loginUser = (User) session.getAttribute("loginUser");
		
		if(loginUser == null || !loginUser.getUserNo().equals("0")){
			response.sendRedirect("/");
			return false;
		}
		
		return true;
	}
}
