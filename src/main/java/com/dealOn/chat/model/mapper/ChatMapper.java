package com.dealOn.chat.model.mapper;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.dealOn.chat.model.vo.ChatRoom;

@Mapper
public interface ChatMapper {
	String findSellerId(String productNo);

	List<ChatRoom> findChatRoom(HashMap<String, Object> data);

	int createChatRoom(HashMap<String, Object> data);
	
	ChatRoom findByChatNo(HashMap<String, String> data);

	List<ChatRoom> findChatRoomsByUser(String userNo);

	ChatRoom findByChatInfo(HashMap<String, Object> data);

	int leaveChatRoom(HashMap<String, String> data);

	ChatRoom selectBuyerOrSeller(HashMap<String, String> data);
	
	int updateStatus(@Param("chatNo") String chatNo, @Param("userOption") String userOption);

	ChatRoom findByChatNoIgnoreStatus(String chatNo);
}
