package com.dealOn.user.model.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
	private String userNo;
	private String phone;
	private String name;
	private String nickname;
	private String email;
	private String pwd;
	private String id;
	private String socialId;
	private String accessToken;
	private String imageUrl;
	private String uuid;
	private double trustScore;
}
