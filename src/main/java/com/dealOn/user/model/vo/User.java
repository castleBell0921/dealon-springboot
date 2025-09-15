package com.dealOn.user.model.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
	private int phone;
	private String name;
	private String nickName;
	private String email;
	private String pwd;
	

}
