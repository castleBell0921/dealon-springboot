document.addEventListener('DOMContentLoaded', () => {
	const btn = document.querySelector('.btn-submit');
	const inquiryId = document.querySelector('#inquiryId').value;
	const contentArea = document.querySelector('#additionalContent');	
	const threadContainer = document.querySelector('.inquiry-thread');
	
	btn.addEventListener('click', async () => {
		const content = contentArea.value;
		
		if(!content){
			alert("문의 내용을 입력해주세요.");
			return;
		}	
		
		const requestData = {
			inquiryId: inquiryId,
			content: content
		};
		
		try{
			btn.disabled = true;
			
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
			
			appendMessage(result);
			
			contentArea.value = '';
			window.scrollTo(0, document.body.scrollHeight);
		} catch (error){
			console.error('Error:', error);
			alert('문의 중 오류가 발생했습니다.');
		} finally {
			btn.disabled = false;
		}
	});
	
	function appendMessage(data) {
        // 서버에서 온 시간 데이터(createdAt)가 있다면 사용하고, 없으면 현재 시간 생성
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

        const messageHtml = `
            <div class="detail-item user">
                <div class="bubble">
                    <p class="content">${data.content}</p>
                    <span class="time">${timeStr}</span>
                </div>
            </div>
        `;
        
        // threadContainer(대화 목록 영역)의 가장 마지막 자식으로 추가
        threadContainer.insertAdjacentHTML('beforeend', messageHtml);
    }
});