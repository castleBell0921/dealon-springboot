package com.dealOn.chat.model.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import com.dealOn.chat.model.mapper.ChatMapper;
import com.dealOn.chat.model.vo.ChatMessage;
import com.dealOn.chat.model.vo.ChatRoom;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatService {
	private final ChatMapper chatMapper;
    private final MongoTemplate mongoTemplate;

	
	public String findSellerId(String productNo) {
		return chatMapper.findSellerId(productNo);
		
	}

	public ChatRoom findChatRoom(String buyerNo, String sellerNo, String productNo, String userNo) {
		HashMap<String, Object> data = new HashMap<String, Object>();
		data.put("buyerNo", buyerNo);
		data.put("sellerNo", sellerNo);
		data.put("productNo", productNo);
		data.put("userNo", userNo);
		return chatMapper.findChatRoom(data);
	}

	public ChatRoom createChatRoom(String buyerNo, String sellerNo, String productNo) {
		HashMap<String, Object> data = new HashMap<String, Object>();
		data.put("buyerNo", buyerNo);
		data.put("sellerNo", sellerNo);
		data.put("productNo", productNo);
		
		int result = chatMapper.createChatRoom(data);
		if(result > 0) {
			return chatMapper.findChatRoom(data);
		}
		return null;
	}
	
	public ChatRoom findByChatNo(String chatNo) {
		return chatMapper.findByChatNo(chatNo);
	}

	public List<ChatRoom> findChatRoomsByUser(String userNo) {
		return chatMapper.findChatRoomsByUser(userNo);
	}
	
	 public ChatMessage saveMessage(String chatNo, String senderNo, String message) {
	        ChatMessage chat = new ChatMessage();
	        chat.setChatNo(chatNo);
	        chat.setSenderNo(senderNo);
	        chat.setMessage(message);
	        chat.setTimestamp(LocalDateTime.now());

	        return mongoTemplate.save(chat, "CHAT"); // CHAT 컬렉션에 저장
	    }
	 
	 public List<ChatMessage> getMessages(String chatNo) {
	        Query query = new Query(Criteria.where("chatNo").is(chatNo));
	        return mongoTemplate.find(query, ChatMessage.class, "CHAT");
	    }

	public ChatRoom findByChatInfo(String chatNo, String userNo) {
		HashMap<String, Object> data = new HashMap<String, Object>();
		data.put("chatNo", chatNo);
		data.put("userNo", userNo);
		return chatMapper.findByChatInfo(data);
	}
	
	public List<ChatMessage> getLastMessages(List<String> chatNos) {
	    Aggregation agg = Aggregation.newAggregation(
	        Aggregation.match(Criteria.where("chatNo").in(chatNos)),
	        Aggregation.sort(Sort.Direction.DESC, "timestamp"),
	        Aggregation.group("chatNo").first(Aggregation.ROOT).as("lastMessage")
	    );

	    AggregationResults<LastMessageWrapper> results =
	            mongoTemplate.aggregate(agg, "CHAT", LastMessageWrapper.class);

	    return results.getMappedResults().stream()
	            .map(LastMessageWrapper::getLastMessage)
	            .toList();
	}
	
	 // Aggregation 결과 Wrapper
    public static class LastMessageWrapper {
        private ChatMessage lastMessage;

        public ChatMessage getLastMessage() {
            return lastMessage;
        }

        public void setLastMessage(ChatMessage lastMessage) {
            this.lastMessage = lastMessage;
        }
    }
}
