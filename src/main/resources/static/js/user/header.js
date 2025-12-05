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

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('logoutButton')) { // 로그인 상태 확인을 위한 임시 DOM 요소
		myReviewState();
		updateNotificationBadge();
    }
});

async function myReviewState() {
  	try {
		const res = await fetch(`/common/myReviewState`)
		
		if(!res.ok) {
			throw new Eerror(`오류 발생!`);
		}
		
		const reviewList = await res.json();
		
		console.log("서버에서 받은 리뷰 데이터:", reviewList);
		
		return reviewList;
	} catch {
		console.error("리뷰 상태를 가져오는 중 오류 발생:", error);
        return []; // 오류 발생 시 빈 배열 반환
	}
}

// 💡 페이지 로드 시 알림 뱃지 업데이트 함수
async function updateNotificationBadge() {
    const data = await myReviewState();
    
    // readStatus가 'N'인 (미확인) 리뷰의 개수를 필터링하여 셉니다.
    const unreadCount = data.length;
    
    const notificationBadge = document.getElementById('notificationBadge');

    if (notificationBadge) {
        if (unreadCount > 0) {
            notificationBadge.textContent = unreadCount > 99 ? '99+' : unreadCount;
            notificationBadge.style.display = 'block'; // 0보다 크면 표시
        } else {
            notificationBadge.style.display = 'none'; // 0이면 숨김
        }
    }
}
