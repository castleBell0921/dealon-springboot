package com.dealOn.admin.model.vo;

import lombok.Data;

@Data
public class UserList {
    private int pk;            // USER_NO (PK)
    private String imageurl;    // IMAGEURL
    private String nickname;    // NICKNAME
    private int trustGauge; // TRUST_GAUGE

    // 카운트 통계 컬럼 (int or Long)
    private int regPCnt;        // REG_P_CNT (등록 상품)
    private int buyPCnt;        // BUY_P_CNT (구매 상품)
    private int wrtRCnt;        // WRT_R_CNT (작성 후기)
    private int rptCnt;         // RPT_CNT (신고 적발)
}