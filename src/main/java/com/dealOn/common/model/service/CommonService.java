package com.dealOn.common.model.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.dealOn.common.model.mapper.CommonMapper;

import lombok.RequiredArgsConstructor;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class CommonService {
	private final CommonMapper cMapper;


	@Value("${google.maps.api-key}")
	private String googleMapsApiKey;

	public void recentSearchSave(HashMap<String, Object> map) {
		cMapper.recentSearchSave(map);
        cMapper.deleteOldSearches(map);

	}
	public List<Map<String, Object>> getRecentSearch(String userNo) {
		return cMapper.getRecentSearch(userNo);
	}
	public void recentViewSave(HashMap<String, Object> map) {
		cMapper.recentViewSave(map);
		cMapper.deleteOldView(map);
		
	}

	public String getRegionFromCoordinates(double lat, double lng) {
		String url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + lng + "&key=" + googleMapsApiKey + "&language=ko";

		try {
			RestTemplate restTemplate = new RestTemplate();
			String response = restTemplate.getForObject(url, String.class);

			ObjectMapper mapper = new ObjectMapper();
			JsonNode root = mapper.readTree(response);
			JsonNode results = root.path("results");

			if (results.isArray() && results.size() > 0) {
				JsonNode addressComponents = results.get(0).path("address_components");

				String si = "";
				String gu = "";

				// 전체 주소 컴포넌트 순회하면서 시,구 찾기
				for (JsonNode component : addressComponents) {
					JsonNode types = component.path("types");
					for (JsonNode type : types) {
						String typeStr = type.asText();

						// 구
						if (typeStr.equals("sublocality_level_1")) {
							gu = component.path("long_name").asText();
						}

						// 시, 군
						if (typeStr.equals("locality")) {
							si = component.path("long_name").asText();
						}
					}
				}
				// 구 먼저 찾고
				if (!gu.isEmpty()) {
					return gu;
				}
				// 구 없으면 시 반환
				if (!si.isEmpty()) {
					return si;
				}
				// 시없으면 도라도 반환
				for (JsonNode component : addressComponents) {
					for (JsonNode type : component.path("types")) {
						if (type.asText().equals("administrative_area_level_1")) {
							return component.path("long_name").asText(); // 예: 서울특별시
						}
					}
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
			return "주소 확인 불가";
		}

		return "위치 정보 없음";

	}
}
