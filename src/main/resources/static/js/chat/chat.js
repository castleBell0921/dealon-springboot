const sellerChatBtn = document.querySelector(".sellerChatBtn");

if (sellerChatBtn != null) {
    sellerChatBtn.addEventListener("click", async () => {
        const productUserNo = document.getElementById("productUserNo").value;
        const loginUserNo = document.getElementById("loginUserNo").value;

        if (productUserNo == loginUserNo) {
            alert('자신과 대화하면 아픈사람이에요.');
            return;
        }

        try {
            const productNoInput = document.querySelector("input[name='productNo']");
            if (!productNoInput) {
                console.error("상품 번호 입력 필드(input[name='productNo'])를 찾을 수 없습니다.");
                alert("상품 정보를 불러올 수 없습니다.");
                return;
            }

            const productNo = productNoInput.value;
            const apiUrl = `/chat/createRoom?productNo=${productNo}`;

            const response = await fetch(apiUrl, {
                method: "POST",
                credentials: 'same-origin'
            });

            if (!response.ok) {
                console.error(`HTTP Error: ${response.status} - ${response.statusText}`);
                throw new Error(`서버 요청에 실패했습니다. (상태 코드: ${response.status})`);
            }

            const data = await response.json();

            if (data.chatRoomId) {
                location.href = `/chat/chatRoom/${data.chatRoomId}`;
            } else {
                alert("채팅방 생성에 실패했습니다. (서버 응답 오류)");
            }

        } catch (error) {
            console.error("채팅방 생성 중 오류:", error);
            alert("채팅방 생성 중 예상치 못한 오류가 발생했습니다.");
        }
    });
}

const chatViewContainer = document.querySelector('.chat-view-panel');
const chatListContainer = document.querySelector('.chat-list');
let socket = null;
let lastDateMap = {};

// 채팅방 렌더링 함수
async function loadChatRoom(chatNo) {
    try {
        chatViewContainer.innerHTML = `
            <div class="message-area">
                <ul class="message-list">
                    <li class="no-message"><p>💬 채팅방 로딩 중...</p></li>
                </ul>
            </div>
        `;

        const response = await fetch(`/chat/detail/${chatNo}`);
        if (!response.ok) throw new Error("서버 응답 오류");

        const data = await response.json();
        const chatInfo = data.chatInfo;
        const messages = data.messages;
        const loginUserNo = data.loginUser.userNo;

        // 채팅방 HTML 전체 렌더링
        chatViewContainer.innerHTML = `
            <div class="chat-header text-20px">
                <span>${chatInfo.nickname || "이름 없음"}</span>
                <button class="icon-button">☰</button>
            </div>
            <div class="product-bar">
                <img src="${chatInfo.imageUrl || ''}" class="product-image">
                <div class="product-info">
                    <div class="product-name">${chatInfo.name || ''}</div>
                    <div class="product-price">${chatInfo.price ? chatInfo.price + "원" : ''}</div>
                </div>
            </div>
            <div class="message-area">
                <ul class="message-list">
                    ${messages.length > 0
                        ? messages.map(msg => {
                            const time = msg.timestamp.split('T')[1].slice(0,5);
                            return msg.senderNo == loginUserNo
                                ? `<li class="message"><div class="timestamp">${time}</div><div class="message-bubble">${msg.message}</div></li>`
                                : `<li class="received"><div class="message-bubble">${msg.message}</div><div class="timestamp">${time}</div></li>`;
                          }).join('')
                        : `<li class="no-message"><p>💬 채팅을 시작해주세요!</p></li>`
                    }
                </ul>
            </div>
            <div class="input-area">
                <button class="icon-button">+</button>
                <input type="text" class="message-input" placeholder="메시지를 입력하세요.">
                <button class="send-button">➤</button>
            </div>
        `;

        history.replaceState(null, '', `/chat/chatRoom/${chatNo}`);

        // 기존 WebSocket 종료
        if (socket && socket.readyState === WebSocket.OPEN) {
            console.log("⚠️ 기존 WebSocket 연결 종료");
            socket.close();
        }

        // LAN IP 기반 WebSocket 연결
        const serverIp = location.hostname;
        const serverPort = 9090;
        console.log(`🌐 WebSocket 연결 시도: ws://${serverIp}:${serverPort}/ws/chat?chatNo=${chatNo}`);
        
		socket = new WebSocket(`ws://${serverIp}:${serverPort}/ws/chat?chatNo=${chatNo}&userNo=${loginUserNo}`);


        lastDateMap[chatNo] = null;

        const messageList = chatViewContainer.querySelector('.message-list');
        const sendButton = chatViewContainer.querySelector('.send-button');
        const messageInput = chatViewContainer.querySelector('.message-input');

        socket.onopen = () => console.log("✅ WebSocket 연결 성공");

        socket.onmessage = (event) => {
            console.log("📩 메시지 수신:", event.data);
            const msg = JSON.parse(event.data);
            const dateObj = new Date(msg.timestamp);
            const currentDate = dateObj.toISOString().split('T')[0];
            const formattedDate = dateObj.toLocaleDateString('ko-KR', { year:'numeric', month:'long', day:'numeric' });

            if (lastDateMap[chatNo] !== currentDate) {
                messageList.insertAdjacentHTML('beforeend', `<li class="date-divider">${formattedDate}</li>`);
                lastDateMap[chatNo] = currentDate;
            }

            const time = msg.timestamp.split('T')[1].slice(0,5);
            const noMessageEl = messageList.querySelector('.no-message');
            if (noMessageEl) noMessageEl.remove();

            const newMsgHTML = msg.senderNo == loginUserNo
                ? `<li class="message"><div class="timestamp">${time}</div><div class="message-bubble">${msg.message}</div></li>`
                : `<li class="received"><div class="message-bubble">${msg.message}</div><div class="timestamp">${time}</div></li>`;

            messageList.insertAdjacentHTML('beforeend', newMsgHTML);
            messageList.scrollTop = messageList.scrollHeight;
        };

        socket.onerror = (error) => console.error("❌ WebSocket 에러 발생:", error);

        socket.onclose = (event) => console.log(`⚠️ WebSocket 종료 (code: ${event.code}, reason: ${event.reason})`);

        // send 버튼 이벤트
        if (!sendButton.dataset.listener) {
            sendButton.addEventListener('click', () => {
                const message = messageInput.value.trim();
                if (!message) return;

                const chatData = {
                    chatNo: chatInfo.chatNo,
                    senderNo: loginUserNo,
                    message: message,
                    timestamp: new Date().toISOString()
                };

                if (socket.readyState === WebSocket.OPEN) {
                    console.log("📤 메시지 전송:", chatData);
                    socket.send(JSON.stringify(chatData));
                } else {
                    console.warn("⚠️ WebSocket 연결이 열려있지 않아 메시지 전송 실패");
                }

                messageInput.value = '';
            });
            sendButton.dataset.listener = true;
        }

    } catch (error) {
        console.error("채팅방 로드 중 오류:", error);
        alert("채팅방 정보를 불러오지 못했습니다.");
    }
}

// 채팅방 클릭 이벤트
if (chatListContainer != null) {
    chatListContainer.addEventListener('click', (e) => {
        const item = e.target.closest('.chat-item');
        if (!item) return;
        const chatNo = item.dataset.chatNo;
        loadChatRoom(chatNo);
    });
}

// URL 기반 채팅방 자동 로드
const pathMatch = location.pathname.match(/\/chat\/chatRoom\/(\d+)/);
if (pathMatch) {
    const chatNo = pathMatch[1];
    loadChatRoom(chatNo);
}
