document.addEventListener('DOMContentLoaded', () => {
    const btn = document.querySelector('.btn-submit');
    const inquiryId = document.querySelector('#inquiryId').value;
    const contentArea = document.querySelector('#additionalContent');	
    const threadContainer = document.querySelector('.inquiry-thread');
    
    if (!btn) return;

    btn.addEventListener('click', async () => {
        const content = contentArea.value; // 공백 제거
        
        if(!content){
            alert("답변 내용을 입력해주세요.");
            return;
        }	
        
        // 관리자용 데이터 구조
        const requestData = {
            inquiryId: inquiryId,
            content: content,
            role: 'ADMIN' // 서버에서 이 값을 받아 처리하도록 VO/DTO 확인 필요
        };
        
        try {
            btn.disabled = true;
            
            // 관리자 전용 엔드포인트가 있다면 변경 (예: /admin/help/addReply)
            const response = await fetch('/help/addInquiry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });
            
            if(!response.ok){
                throw new Error('전송 실패');
            }
            
            const result = await response.json();
            
            // 관리자 전용 메시지 추가 함수 호출
            appendAdminMessage(result);
            
            contentArea.value = '';
            // 스크롤 하단 이동
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });

        } catch (error){
            console.error('Error:', error);
            alert('답변 등록 중 오류가 발생했습니다.');
        } finally {
            btn.disabled = false;
        }
    });
    
    // 관리자 전용 메시지 생성 함수
    function appendAdminMessage(data) {
        let timeStr;
        if (data.createdAt) {
            const date = new Date(data.createdAt);
            timeStr = date.getHours().toString().padStart(2, '0') + ":" + 
                      date.getMinutes().toString().padStart(2, '0');
        } else {
            const now = new Date();
            timeStr = now.getHours().toString().padStart(2, '0') + ":" + 
                      now.getMinutes().toString().padStart(2, '0');
        }

        // 'admin' 클래스와 'admin-profile' 요소를 포함한 HTML 구조
        const messageHtml = `
            <div class="detail-item admin">
                <div class="admin-profile">CS</div>
                <div class="bubble">
                    <p class="content">${data.content}</p>
                    <span class="time">${timeStr}</span>
                </div>
            </div>
        `;
        
        threadContainer.insertAdjacentHTML('beforeend', messageHtml);
    }
	
	const popup = document.getElementById("userPopup");
	const popupUserNo = document.getElementById("popupUserNo");
	const popupUsername = document.getElementById("popupUsername");
	const popupEmail = document.getElementById("popupEmail");
	const popupClose = document.getElementById("popupClose");

	document.querySelectorAll(".user-profile").forEach(profile => {

	    profile.addEventListener("click", () => {

	        popupUserNo.textContent = profile.dataset.userno;
	        popupUsername.textContent = profile.dataset.username;
	        popupEmail.textContent = profile.dataset.email;

	        popup.style.display = "flex";
	    });

	});

	popupClose.addEventListener("click", () => {
	    popup.style.display = "none";
	});
});