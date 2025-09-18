// 모달 오픈 
const modal = document.getElementById('loginModal');
const loginBtn = document.getElementById('loginButton');
const form = document.querySelector('form');

let isVerify = false;
let isIdCheck = false;
let isNicknameAvailable = false;

loginBtn.addEventListener('click', (e) => {
	e.preventDefault();
	modal.style.display = 'block';
});


window.addEventListener('click', (e) => {

	if (e.target == modal) {
		modal.style.display = 'none';
	}
});

// 인증 번호 전송
const verifyInput = document.getElementById('authSection');
const verifyBtn = document.getElementsByClassName('verify-btn')[0];
const phoneNum = document.getElementById('phone');
const phoneRegex = /^010[0-9]{8}$/;

console.log(verifyBtn);
verifyBtn.addEventListener('click', async (e) => {
	if (phoneNum.value == '') {
		alert('휴대폰 번호를 입력해주세요');
	}
	else if (!phoneRegex.test(phoneNum.value)) {
		alert('휴대폰 번호 형식이 잘못되었습니다.');
	} else {
		try {
			const response = await fetch('/api/send-auth', {
				method: 'post',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ phone: phoneNum.value })
			});

			if (response.ok) {
				const data = await response.json();
				// console.log(data);
				if (data.success) {
					alert('인증번호가 발송되었습니다.');
					verifyInput.style.display = 'block';
				}
			} else {
				alert('인증번호 전송 오류');
			}
		} catch (err) {
			console.error(err);
		}
	}
});

// 본인인증 확인
const confirmBtn = document.getElementById("checkAuthBtn");
const confirmInput = document.getElementById("authCode");

confirmBtn.addEventListener('click', async () => {
	console.log(confirmInput.value);
	console.log(confirmBtn)
	if (confirmInput.value == '') {
		alert('인증번호를 입력해주세요.');
	} else {
		try {
			const response = await fetch('/api/verify-auth', {
				method: 'post',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ authCode: confirmInput.value })
			});

			if (response.ok) {
				const data = await response.json();
				if (data.success) {
					alert('인증되었습니다.');
					isVerify = true;
				} else {
					alert('인증번호가 틀렸습니다.');
				}
			}
		} catch (err) {
			console.error(err);
		}
	}
});


// 아이디 중복확인 
const idInput = document.getElementById('id');
const idCheckText = document.getElementById('idCheck');
idInput.addEventListener('blur', async () => {
	try {
		const response = await fetch('/api/idCheck', {
			method: 'post',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ idValue: idInput.value })
		});

		if (response.ok) {
			const data = await response.json();
			if (data) {
				isIdCheck = true;
				idCheckText.style.display = 'inline';
				idCheckText.style.color = 'green';
				idCheckText.innerHTML = '사용 가능한 아이디입니다.';
			} else {
				idCheckText.style.display = 'inline';
				idCheckText.style.color = 'red';
				idCheckText.innerHTML = '사용 불가능한 아이디입니다.';
			}
		}
	} catch (err) {
		console.error(err);
	}
});


// 비밀번호 입력칸
const pwd = document.getElementById('password');
// 비밀번호 확인 입력칸
const pwdCheck = document.getElementById('password-confirm');

// 정규식
const pwdRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,16}$/;

// 비밀번호 유효성 검사 (실시간)
pwd.addEventListener('input', (e) => {
	if (pwdRegex.test(e.target.value)) {
		pwd.style.borderColor = "green";
	} else {
		pwd.style.borderColor = "red";
	}
});

// 비밀번호 확인 (blur 시 최종 확인)
pwdCheck.addEventListener('blur', (e) => {
	if (pwd.value !== e.target.value) {
		pwdCheck.style.borderColor = "red";
	} else {
		pwdCheck.style.borderColor = "green";
	}
});


// 닉네임 중복 확인 
const nickname = document.getElementById('nickname');
nickname.addEventListener('blur', async () => {
	try {
		const response = await fetch('/api/nicknameCheck', {
			method: 'post',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ nickname: nickname.value })
		});
		
		if(response.ok) {
			const data = await response.json();
			if(data) {
				isNicknameAvailable = true;
				nickname.style.borderColor = "green";
			} else {
				nickname.style.borderColor = "red";
			}
		}
	} catch(err) {
		console.error(err);
	}
});

// 회원가입 
const signupBtn = document.querySelector('.signup-btn');
// --- 회원가입 버튼 클릭 시: 모든 플래그 확인 후 폼 전송 ---
signupBtn.addEventListener('click', (e) => {
	// 최신 값 재검사 (실시간 이벤트가 발생하지 않았을 경우 대비)
	isPwdValid = pwdRegex.test(pwd.value);
	isPwdMatch = pwd.value === pwdCheck.value;

	// 순서대로 체크하며 사용자에게 포커스 및 안내
	if (!idInput.value) {
		alert('아이디를 입력해주세요');
		idInput.focus();
		return;
	}

	if (!isPwdValid) {
		alert('비밀번호는 8~16자, 영문/숫자/특수문자를 포함해야 합니다.');
		pwd.focus();
		return;
	}
	if (!isPwdMatch) {
		alert('비밀번호가 일치하지 않습니다.');
		pwdCheck.focus();
		return;
	}
	if (!nickname.value) {
		alert('닉네임을 입력해주세요');
		nickname.focus();
		return;
	}
	if (!isNicknameAvailable) {
		alert('닉네임 중복확인을 해주세요');
		nickname.focus();
		return;
	}
	if (!phoneNum.value) {
		alert('휴대폰 번호를 입력해주세요');
		phoneNum.focus();
		return;
	}

	if(!isIdCheck) {
		alert('아이디가 중복되었습니다.');
		return;
	}
	if(!isVerify) {
		alert('본인인증을 해주시기 바랍니다.');
		return;
	}

	// 모두 통과하면 폼 전송
	form.submit();
});