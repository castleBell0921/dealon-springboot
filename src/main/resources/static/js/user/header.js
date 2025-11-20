// 모달 오픈 
const modal = document.getElementById('loginModal');
const loginBtn = document.getElementById('loginButton');
const logoutBtn = document.getElementById('logoutButton');
if (loginBtn) {
	loginBtn.addEventListener('click', (e) => {
		e.preventDefault();
		modal.style.display = 'block';
	});
}


window.addEventListener('click', (e) => {

	if (e.target == modal) {
		modal.style.display = 'none';
	}
});
if (logoutBtn) {
	logoutBtn.addEventListener('click', () => {
		console.log('로그아웃 클릭');
		location.href = "/user/logout";
		
	});
}

const loginForm = document.querySelector('.login-form');
const signUpBtn = document.querySelector('.login-btn');
signUpBtn.addEventListener('click', () => {
	console.log('click');
	loginForm.submit();
});


// '키보드' 이벤트 리스너: 엔터키 입력 시 폼 제출
loginForm.addEventListener('keypress', (event) => {
	// 사용자가 누른 키가 'Enter'인지 확인
	if (event.key === 'Enter') {
		console.log('엔터키 입력');
		loginForm.submit();
	}
});

// 카카오 로그인
const kakaoBtn = document.querySelector('.kakao_button');

kakaoBtn.addEventListener('click', async () => {
	try {
		const response = await fetch("/auth/kakao/auth-url");
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const data = await response.text();
		window.location.href = data; // 카카오 인증 페이지로 이동
	} catch (error) {
		alert("카카오 로그인 URL을 가져오는 데 실패했습니다!");
		console.error(error);
	}
});

// 구글 로그인 버튼
const googleBtn = document.querySelector('.google_button'); // id면 # 붙여야 해요!

googleBtn.addEventListener('click',  () => {
		window.location.href = "/auth/google/auth-url";
});

