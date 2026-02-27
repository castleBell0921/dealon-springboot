package com.dealOn.inquiry.model.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.session.RowBounds;

import com.dealOn.inquiry.model.vo.InquiryDetailVO;
import com.dealOn.inquiry.model.vo.InquiryVO;

@Mapper
public interface InquiryMapper {

	int insertInquiry(InquiryVO inquiryVO);

	int insertInquiryDetail(InquiryDetailVO inquiryDetailVO);

	List<InquiryDetailVO> getInquiryDetail(int inquiryId);

	InquiryVO getInquiry(int inquiryId);

	List<InquiryVO> getAllInquiry(Map<String, Object> map, RowBounds rowBounds);

	int getInquiryCount(String userNo);
	
}
