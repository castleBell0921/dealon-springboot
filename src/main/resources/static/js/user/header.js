// 모달 오픈 
const modal = document.getElementById('loginModal');
const loginBtn = document.getElementById('loginButton');
const logoutBtn = document.getElementById('logoutButton');
if(loginBtn){
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
if(logoutBtn){
	logoutBtn.addEventListener('click', () => {
		console.log('로그아웃 클릭');
		location.href="/user/logout";
		alert('로그아웃되었습니다.');
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