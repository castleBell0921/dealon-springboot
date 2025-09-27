package com.dealOn.config;

import com.oracle.bmc.ConfigFileReader;
import com.oracle.bmc.auth.AuthenticationDetailsProvider;
import com.oracle.bmc.auth.ConfigFileAuthenticationDetailsProvider;
import com.oracle.bmc.objectstorage.ObjectStorage;
import com.oracle.bmc.objectstorage.ObjectStorageClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;

@Configuration
public class OciConfig {

    // application.properties에 설정한 정보들을 기반으로
    // OCI SDK의 ObjectStorage 객체를 생성해서 Spring Bean으로 등록해주는 메소드.
    @Bean
    public ObjectStorage objectStorageClient() throws IOException {
        // OCI SDK는 기본적으로 ~/.oci/config 경로의 설정 파일을 읽어서 인증 정보를 구성합니다.
        // 이 방식이 application.properties에 직접 키를 넣는 것보다 보안상 권장됩니다.
        // 1. OCI 설정 파일 로드
        final ConfigFileReader.ConfigFile configFile = ConfigFileReader.parseDefault();

        // 2. 인증 정보 제공자 생성
        final AuthenticationDetailsProvider provider = new ConfigFileAuthenticationDetailsProvider(configFile);

        // 3. 인증 정보를 사용해 ObjectStorage 클라이언트 생성
        return ObjectStorageClient.builder().build(provider);
    }
}
