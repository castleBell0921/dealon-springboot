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
import com.dealOn.chat.model.repository.ChatMessageNoSqlRepository;
import com.dealOn.chat.model.vo.ChatMessage;
import com.dealOn.chat.model.vo.ChatRoom;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatService {
	private final ChatMapper chatMapper;
	private final MongoTemplate mongoTemplate;
	private final ChatMessageNoSqlRepository chatMessageRepo;

	public String findSellerId(String productNo) {
		return chatMapper.findSellerId(productNo);

	}

	public List<ChatRoom> findChatRoom(String buyerNo, String sellerNo, String productNo, String userNo) {
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
		if (result > 0) {
			return (ChatRoom) chatMapper.findChatRoom(data);
		}
		return null;
	}

	public ChatRoom findByChatNo(String chatNo, String userNo) {
		HashMap<String, String> data = new HashMap<String, String>();
		data.put("chatNo", chatNo);
		data.put("userNo", userNo);
		return chatMapper.findByChatNo(data);
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

		return chatMessageRepo.save(chat);
	}

	public List<ChatMessage> getMessages(String chatNo) {
		Query query = new Query(Criteria.where("chatNo").is(chatNo));
		return chatMessageRepo.findByChatNoOrderByTimestampAsc(chatNo);
	}

	public ChatRoom findByChatInfo(String chatNo, String userNo) {
		HashMap<String, Object> data = new HashMap<String, Object>();
		data.put("chatNo", chatNo);
		data.put("userNo", userNo);
		return chatMapper.findByChatInfo(data);
	}

	public List<ChatMessage> getLastMessages(List<String> chatNos) {
		Aggregation agg = Aggregation.newAggregation(Aggregation.match(Criteria.where("chatNo").in(chatNos)),
				Aggregation.sort(Sort.Direction.DESC, "timestamp"),
				Aggregation.group("chatNo").first(Aggregation.ROOT).as("lastMessage"));

		AggregationResults<LastMessageWrapper> results = mongoTemplate.aggregate(agg, "CHAT", LastMessageWrapper.class);

		return results.getMappedResults().stream().map(LastMessageWrapper::getLastMessage).toList();
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

	public boolean leaveChatRoom(String chatNo, String userNo,String userOption) {
		HashMap<String, String> data = new HashMap<String, String>();
		HashMap<String, Object> chatData = new HashMap<String, Object>();
		chatData.put("chatNo",chatNo);
		chatData.put("userNo", userNo);
		data.put("chatNo", chatNo);
		data.put("userNo", userNo);
		data.put("userOption", userOption);
		int rdbResult = chatMapper.leaveChatRoom(data);
		ChatRoom chatInfo = chatMapper.findByChatInfo(chatData);
		if (rdbResult > 0) {

			// 2. NoSQL 작업: 해당 채팅방의 모든 메시지 기록 삭제
			try {
				// NoSQL Repository 메소드 호출
				if(chatInfo.getBuyerStatus().equals("N") && chatInfo.getSellerStatus().equals("N")) {
					chatMessageRepo.deleteAllByChatNo(chatNo);
				} 
				return true; // 두 작업 모두 성공

			} catch (Exception e) {
				// NoSQL 삭제 실패 시, RDB 트랜잭션까지 롤백되도록 런타임 예외를 던짐
				throw new RuntimeException("채팅 기록 삭제 처리 중 오류가 발생했습니다.", e);
			}

		} else {
			// RDB 참여자 삭제 실패 (로그만 남김)
			return false;
		}
	}

	public ChatRoom findByChatNoIgnoreStatus(String chatNo) {
		return chatMapper.findByChatNoIgnoreStatus(chatNo);
	}
}
