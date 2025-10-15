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

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ChatWebSocketHandler extends TextWebSocketHandler {

    private final ChatService chatService;
    private final Map<String, List<WebSocketSession>> chatRooms = new ConcurrentHashMap<>(); // 동시 접근 가능

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
        String payload = message.getPayload();
        ChatMessage chatMessage = new com.fasterxml.jackson.databind.ObjectMapper()
                .readValue(payload, ChatMessage.class);

        chatService.saveMessage(chatMessage.getChatNo(), chatMessage.getSenderNo(), chatMessage.getMessage());

        // 채팅방 세션 가져오기 또는 새로 생성 (CopyOnWriteArrayList 사용)
        chatRooms.putIfAbsent(chatMessage.getChatNo(), new CopyOnWriteArrayList<>());
        List<WebSocketSession> sessions = chatRooms.get(chatMessage.getChatNo());

        // 세션에 없으면 추가
        if (!sessions.contains(session)) {
            sessions.add(session);
        }

        // 모든 세션에 메시지 전송
        for (WebSocketSession s : sessions) {
            if (s.isOpen()) {
                s.sendMessage(new TextMessage(payload));
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        chatRooms.values().forEach(list -> list.remove(session));
    }
}
