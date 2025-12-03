let flag = false;

document.addEventListener("DOMContentLoaded", () => {
	const avatar = document.getElementById("avatarPreview");
	const fileInput = document.getElementById("avatarInput");

	// 아바타 클릭하면 input[type=file] 클릭
	if(avatar != null) {
		avatar.addEventListener("click", () => {
			fileInput.click();
		});
	}

	// 파일 선택 시 미리보기 적용
	if(fileInput != null) {
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
	}
});

const emailAuthBtn = document.getElementById('emailAuthBtn');
const emailAuthCodeRow = document.getElementById("emailAuthCodeRow");
const verifyAuthBtn = document.getElementById("verifyAuthBtn");

// 인증번호 요청 (Async/Await)
if(emailAuthBtn != null) {
	emailAuthBtn.addEventListener('click', async () => {
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
			if (msg == "메일 발송 완료") {
				alert(msg); // "메일 발송 완료" 메시지
				emailAuthCodeRow.style.display = "flex";
			} else {
				alert(msg);
			}
		} catch (error) {
			console.error("이메일 발송 중 오류 발생:", error);
			alert(`오류 발생: ${error.message}`);
		}
	});
}
// 인증번호 확인 (Async/Await)
if(verifyAuthBtn != null) {
	verifyAuthBtn.addEventListener("click", async () => {
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
				flag = true;
			} else {
				alert("❌ 인증 실패. 다시 시도해주세요.");
			}
		} catch (error) {
			console.error("인증 확인 중 오류 발생:", error);
			alert(`오류 발생: ${error.message}`);
		}
	});
}

const changeBtn = document.querySelector('.changeInfoBtn');
const changeForm = document.querySelector('.profile-form');
if(changeBtn != null) {
	changeBtn.addEventListener('click', async () => {
		try {
			const response = await fetch("/api/nicknameCheck", {
				method: "post",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					nickname: document.getElementById('nickname').value,
					userNo: document.getElementById('userNo'),
					email: document.getElementById('email').value
				})
			});
	
			const result = await response.json();
	
			if ((result.nicknameAvailable && flag) || result.emailUnchanged) {
				changeForm.submit();
			} else if (!result.nicknameAvailable) {
				alert("닉네임이 중복되었습니다.");
			} else {
				alert("이메일 인증을 해주세요.");
			}
		} catch (err) {
			console.error(err);
		}
	});
}

/*const allA = document.querySelectorAll('a');

document.addEventListener('click', (e) => {

    // 클릭된 요소가 li인지 확인 (문자열 비교 주의!)
    if (e.target.tagName === 'A') {

        // 1. 모든 li의 active 제거
        allA.forEach(a => a.classList.remove('active'));

        // 2. 클릭한 li에 active 추가
        e.target.classList.add('active');
    }
});*/

