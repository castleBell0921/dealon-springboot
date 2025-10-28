package com.dealOn.chat.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.dealOn.chat.model.mapper.ChatMapper;
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
	private final ChatMapper chatMapper;

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
				// 내 상태가 N이면 다시 Y로 변경
				if (loginUser.getUserNo().equals(matchedChatRoom.getBuyerNo())
						&& "N".equals(matchedChatRoom.getBuyerStatus())) {
					chatMapper.updateStatus(matchedChatRoom.getChatNo(), "buyer");
				} else if (loginUser.getUserNo().equals(matchedChatRoom.getSellerNo())
						&& "N".equals(matchedChatRoom.getSellerStatus())) {
					chatMapper.updateStatus(matchedChatRoom.getChatNo(), "seller");
				}
				result.put("chatRoomId", matchedChatRoom.getChatNo());
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
	public String chatRoomDetail(@PathVariable("chatNo") String chatNo, Model model, HttpSession session) {

	    User loginUser = (User) session.getAttribute("loginUser");
	    if (loginUser == null) {
	        return "redirect:/";
	    }

	    List<ChatRoom> chatList = chatService.findChatRoomsByUser(loginUser.getUserNo());
	    List<String> chatNos = chatList.stream().map(ChatRoom::getChatNo).toList();

	    // 1. 채팅방 존재 여부 확인 (상태 무시)
	    ChatRoom currentChat = chatService.findByChatNoIgnoreStatus(chatNo);
	    if (currentChat == null) {
	        return "error/404"; // 채팅방 자체가 없는 경우
	    }

	    // 2. 나갔던 사용자의 상태 Y로 복구
	    if (loginUser.getUserNo().equals(currentChat.getBuyerNo()) && "N".equals(currentChat.getBuyerStatus())) {
	        chatMapper.updateStatus(currentChat.getChatNo(), "buyer");
	    } else if (loginUser.getUserNo().equals(currentChat.getSellerNo()) && "N".equals(currentChat.getSellerStatus())) {
	        chatMapper.updateStatus(currentChat.getChatNo(), "seller");
	    }

	    // 3. 상태 반영 후 currentChat 다시 조회
	    currentChat = chatService.findByChatNo(chatNo, loginUser.getUserNo());

	    // 4. 메시지 조회
	    List<ChatMessage> message = chatService.getMessages(chatNo);
	    List<ChatMessage> lastMessage = chatService.getLastMessages(chatNos);

	    // 5. 세션 chatInfo 처리
	    ChatRoom chatInfo = (ChatRoom) session.getAttribute("chatInfo");
	    if (chatInfo == null) {
	        chatInfo = currentChat;
	        session.setAttribute("chatInfo", chatInfo);
	    }

	    // 6. 채팅방별 마지막 메시지 Map 생성
	    Map<String, ChatMessage> lastChat = new HashMap<>();
	    for (ChatMessage msg : lastMessage) {
	        lastChat.put(msg.getChatNo(), msg);
	    }

	    // 7. 모델에 데이터 추가
	    model.addAttribute("currentChat", currentChat);
	    model.addAttribute("chatList", chatList);
	    model.addAttribute("message", message);
	    model.addAttribute("loginUser", loginUser);
	    model.addAttribute("chatInfo", chatInfo);
	    model.addAttribute("lastChat", lastChat);

	    return "/chat"; // templates/chat/chat.html
	}

	@GetMapping("/detail/{chatNo}")
	@ResponseBody
	public Map<String, Object> getChatRoomDetail(@PathVariable("chatNo") String chatNo, HttpSession session) {
		Map<String, Object> result = new HashMap<>();

		User loginUser = (User) session.getAttribute("loginUser");
		ChatRoom chatRoom = chatService.findByChatNo(chatNo, loginUser.getUserNo());
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

	// HTTP POST 요청: /chat/leave/{chatNo}
	@PostMapping("/leave/{chatNo}")
	public ResponseEntity<Map<String, Object>> leaveChatRoom(@PathVariable("chatNo") String chatNo,
			HttpSession session) {
		String userNo = ((User) session.getAttribute("loginUser")).getUserNo();

		Map<String, Object> response = new HashMap<>();

		if (userNo == null) {
			response.put("success", false);
			response.put("message", "로그인 정보가 유효하지 않습니다.");
			return ResponseEntity.status(HttpStatus.SC_UNAUTHORIZED).body(response);
		}

		try {
			ChatRoom chatInfo = chatService.findByChatInfo(chatNo, userNo);
			String userOption;
			if (chatInfo.getBuyerNo().equals(userNo)) {
				userOption = "buyer";
			} else {
				userOption = "seller";
			}
			boolean success = chatService.leaveChatRoom(chatNo, userNo, userOption);

			response.put("success", success);
			if (success) {
				response.put("message", "채팅방에서 성공적으로 나갔습니다.");
			} else {
				response.put("message", "채팅방 나가기 처리 중 오류가 발생했습니다.");
			}
			return ResponseEntity.ok(response);

		} catch (Exception e) {
			log.error("채팅방 나가기 처리 중 예외 발생: chatNo={}, userNo={}", chatNo, userNo, e);
			response.put("success", false);
			response.put("message", "서버 오류가 발생했습니다.");
			return ResponseEntity.status(HttpStatus.SC_INTERNAL_SERVER_ERROR).body(response);
		}
	}
}
