package com.dealOn.chat.model.vo;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoom {
    private String chatNo; 
    private String buyerNo;
    private String sellerNo;
    private String productNo;
    private LocalDateTime createDate; 
    private String name;
    private String price;
    private String nickname;
    private String imageUrl;
    private String sellerStatus;
    private String buyerStatus;
    private String detail;

    
}
