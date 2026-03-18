package com.dealOn.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.dealOn.admin.controller.AdminInterceptor;
import com.dealOn.common.interceptor.LoginRequiredInterceptor;
import com.dealOn.common.interceptor.VisitorLogInterceptor;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    private final VisitorLogInterceptor visitorLogInterceptor;
    private final LoginRequiredInterceptor loginRequiredInterceptor;
    private final AdminInterceptor adminInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(visitorLogInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns("/css/**", "/js/**", "/image/**", "/error");
        
        registry.addInterceptor(loginRequiredInterceptor)
                .addPathPatterns(
                        "/user/myProduct",
                        "/user/editProfile",
                        "/user/update",
                        "/user/mySellList",
                        "/user/myBuyList",
                        "/user/myWishList",
                        "/chat/**",
                        "/help/contact",
                        "/help/helpList",
                        "/help/addInquiry",
                        "/help/resolve",
                        "/product/form",
                        "/product/addNormal",
                        "/product/updateForm/**",
                        "/product/updateNormal",
                        "/product/delete/**",
                        "/product/updateStatus",
                        "/product/reviewCreate",
                        "/product/getReview",
                        "/product/upProduct",
                        "/common/recent-search",
                        "/common/recent-view"
                );

        registry.addInterceptor(adminInterceptor)
                .addPathPatterns("/admin/**");
    }
}
