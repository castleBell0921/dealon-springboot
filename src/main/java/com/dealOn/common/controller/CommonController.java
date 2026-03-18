package com.dealOn.common.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.dealOn.common.model.service.CommonService;
import com.dealOn.common.model.vo.ReviewVO;
import com.dealOn.user.model.vo.User;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
@RequestMapping("common")
public class CommonController {
    private final CommonService cService;

    private User getLoginUser(HttpSession session) {
        return (User) session.getAttribute("loginUser");
    }

    @PostMapping("/recent-search")
    public ResponseEntity<Void> recentSearch(@RequestBody Map<String, String> data, HttpSession session) {
        User loginUser = getLoginUser(session);
        String keyword = data.get("keyword");

        if (loginUser == null) {
            return ResponseEntity.status(401).build();
        }
        if (keyword == null || keyword.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        HashMap<String, Object> map = new HashMap<>();
        map.put("keyword", keyword);
        map.put("userNo", loginUser.getUserNo());
        cService.recentSearchSave(map);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/recent-search")
    public ResponseEntity<List<Map<String, Object>>> getRecentSearch(HttpSession session) {
        User loginUser = getLoginUser(session);
        if (loginUser == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(cService.getRecentSearch(loginUser.getUserNo()));
    }

    @GetMapping("/recent-search/{userNo}")
    public ResponseEntity<List<Map<String, Object>>> getRecentSearch(@PathVariable("userNo") String userNo, HttpSession session) {
        User loginUser = getLoginUser(session);
        if (loginUser == null || !loginUser.getUserNo().equals(userNo)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(cService.getRecentSearch(userNo));
    }

    @PostMapping("/recent-view")
    public ResponseEntity<Void> recentView(@RequestBody Map<String, String> data, HttpSession session) {
        User loginUser = getLoginUser(session);
        if (loginUser == null) {
            return ResponseEntity.status(401).build();
        }

        HashMap<String, Object> map = new HashMap<>();
        map.put("productNo", data.get("productNo"));
        map.put("productName", data.get("productName"));
        map.put("productImage", data.get("productImage"));
        map.put("userNo", loginUser.getUserNo());

        cService.recentViewSave(map);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/recent-view")
    public ResponseEntity<List<Map<String, Object>>> getRecentView(HttpSession session) {
        User loginUser = getLoginUser(session);
        if (loginUser == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(cService.getRecentView(loginUser.getUserNo()));
    }

    @GetMapping("/recent-view/{userNo}")
    public ResponseEntity<List<Map<String, Object>>> getRecentView(@PathVariable("userNo") String userNo, HttpSession session) {
        User loginUser = getLoginUser(session);
        if (loginUser == null || !loginUser.getUserNo().equals(userNo)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(cService.getRecentView(userNo));
    }

    @GetMapping("/location")
    public ResponseEntity<Map<String, String>> getLocation(@RequestParam("lat") double lat,
                                                           @RequestParam("lng") double lng) {
        String region = cService.getRegionFromCoordinates(lat, lng);

        Map<String, String> response = new HashMap<>();
        response.put("region", region);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/myReviewState")
    @ResponseBody
    public List<ReviewVO> myReviewState(HttpSession session) {
        User loginUser = getLoginUser(session);
        if (loginUser == null) {
            return List.of();
        }
        return cService.myReviewState(loginUser.getUserNo());
    }
}
