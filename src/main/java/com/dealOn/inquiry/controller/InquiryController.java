package com.dealOn.inquiry.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.dealOn.common.Pagination;
import com.dealOn.common.model.vo.PageInfo;
import com.dealOn.inquiry.model.service.InquiryService;
import com.dealOn.inquiry.model.vo.InquiryDetailVO;
import com.dealOn.inquiry.model.vo.InquiryVO;
import com.dealOn.user.model.vo.User;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
@RequestMapping("/help")
public class InquiryController {
	
	private final InquiryService iService;
	
	@GetMapping("/contact")
	public String helpPage(HttpSession session,RedirectAttributes ra) {
		if(session.getAttribute("loginUser") == null) {
			ra.addFlashAttribute("Msg", "로그인 후 이용 가능한 기능입니다.");
			return "redirect:/";
		}else {
			return "/help/firstHelp";
		}	
	}
	@GetMapping("/helpPage")
	public String list() {
		return "/help/helpPage";
	}
	
	@PostMapping("/insertInquiry")
	public String insertInquiery(@ModelAttribute InquiryVO inquiryVO, 
					@ModelAttribute InquiryDetailVO inquiryDetailVO,
					 @RequestParam("upfile") MultipartFile upfile,
					 HttpSession session
					 ) {
		
//		System.out.println("upFileURL: " + upfile.getOriginalFilename());
//		System.out.println("content : " + inquiryDetailVO.getContent());
//		System.out.println("categpry : " + inquiryVO.getCategory());
//		System.out.println("title : " + inquiryVO.getTitle());
		
		int insertResult = iService.insertInquiry(inquiryVO, inquiryDetailVO, upfile);
		
		if(insertResult > 0) {
			return "redirect:/help/helpPage/" + insertResult;
		}
		
		return "redirect:/";
	}
	@GetMapping("/helpPage/{id}")
	public String helpDetail(@PathVariable("id") int inquiryId, Model model) {
		System.out.println("inquiryId: " + inquiryId);
		List<InquiryDetailVO> inquiryDetails = iService.getInquiryDetail(inquiryId);
		InquiryVO inquiry = iService.getInquiry(inquiryId);
		
		System.out.println("조회된 상세 목록 수: " + (inquiryDetails != null ? inquiryDetails.size() : "null"));
		System.out.println(inquiryDetails);
		if(inquiryDetails != null) {
			model.addAttribute("inquiryDetails", inquiryDetails);
			model.addAttribute("inquiry", inquiry);
			return "/helpPage";
		}
		return "/";
	}
	
	@GetMapping("/helpList")
	public String helpList(HttpSession session, Model model, 
			HttpServletRequest request,
			@RequestParam(value = "page", defaultValue="1") int currentPage) {
		
		String userNo = ((User)session.getAttribute("loginUser")).getUserNo();
		
		int listCount = iService.getInquiryCount(userNo);
		int boardLimit = 5;
		Map<String, Object> map = new HashMap<String, Object>();
		PageInfo pi = Pagination.getPageInfo(currentPage, listCount, boardLimit);
		
		map.put("userNo", userNo);
		map.put("pi", pi);
		List<InquiryVO> inquiryList = iService.getAllInquiry(map);
		for(InquiryVO inquiry : inquiryList) {
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
		model.addAttribute("inquiryList", inquiryList).addAttribute("requestURI", request.getRequestURI()).addAttribute("pi",pi);
		
		return "/helpList";
	}
}
