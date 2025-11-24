package com.dealOn.common.model.mapper;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CommonMapper {

	void recentSearchSave(HashMap<String, Object> map);
	void deleteOldSearches(HashMap<String, Object> map);
	List<Map<String, Object>> getRecentSearch(String userNo);
	void recentViewSave(HashMap<String, Object> map);
	void deleteOldView(HashMap<String, Object> map);
	
}
