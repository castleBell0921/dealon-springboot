package com.dealOn.common.interceptor;

import com.dealOn.common.model.mapper.CommonMapper;
import com.dealOn.user.model.vo.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@Component
public class VisitorLogInterceptor implements HandlerInterceptor {

    @Autowired
    private CommonMapper commonMapper;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {

        HttpSession session = request.getSession();
        String sessionId = session.getId();

        String requestURI = request.getRequestURI();
        // 정적 리소스 요청은 기록하지 않음
        if (requestURI.startsWith("/css/") || requestURI.startsWith("/js/") || requestURI.startsWith("/image/")) {
            return true;
        }

        Integer userNo = null;
        // 프로젝트의 세션 로그인 키값("loginUser")에 맞게 가져옴
        Object loginUser = session.getAttribute("loginUser");
        if(loginUser != null) {
            userNo = Integer.valueOf(((User)loginUser).getUserNo());
        }

        try {
            commonMapper.mergeVisitorLog(sessionId, userNo);
        } catch (Exception e) {
            e.printStackTrace();
        }

        return true;
    }
}