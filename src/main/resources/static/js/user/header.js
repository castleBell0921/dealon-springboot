// 모달 오픈 로직

const modal = document.getElementById('loginModal');
const loginBtn = document.getElementById('loginButton');


loginBtn.addEventListener('click', (e) => {
	e.preventDefault();
	modal.style.display = 'block';
});


window.addEventListener('click', (e) => {

	if (e.target == modal) {
		modal.style.display = 'none';
	}
});

// 본인인증
const verifyInput = document.getElementById('authSection');
const verifyBtn = document.getElementsByClassName('verify-btn')[0];
const phoneNum = document.getElementById('phone');
const phoneRegex = /^010[0-9]{8}$/;

console.log(verifyBtn);
verifyBtn.addEventListener('click', async(e) => {
	if(phoneNum.value=='') {
		alert('휴대폰 번호를 입력해주세요');
	}
	else if(!phoneRegex.test(phoneNum.value)) {
		alert('휴대폰 번호 형식이 잘못되었습니다.');
	} else {
		try {
			const response = await fetch('/api/send-auth', {
				method: 'post',
				headers: {
					'Content-Type' : 'application/json'
				},
				body :JSON.stringify({phone: phoneNum.value})
			});
			
			if(response.ok) {
				const data = await response.json();
				// console.log(data);
				if(data.success) {
					alert('인증번호가 발송되었습니다.');
					verifyInput.style.display='block';
				} 
			} else {
				alert('인증번호 전송 오류');
			}
		} catch(err){
			console.error(err);
		}
	}
});