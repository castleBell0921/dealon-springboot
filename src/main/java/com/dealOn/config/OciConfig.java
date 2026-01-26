package com.dealOn.config;

import java.io.IOException;
import java.nio.file.Paths;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.oracle.bmc.Region;
import com.oracle.bmc.auth.AuthenticationDetailsProvider;
import com.oracle.bmc.auth.SimpleAuthenticationDetailsProvider;
import com.oracle.bmc.auth.SimplePrivateKeySupplier;
import com.oracle.bmc.objectstorage.ObjectStorage;
import com.oracle.bmc.objectstorage.ObjectStorageClient;

@Configuration
public class OciConfig {

    @Bean
    public ObjectStorage objectStorageClient() throws IOException {
        // Dotenv가 설정한 값 읽기
        String tenantId = System.getProperty("OCI_TENANCY_OCID");
        String userId = System.getProperty("OCI_USER_OCID");
        String fingerprint = System.getProperty("OCI_FINGERPRINT");
        String regionId = System.getProperty("OCI_REGION");
        String privateKeyPath = System.getProperty("OCI_PRIVATE_KEY_PATH");

        // [경로 처리 핵심 로직]
        String absoluteKeyPath;
        if (privateKeyPath.startsWith("~")) {
            // 서버(리눅스): ~를 홈 디렉토리로 변경
            absoluteKeyPath = privateKeyPath.replace("~", System.getProperty("user.home"));
        } else if (privateKeyPath.contains(":") || privateKeyPath.startsWith("/")) {
            // 로컬(윈도우 D:/) 또는 서버 절대 경로: 그대로 사용
            absoluteKeyPath = privateKeyPath;
        } else {
            // 상대 경로일 경우 현재 작업 디렉토리 기준 절대 경로로 변환
            absoluteKeyPath = Paths.get(privateKeyPath).toAbsolutePath().toString();
        }

        AuthenticationDetailsProvider provider = SimpleAuthenticationDetailsProvider.builder()
                .tenantId(tenantId)
                .userId(userId)
                .fingerprint(fingerprint)
                .region(Region.fromRegionId(regionId))
                .privateKeySupplier(new SimplePrivateKeySupplier(absoluteKeyPath))
                .build();

        return ObjectStorageClient.builder()
                .region(Region.fromRegionId(regionId))
                .build(provider);
    }
}