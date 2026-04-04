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
import com.dealOn.user.model.vo.User;
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
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    private final Map<String, List<WebSocketSession>> chatRooms = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String chatNo = getChatNoFromURI(session);
        String userNo = getUserNoFromURI(session);
        User loginUser = (User) session.getAttributes().get("loginUser");

        if (loginUser == null || !loginUser.getUserNo().equals(userNo) || "unknown".equals(chatNo)) {
            session.close(CloseStatus.NOT_ACCEPTABLE.withReason("unauthorized"));
            return;
        }

        session.getAttributes().put("userNo", userNo);
        chatRooms.putIfAbsent(chatNo, new CopyOnWriteArrayList<>());
        chatRooms.get(chatNo).add(session);
        log.info("websocket connected: session={}, chatNo={}, userNo={}", session.getId(), chatNo, userNo);
    }

    private String getUserNoFromSession(WebSocketSession session) {
        Object userNo = session.getAttributes().get("userNo");
        return userNo != null ? userNo.toString() : "unknown";
    }

    private String getUserNoFromURI(WebSocketSession session) {
        String query = session.getUri().getQuery();
        if (query != null) {
            for (String param : query.split("&")) {
                String[] kv = param.split("=");
                if (kv.length == 2 && kv[0].equals("userNo")) {
                    return kv[1];
                }
            }
        }
        return "unknown";
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
        ChatMessage chatMessage = objectMapper.readValue(message.getPayload(), ChatMessage.class);
        String sessionUserNo = getUserNoFromSession(session);

        if (!sessionUserNo.equals(chatMessage.getSenderNo())) {
            try {
                session.close(CloseStatus.NOT_ACCEPTABLE.withReason("invalid_sender"));
            } catch (IOException ignored) {
            }
            return;
        }

        chatService.saveMessage(chatMessage.getChatNo(), chatMessage.getSenderNo(), chatMessage.getMessage());
        List<WebSocketSession> sessions = chatRooms.get(chatMessage.getChatNo());

        if (sessions == null || sessions.isEmpty()) {
            return;
        }

        if (sessions.size() == 1 && sessions.contains(session)) {
            return;
        }

        for (WebSocketSession s : sessions) {
            if (s.isOpen()) {
                s.sendMessage(new TextMessage(message.getPayload()));
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        chatRooms.values().forEach(list -> list.remove(session));
        log.info("websocket closed: session={}", session.getId());
    }

    private String getChatNoFromURI(WebSocketSession session) {
        String query = session.getUri().getQuery();
        if (query != null) {
            for (String param : query.split("&")) {
                String[] kv = param.split("=");
                if (kv.length == 2 && kv[0].equals("chatNo")) {
                    return kv[1];
                }
            }
        }
        return "unknown";
    }
}
