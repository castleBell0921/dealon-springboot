package com.dealOn.common.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import com.dealOn.common.model.service.CommonService;
import com.dealOn.user.model.vo.User;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
@RequestMapping("common")
public class CommonController {
	private final CommonService cService;

	@PostMapping("/recent-search")
	public ResponseEntity<Void> recentSearch(@RequestBody Map<String, String> data, HttpSession session) {
		HashMap<String, Object> map = new HashMap<String,Object>();
	    String keyword = data.get("keyword");
	    User loginUser = (User)session.getAttribute("loginUser");
	    map.put("keyword", keyword);
	    map.put("userNo", loginUser.getUserNo());
	    
	    System.out.println("최근 검색어: " + keyword);
	    cService.recentSearchSave(map);
	    return ResponseEntity.ok().build();
	}
	@GetMapping("/recent-search/{userNo}")
	public ResponseEntity<List<Map<String, Object>>> getRecentSearch(@PathVariable("userNo") String userNo) {
	    List<Map<String, Object>> recentList = cService.getRecentSearch(userNo);
	    System.out.print("최근 검색어: " + recentList);
	    return ResponseEntity.ok(recentList);
	}
	
	@PostMapping("/recent-view")
	public ResponseEntity<Void> recentView(@RequestBody Map<String, String> data, HttpSession session) {
		User loginUser = (User)session.getAttribute("loginUser");
		
		HashMap<String, Object> map = new HashMap<String, Object>();
		
		String productNo = data.get("productNo");
		String productName = data.get("productName");
		String productImage = data.get("productImage");
		
		map.put("productNo", productNo);
		map.put("productName", productName);
		map.put("productImage", productImage);
		map.put("userNo", loginUser.getUserNo());
		
		cService.recentViewSave(map);
		return ResponseEntity.ok().build();
	}
	@GetMapping("/recent-view/{userNo}")
	public ResponseEntity<List<Map<String, Object>>> getRecentView(@PathVariable("userNo") String userNo) {
	    List<Map<String, Object>> recentList = cService.getRecentView(userNo);
	    System.out.print("최근 검색어: " + recentList);
	    return ResponseEntity.ok(recentList);
	}
	

	@GetMapping("/location")
	public ResponseEntity<Map<String, String>> getLocation(@RequestParam("lat") double lat,
														   @RequestParam("lng") double lng) {
		String region = cService.getRegionFromCoordinates(lat, lng);

		Map<String, String> response = new HashMap<>();
		response.put("region", region);

		return ResponseEntity.ok(response);
	}
}
