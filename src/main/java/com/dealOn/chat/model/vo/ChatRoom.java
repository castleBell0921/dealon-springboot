package com.dealOn.chat.model.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoom {
    private String chatNo; 
    private String buyerNo;
    private String sellerNo;
    private String productNo;
    private Date createDate; 
    private String productName;
    private String productPrice;
    private String nickname;
    private String imageUrl;
}
