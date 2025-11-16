package com.dealOn.chat.websocket;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.dealOn.chat.model.service.ChatService;
import com.dealOn.chat.model.vo.ChatMessage;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class ChatWebSocketHandler extends TextWebSocketHandler {

	private final ChatService chatService;
	private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule()) // LocalDateTime
																										// 지원
			.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

	// 채팅방별 연결된 세션 리스트
	private final Map<String, List<WebSocketSession>> chatRooms = new ConcurrentHashMap<>();

	@Override
	public void afterConnectionEstablished(WebSocketSession session) throws Exception {
	    String chatNo = getChatNoFromURI(session);
	    String userNo = getUserNoFromURI(session); // 쿼리나 세션에서 로그인 유저 번호 가져오기
	    session.getAttributes().put("userNo", userNo);
	    // 그냥 List는 멀티쓰레드 환경에서 안전X => 동시에 add 했을때 데이터 손실 가능성O
	    // 쓰기 시 배열을 복사해서 처리 → 다른 스레드에서 읽고 있어도 안전
	    chatRooms.putIfAbsent(chatNo, new CopyOnWriteArrayList<>());
	    // chatNo가 key값인 map 있으면 아무일도 안 일어나고, 없을떄 실행해주는거 
	    chatRooms.get(chatNo).add(session);
	    log.info("✅ 연결된 세션: {}, 채팅방: {}, 유저: {}", session.getId(), chatNo, userNo);
	}
	
	// 세션에서 유저 번호 가져오기
	private String getUserNoFromSession(WebSocketSession session) {
	    Object userNo = session.getAttributes().get("userNo");
	    return userNo != null ? userNo.toString() : "unknown";
	}
	
	private String getUserNoFromURI(WebSocketSession session) {
	    String query = session.getUri().getQuery(); // "chatNo=61&userNo=123"
	    if (query != null) {
	        for (String param : query.split("&")) {
	            String[] kv = param.split("=");
	            if (kv.length == 2 && kv[0].equals("userNo")) return kv[1];
	        }
	    }
	    return "unknown";
	}


	@Override
	protected void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
	    ChatMessage chatMessage = objectMapper.readValue(message.getPayload(), ChatMessage.class);

	    // DB 저장
	    chatService.saveMessage(chatMessage.getChatNo(), chatMessage.getSenderNo(), chatMessage.getMessage());
	    log.info("💾 Saved message: {}", chatMessage);
	    

	    // 해당 채팅방 세션 가져오기
	    List<WebSocketSession> sessions = chatRooms.get(chatMessage.getChatNo());
	    
	    if (sessions == null || sessions.isEmpty()) {
	        log.info("⚠️ 현재 채팅방({})에 아무도 접속 중이 아님. 실시간 전송 생략", chatMessage.getChatNo());
	        return;
	    }

	    // 3️⃣ 상대방이 없는 경우 (본인만 연결된 경우)
	    if (sessions.size() == 1 && sessions.contains(session)) {
	        log.info("⚠️ 상대방이 채팅방에 접속 중이 아님. 메시지는 DB에만 저장됨.");
	        return;
	    }

	    // 4️⃣ 둘 다 접속 중인 경우에만 실시간 전송
	    for (WebSocketSession s : sessions) {
	        if (s.isOpen()) {
	            s.sendMessage(new TextMessage(message.getPayload()));
	        }
	    }
	}


	@Override
	public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
		chatRooms.values().forEach(list -> list.remove(session));
		log.info("❌ 세션 종료: {}", session.getId());
	}

	private String getChatNoFromURI(WebSocketSession session) {
	    String query = session.getUri().getQuery(); // 예: "chatNo=63&userNo=84"
	    if (query != null) {
	        for (String param : query.split("&")) {
	            String[] kv = param.split("=");
	            if (kv.length == 2 && kv[0].equals("chatNo")) return kv[1];
	        }
	    }
	    return "unknown";
	}
}
