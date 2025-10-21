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
import com.dealOn.chat.model.vo.ChatMessage;
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
		User loginUser = (User) session.getAttribute("loginUser");
		if (loginUser == null) {
			return "redirect:/";
		}

		List<ChatRoom> chatList = chatService.findChatRoomsByUser(loginUser.getUserNo());
		List<String> chatNos = chatList.stream().map(ChatRoom::getChatNo).toList();
		List<ChatMessage> lastMessage = chatService.getLastMessages(chatNos);

		// 채팅방별 마지막 메시지 Map 생성
	    Map<String, ChatMessage> lastChat = new HashMap<>();
	    for (ChatMessage msg : lastMessage) {
	        lastChat.put(msg.getChatNo(), msg);
	    }
		
		
		model.addAttribute("chatList", chatList);
		model.addAttribute("lastChat", lastChat);

		return "/chat";
	}

	/**
	 * 구매자가 채팅방을 생성하거나 기존 채팅방을 찾아 이동합니다. * @param productNo 상품 번호
	 * 
	 * @param session HTTP 세션 (로그인 사용자 정보 획득용)
	 * @return 채팅방 ID(String)를 포함하는 Map
	 */
	@PostMapping("/createRoom")
	@ResponseBody
	public Map<String, Object> createChatRoom(@RequestParam("productNo") String productNo, HttpSession session) {

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
			List<ChatRoom> chatRooms = chatService.findChatRoom(buyerNo, sellerNo, productNo, loginUser.getUserNo());
			System.out.println("chatRoomInfo: " + chatRooms);
			System.out.println("chatRoomNo" + productNo);
			ChatRoom matchedChatRoom = null;
			for (ChatRoom chatRoom : chatRooms) {
			    if (chatRoom.getProductNo().equals(productNo)) { // productNo 비교
			        matchedChatRoom = chatRoom;
			        break; // 첫 번째 매칭 요소만 필요하면 break
			    }
			}
			if (matchedChatRoom != null) {
				// 3. 채팅방 ID (String 타입) 반환
				result.put("chatRoomId", matchedChatRoom.getChatNo());
				session.setAttribute("chatInfo", matchedChatRoom);
				
				
			} else {
				ChatRoom newChatRoom = chatService.createChatRoom(buyerNo, sellerNo, productNo);
				if (newChatRoom != null) {
					result.put("chatRoomId", newChatRoom.getChatNo());
					session.setAttribute("chatInfo", newChatRoom);
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
	public String  chatRoomDetail  (@PathVariable("chatNo") String chatNo, Model model, HttpSession session) {

		User loginUser = (User) session.getAttribute("loginUser");
		if (loginUser == null) {
			return "redirect:/";
		}

		List<ChatRoom> chatList = chatService.findChatRoomsByUser(loginUser.getUserNo());
		List<String> chatNos = chatList.stream().map(ChatRoom::getChatNo).toList();
		ChatRoom currentChat = chatService.findByChatNo(chatNo);

		if (currentChat == null) {
			return "error/404"; // 없는 채팅방일 경우
		} else {
			// System.out.println(chatService.getMessages(chatNo));
			List<ChatMessage> message = chatService.getMessages(chatNo);
			List<ChatMessage> lastMessage = chatService.getLastMessages(chatNos);
			ChatRoom chatInfo = (ChatRoom) session.getAttribute("chatInfo");
			if(chatInfo == null) {
			    chatInfo = chatService.findByChatNo(chatNo);
			    session.setAttribute("chatInfo", chatInfo);

			}
			Map<String, ChatMessage> lastChat = new HashMap<>();
		    for (ChatMessage msg : lastMessage) {
		        lastChat.put(msg.getChatNo(), msg);
		    }
		    
			model.addAttribute("currentChat", currentChat);
			model.addAttribute("chatList", chatList);
			model.addAttribute("message", message);
			model.addAttribute("loginUser", loginUser);
	        model.addAttribute("chatInfo", chatInfo);
	        model.addAttribute("lastChat", lastChat);
	        System.out.println("lastChat: " + lastChat);
	        System.out.println("url in chatInfo" + chatInfo);
			return "/chat"; // templates/chat/chat.html
		}
	}
	
	@GetMapping("/detail/{chatNo}")
	@ResponseBody
	public Map<String, Object> getChatRoomDetail(@PathVariable("chatNo") String chatNo, HttpSession session) {
	    Map<String, Object> result = new HashMap<>();
	    
	    User loginUser = (User)session.getAttribute("loginUser");
	    ChatRoom chatRoom = chatService.findByChatNo(chatNo);
	    ChatRoom chatInfo = chatService.findByChatInfo(chatNo, loginUser.getUserNo());
	    List<ChatMessage> messages = chatService.getMessages(chatNo);
	    result.put("chatInfo", chatInfo);
	    result.put("messages", messages);
	    result.put("loginUser", loginUser);
	    System.out.println("chatNo: " + chatNo);
	    System.out.println("chatRoom: " + chatRoom);
	    System.out.println("chatInfo: " + chatInfo);
	    System.out.println("messages: " + messages);
	    
	    
	    return result;
	}

}
