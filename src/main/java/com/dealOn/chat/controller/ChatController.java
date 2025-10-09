package com.dealOn.chat.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.dealOn.chat.model.service.ChatService;
import com.dealOn.chat.model.vo.ChatRoom;
import com.dealOn.user.model.vo.User;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller
@RequiredArgsConstructor
@RequestMapping("/chat")
public class ChatController {
	
	private final ChatService chatService;
	
	@GetMapping("/chatRoom")
	public String chatIn(HttpSession session, Model model) {
		User loginUser = (User)session.getAttribute("loginUser");
		if(loginUser == null) {
			return "redirect:/";
		}
		
		List<ChatRoom> chatList = chatService.findChatRoomsByUser(loginUser.getUserNo());
		model.addAttribute("chatList", chatList);
		
		return "/chat";
	}
	
	/**
	 * 구매자가 채팅방을 생성하거나 기존 채팅방을 찾아 이동합니다.
	 * * @param productNo 상품 번호
	 * @param session HTTP 세션 (로그인 사용자 정보 획득용)
	 * @return 채팅방 ID(String)를 포함하는 Map
	 */
	@PostMapping("/createRoom")
	@ResponseBody
	public Map<String, Object> createChatRoom(
	        @RequestParam("productNo") String productNo,
	        HttpSession session) {

	    User loginUser = (User) session.getAttribute("loginUser");
	    Map<String, Object> result = new HashMap<>();

	    if (loginUser == null) {
	    	result.put("chatRoomId", null);
	    	result.put("message", "로그인 후 이용 가능합니다.");
	    	return result;
	    }
	    
	    try {
		    String buyerNo = loginUser.getUserNo(); // 구매자 ID (UserNo가 String이라고 가정)
		    
		    // 1. 상품 번호를 통해 판매자 ID를 조회 (Seller ID도 채팅방 생성에 필요)
		    String sellerNo = chatService.findSellerId(productNo);
		    
		    if (sellerNo == null) {
		    	result.put("chatRoomId", null);
		    	result.put("message", "판매자 정보를 찾을 수 없습니다.");
		    	return result;
		    }
	
		    // 2. 채팅방 생성/조회 (NoSQL 기반)
		    ChatRoom chatRoom = chatService.findChatRoom(buyerNo, sellerNo, productNo);
		    
		    if(chatRoom != null) {
		    // 3. 채팅방 ID (String 타입) 반환
		    	result.put("chatRoomId", chatRoom.getChatNo());
		    } else {
		    	ChatRoom newChatRoom = chatService.createChatRoom(buyerNo, sellerNo, productNo);
		    	if(newChatRoom != null) {
		    		result.put("chatRoomId", newChatRoom.getChatNo());
		    	} else {
		    		result.put("chatRoomId", null);
			    	result.put("message", "서버 오류로 채팅방 생성에 실패했습니다.");
		    	}
		    }
		    
	    } catch (Exception e) {
	    	log.error("채팅방 생성 중 오류 발생. ProductNo: {}", productNo, e);
	    	result.put("chatRoomId", null);
	    	result.put("message", "서버 오류로 채팅방 생성에 실패했습니다.");
	    }
	    
	    return result;
	}
	
	@GetMapping("/chatRoom/{chatNo}")
	public String chatRoomDetail(@PathVariable("chatNo") String chatNo, Model model, HttpSession session) {
		
	    User loginUser = (User) session.getAttribute("loginUser");
	    if (loginUser == null) {
	        return "redirect:/";
	    }
	    
	    
	    List<ChatRoom> chatList = chatService.findChatRoomsByUser(loginUser.getUserNo());
	    ChatRoom currentChat  = chatService.findByChatNo(chatNo);
	    
	    if (currentChat  == null) {
	        return "error/404"; // 없는 채팅방일 경우
	    }

	    // thymeleaf로 넘겨서 상품/유저 정보 렌더링
	    model.addAttribute("currentChat", currentChat );
	    model.addAttribute("chatList", chatList);
	    return "chat/chat"; // templates/chat/chat.html
	}

	
}
