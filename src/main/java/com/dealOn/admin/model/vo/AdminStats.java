package com.dealOn.admin.model.vo;

import lombok.Data;

@Data
public class AdminStats {
    private int currentWeekVisitors;
    private int prevWeekVisitors;
    private int currentWeekSignups;
    private int prevWeekSignups;
    private int currentWeekTrades;
    private int prevWeekTrades;
    private int activeChatRooms;
    private int totalReports;
    private int newReports7Days;
    private int unprocessedReports;
}
