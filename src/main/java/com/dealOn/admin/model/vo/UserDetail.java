package com.dealOn.admin.model.vo;
import lombok.Data;
import java.util.Date;

@Data
public class UserDetail {
    // user 테이블
    private int userNo;
    private String id;
    private String pwd;
    private String phone;
    private String email;
    private String nickname;
    private String state;
    private int trust;
    private String region;
    private String badge;
    private Date createDate;
    private String isAdmin;
    private String name;
    private String socialId;
    private String imageUrl;


    private int regPCnt;        // REG_P_CNT (등록 상품)
    private int buyPCnt;        // BUY_P_CNT (구매 상품)
    private int wrtRCnt;        // WRT_R_CNT (작성 후기)
    private int rptCnt;         // RPT_CNT (신고 적발)

    // [상세 상품 상태별 통계]
    private int sellPCnt;       // SELL_P_CNT (판매중)
    private int rsvPCnt;        // RSV_P_CNT (예약중)
    private int soldPCnt;       // SOLD_P_CNT (판매완료)
    private int disPCnt;        // DIS_P_CNT (비활성)

    // [받은 후기 통계]
    private int rcvRCnt;        // RCV_R_CNT (받은 후기)
}