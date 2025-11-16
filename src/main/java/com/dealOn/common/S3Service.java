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

import com.oracle.bmc.objectstorage.requests.DeleteObjectRequest;
import lombok.extern.slf4j.Slf4j;

@Slf4j
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

	public void deleteFile(String fileUrl) throws IOException {
		try {
			// 1. 네임스페이스 조회 (uploadFile과 동일)
			String namespace = objectStorageClient.getNamespace(GetNamespaceRequest.builder().build()).getValue();

			// 2. URL에서 objectName 추출
			// 형식: https://objectstorage.[region].oraclecloud.com/n/[namespace]/b/[bucketName]/o/[objectName]
			String prefix = "/o/";
			int objectNameStartIndex = fileUrl.indexOf(prefix);

			if (objectNameStartIndex == -1) {
				log.warn("Invalid OCI URL format. Cannot find '/o/': {}", fileUrl);
				throw new IllegalArgumentException("Invalid OCI URL format.");
			}

			String objectName = fileUrl.substring(objectNameStartIndex + prefix.length());

			// 3. 삭제 요청 생성
			DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
					.namespaceName(namespace)
					.bucketName(bucketName)
					.objectName(objectName)
					.build();

			// 4. 파일 삭제 실행
			objectStorageClient.deleteObject(deleteObjectRequest);

			log.info("Successfully deleted file from OCI: {}", objectName);

		} catch (Exception e) {
			log.error("Error deleting file from OCI: " + fileUrl, e);
			// 트랜잭션 롤백을 위해 런타임 예외 재발생
			throw new RuntimeException("Failed to delete file from OCI", e);
		}
	}
}