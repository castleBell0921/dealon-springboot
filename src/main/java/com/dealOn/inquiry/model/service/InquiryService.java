package com.dealOn.inquiry.model.service;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.session.RowBounds;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.dealOn.common.S3Service;
import com.dealOn.common.model.vo.PageInfo;
import com.dealOn.inquiry.model.mapper.InquiryMapper;
import com.dealOn.inquiry.model.vo.InquiryDetailVO;
import com.dealOn.inquiry.model.vo.InquiryVO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class InquiryService {

	private final InquiryMapper iMapper;
	private final S3Service s3Service;
	
	@Transactional
	public int insertInquiry(InquiryVO inquiryVO,
	                          InquiryDetailVO inquiryDetailVO,
	                          MultipartFile upfile) {
	    String imageUrl = "";
	    if (upfile != null && !upfile.isEmpty()) {
		    try {
		        imageUrl = s3Service.uploadFile(upfile);
		    } catch (IOException e) {
		        throw new RuntimeException("S3 업로드 실패", e);
		    }
	    }

	    inquiryVO.setImageUrl(imageUrl);
	    int result1 = iMapper.insertInquiry(inquiryVO);

	    if (result1 == 0) {
	        throw new RuntimeException("Inquiry insert 실패");
	    }

	    int inquiryNo = inquiryVO.getInquiryId(); // selectKey로 채워진 값

	    String category = inquiryVO.getCategory();
	    switch(category) {
	    	case "account":
	    		inquiryVO.setCategory("계정문의");
	    	break;
	    	case "system":
	    		inquiryVO.setCategory("시스템 문의");
    		break;
	    	case "etc":
	    		inquiryVO.setCategory("기타");
	    	break;
	    }
	    inquiryDetailVO.setInquiryId(inquiryNo);
	    inquiryDetailVO.setWriterId(inquiryVO.getUserNo());
	    inquiryDetailVO.setRole("USER");

	    int result2 = iMapper.insertInquiryDetail(inquiryDetailVO);

	    if (result2 == 0) {
	        throw new RuntimeException("InquiryDetail insert 실패");
	    }

	    return inquiryNo;  // ⭐ PK만 리턴
	}

	public List<InquiryDetailVO> getInquiryDetail(int inquiryId) {
		return iMapper.getInquiryDetail(inquiryId);
	}

	public InquiryVO getInquiry(int inquiryId) {
		InquiryVO inquiry = iMapper.getInquiry(inquiryId);
		String category = inquiry.getCategory();
	    switch(category) {
	    	case "account":
	    		inquiry.setCategory("계정문의");
	    	break;
	    	case "system":
	    		inquiry.setCategory("시스템 문의");
    		break;
	    	case "etc":
	    		inquiry.setCategory("기타");
	    	break;
	    }
		return inquiry;
	}

	public List<InquiryVO> getAllInquiry(Map<String, Object> map) {
		PageInfo pi = (PageInfo)map.get("pi");
		int offset = (pi.getCurrentPage() - 1) * pi.getBoardLimit();
		int limit = pi.getBoardLimit();
		RowBounds rowBounds = new RowBounds(offset, limit);
		return iMapper.getAllInquiry(map, rowBounds);
	}

	public int getInquiryCount(String userNo) {
		return iMapper.getInquiryCount(userNo);
	}

	

}
