package com.dealOn.chat.model.service;

import java.util.HashMap;
import java.util.List;

import org.springframework.stereotype.Service;

import com.dealOn.chat.model.mapper.ChatMapper;
import com.dealOn.chat.model.vo.ChatRoom;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatService {
	private final ChatMapper chatMapper;
	
	public String findSellerId(String productNo) {
		return chatMapper.findSellerId(productNo);
		
	}

	public ChatRoom findChatRoom(String buyerNo, String sellerNo, String productNo) {
		HashMap<String, Object> data = new HashMap<String, Object>();
		data.put("buyerNo", buyerNo);
		data.put("sellerNo", sellerNo);
		data.put("productNo", productNo);
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
	

}
