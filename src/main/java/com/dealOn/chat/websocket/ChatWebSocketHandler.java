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
    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())   // LocalDateTime 지원
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    // 채팅방별 연결된 세션 리스트
    private final Map<String, List<WebSocketSession>> chatRooms = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String chatNo = getChatNoFromURI(session);
        chatRooms.putIfAbsent(chatNo, new CopyOnWriteArrayList<>());
        chatRooms.get(chatNo).add(session);
        log.info("✅ 연결된 세션: {}, 채팅방: {}", session.getId(), chatNo);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
        ChatMessage chatMessage = objectMapper.readValue(message.getPayload(), ChatMessage.class);

        // MongoDB 저장
        chatService.saveMessage(chatMessage.getChatNo(), chatMessage.getSenderNo(), chatMessage.getMessage());
        log.info("💾 Saved message: {}", chatMessage);

        // 해당 채팅방 세션 가져오기
        List<WebSocketSession> sessions = chatRooms.get(chatMessage.getChatNo());
        if (sessions != null) {
            for (WebSocketSession s : sessions) {
                if (s.isOpen()) {
                    s.sendMessage(new TextMessage(message.getPayload()));
                }
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        chatRooms.values().forEach(list -> list.remove(session));
        log.info("❌ 세션 종료: {}", session.getId());
    }

    private String getChatNoFromURI(WebSocketSession session) {
        String query = session.getUri().getQuery(); // 예: "chatNo=123"
        if (query != null && query.startsWith("chatNo=")) {
            return query.substring(7);
        }
        return "unknown";
    }
}
