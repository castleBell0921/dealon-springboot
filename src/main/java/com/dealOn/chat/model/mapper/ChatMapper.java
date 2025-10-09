package com.dealOn.chat.model.mapper;

import java.util.HashMap;
import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.dealOn.chat.model.vo.ChatRoom;

@Mapper
public interface ChatMapper {
	String findSellerId(String productNo);

	ChatRoom findChatRoom(HashMap<String, Object> data);

	int createChatRoom(HashMap<String, Object> data);
	
	ChatRoom findByChatNo(String ChatNo);

	List<ChatRoom> findChatRoomsByUser(String userNo);
}
