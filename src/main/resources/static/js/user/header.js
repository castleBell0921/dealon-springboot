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
