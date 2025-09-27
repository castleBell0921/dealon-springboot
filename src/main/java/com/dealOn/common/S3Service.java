package com.dealOn.common;

import com.oracle.bmc.objectstorage.ObjectStorage;
import com.oracle.bmc.objectstorage.requests.GetNamespaceRequest;
import com.oracle.bmc.objectstorage.requests.PutObjectRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
public class S3Service {

	@Autowired
	private ObjectStorage objectStorageClient; // OCI SDK 클라이언트 (별도의 @Configuration 클래스에서 Bean으로 등록)

	@Value("${OCI_BUCKETNAME}")
	private String bucketName;
	@Value("${OCI_REGION}")
	private String region;
	public String uploadFile(MultipartFile file) throws IOException {
	    // UUID로 새로운 파일명 생성
	    String originalFileName = file.getOriginalFilename();
	    String fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
	    String newFileName = UUID.randomUUID().toString() + fileExtension;

	    // 네임스페이스 조회
	    String namespace = objectStorageClient.getNamespace(GetNamespaceRequest.builder().build()).getValue();

	    // Object Storage 업로드
	    PutObjectRequest request = PutObjectRequest.builder()
	            .bucketName(bucketName)
	            .namespaceName(namespace)
	            .objectName(newFileName)
	            .putObjectBody(file.getInputStream())
	            .contentLength(file.getSize())
	            .contentType(file.getContentType())
	            .build();

	    objectStorageClient.putObject(request);

	    // Object URL 생성
	    String fileUrl = String.format("https://objectstorage.%s.oraclecloud.com/n/%s/b/%s/o/%s",
	            region,      // ex: "ap-chuncheon-1"
	            namespace,
	            bucketName,
	            newFileName);

	    return fileUrl; // 이제 브라우저에서 바로 접근 가능한 URL 반환
	}
}