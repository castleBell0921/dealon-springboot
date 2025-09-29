document.addEventListener("DOMContentLoaded", () => {
    const avatar = document.getElementById("avatarPreview");
    const fileInput = document.getElementById("avatarInput");

    // 아바타 클릭하면 input[type=file] 클릭
    avatar.addEventListener("click", () => {
        fileInput.click();
    });

    // 파일 선택 시 미리보기 적용
    fileInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                avatar.src = e.target.result; // 미리보기 반영
            };
            reader.readAsDataURL(file);
        }
    });
});

const emailAuthBtn = document.getElementById('emailAuthBtn');
const emailAuthCodeRow = document.getElementById("emailAuthCodeRow");

// 인증번호 요청 (Async/Await)
emailAuthBtn.addEventListener('click', async () => {
	emailAuthCodeRow.style.display = "flex";
	const email = document.getElementById('email').value;

    if (!email) {
        alert("이메일 주소를 입력해 주세요.");
        return;
    }

    try {
        const response = await fetch('/api/email/send', {
            method: 'post',
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: "email=" + encodeURIComponent(email)
        });

        // HTTP 상태 코드가 200번대가 아닐 경우 에러 처리
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`메일 발송 실패: ${response.status} - ${errorText}`);
        }

        const msg = await response.text();
        alert(msg); // "메일 발송 완료" 메시지
    } catch (error) {
        console.error("이메일 발송 중 오류 발생:", error);
        alert(`오류 발생: ${error.message}`);
    }
});

// 인증번호 확인 (Async/Await)
emailAuthCodeRow.addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const code = document.getElementById("authCode").value;

    if (!email || !code) {
        alert("이메일과 인증번호를 모두 입력해 주세요.");
        return;
    }

    try {
        const response = await fetch("/api/email/verify", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`
        });

        // HTTP 상태 코드가 200번대가 아닐 경우 에러 처리
        if (!response.ok) {
             const errorText = await response.text();
             throw new Error(`인증 서버 오류: ${response.status} - ${errorText}`);
        }

        const result = await response.json(); // 결과는 boolean 값 (true/false)

        if (result) {
            alert("✅ 인증 성공!");
        } else {
            alert("❌ 인증 실패. 다시 시도해주세요.");
        }
    } catch (error) {
        console.error("인증 확인 중 오류 발생:", error);
        alert(`오류 발생: ${error.message}`);
    }
});
