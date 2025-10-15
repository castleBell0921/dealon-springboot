package com.dealOn.chat.model.vo;


import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "CHAT")
@NoArgsConstructor
@AllArgsConstructor
@Data

public class ChatMessage {

    @Id
    private String id;

    private String chatNo;      // RDB CHAT_ROOM 의 PK
    private String senderNo;
    private String message;
    private LocalDateTime timestamp;
    private String name;

    


}

