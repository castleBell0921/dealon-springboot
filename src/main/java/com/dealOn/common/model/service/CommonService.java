package com.dealOn.common.model.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.dealOn.common.model.mapper.CommonMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommonService {
	private final CommonMapper cMapper;
	public void recentSearchSave(HashMap<String, Object> map) {
		cMapper.recentSearchSave(map);
        cMapper.deleteOldSearches(map);

	}
	public List<Map<String, Object>> getRecentSearch(String userNo) {
		return cMapper.getRecentSearch(userNo);
	}

}
