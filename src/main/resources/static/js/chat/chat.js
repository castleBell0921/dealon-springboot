// 상품 디테일에서 채팅하기 
const sellerChatBtn = document.querySelector(".sellerChatBtn");

if(sellerChatBtn != null) {
	sellerChatBtn.addEventListener("click", async () => {
	    // try-catch 블록을 사용하여 비동기 작업 중 발생할 수 있는 오류를 처리합니다.
	    try {
	        const productNoInput = document.querySelector("input[name='productNo']");
	        
	        // 입력 필드가 없는 경우를 대비한 기본적인 유효성 검사 (선택 사항)
	        if (!productNoInput) {
	            console.error("Error: 상품 번호 입력 필드(input[name='productNo'])를 찾을 수 없습니다.");
	            alert("상품 정보를 불러올 수 없습니다.");
	            return;
	        }
	
	        const productNo = productNoInput.value;
	        const apiUrl = `/chat/createRoom?productNo=${productNo}`;
	
	        // 1. fetch 요청 (응답이 올 때까지 대기)
	        const response = await fetch(apiUrl, {
	            method: "POST",
				credentials: 'same-origin'  // 이걸 추가해야 세션 유지
	
	        });
	
	        // HTTP 상태 코드가 200번대(성공)가 아닌 경우 오류를 발생시킵니다.
	        if (!response.ok) {
	            // 서버 응답이 실패 상태일 때, 콘솔에 에러를 기록하고 사용자에게 알립니다.
	            console.error(`HTTP Error: ${response.status} - ${response.statusText}`);
	            throw new Error(`서버 요청에 실패했습니다. (상태 코드: ${response.status})`);
	        }
	
	        // 2. JSON 파싱 (파싱이 완료될 때까지 대기)
	        const data = await response.json();
	
	        // 3. 결과 처리
	        if (data.chatRoomId) {
	            // 생성된 채팅방 ID를 확인하고 해당 경로로 이동합니다.
	            location.href = `/chat/chatRoom/${data.chatRoomId}`;
	        } else {
	            // chatRoomId가 없지만 HTTP 응답은 성공한 경우 (서버 로직 오류 가능성)
	            alert("채팅방 생성에 실패했습니다. (서버 응답 오류)");
	        }
	        
	    } catch (error) {
	        // fetch 자체의 네트워크 오류나, .json() 파싱 오류, 위에서 throw 한 오류 등을 여기서 모두 처리합니다.
	        console.error("채팅방 생성 중 오류가 발생했습니다:", error);
	        alert(`채팅방 생성 중 예상치 못한 오류가 발생했습니다.`);
	
	    }
	});
}


const chatViewContainer = document.querySelector('.chat-view-panel');
const chatListContainer = document.querySelector('.chat-list'); // .chat-item들을 감싸는 부모


chatListContainer.addEventListener('click', async (e) => {
    const item = e.target.closest('.chat-item');
    if (!item) return;

    const chatNo = item.dataset.chatNo;
	console.log(chatNo);

    try {
        const response = await fetch(`/chat/detail/${chatNo}`);
        if (!response.ok) throw new Error("서버 응답 오류");

        const data = await response.json();
        const chatInfo = data.chatInfo;
        const messages = data.messages;
		const loginUserNo = data.loginUser.userNo;

		
		

        // chatHTML 생성
        const chatHTML = `
            <div class="chat-header text-20px">
                <span>${chatInfo.nickname || "이름 없음"}</span>
                <button class="icon-button">☰</button>
            </div>

            <div class="product-bar">
                <img src="${chatInfo.imageUrl || ''}" class="product-image">
                <div class="product-info">
                    <div class="product-name">${chatInfo.name || ''}</div>
                    <div class="product-price">${chatInfo.price || ''}</div>
                </div>
            </div>

			<div class="message-area">
			    <ul class="message-list">
			        ${messages.map(msg => {
			            const time = msg.timestamp.split('T')[1].slice(0,5);
			            if (msg.senderNo == loginUserNo) {
			                return `
			                    <li class="message">
			                        <div class="timestamp">${time}</div>
			                        <div class="message-bubble">${msg.message}</div>
			                    </li>
			                `;
			            } else {
			                return `
			                    <li class="received">
			                        <div class="message-bubble">${msg.message}</div>
			                        <div class="timestamp">${time}</div>
			                    </li>
			                `;
			            }
			        }).join('')}
			    </ul>
			</div>


            <div class="input-area">
                <button class="icon-button">+</button>
                <input type="text" class="message-input" placeholder="메시지를 입력하세요.">
                <button class="send-button">➤</button>
            </div>
        `;

        chatViewContainer.innerHTML = chatHTML;

    } catch (error) {
        console.error("채팅방 로드 중 오류:", error);
        alert("채팅방 정보를 불러오지 못했습니다.");
    }
});
