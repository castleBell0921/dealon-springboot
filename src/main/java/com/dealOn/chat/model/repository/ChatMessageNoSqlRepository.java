package com.dealOn.chat.model.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository; // MongoDB 사용 예시

import com.dealOn.chat.model.vo.ChatMessage;

// ChatMessage 객체를 관리하고, ID 타입이 String이라고 가정
public interface ChatMessageNoSqlRepository extends MongoRepository<ChatMessage, String> {
 
    
    // 💡 채팅방 나가기 로직에서 사용되는 메소드
    void deleteAllByChatNo(String chatNo); 
    
    List<ChatMessage> findByChatNoOrderByTimestampAsc(String chatNo);
    
}