document.addEventListener('DOMContentLoaded', () => {

	// url에서 현재 채팅방 가져오기
	function getCurrentChatNoFromUrl() {
		// 현재 URL에서 '/chat/chatRoom/숫자' 패턴을 찾습니다.
		const pathMatch = location.pathname.match(/\/chat\/chatRoom\/(\d+)/);

		// 패턴이 일치하면 캡처된 첫 번째 그룹(숫자, 즉 chatNo)을 반환합니다.
		if (pathMatch && pathMatch[1]) {
			return pathMatch[1];
		}
		return null; // 채팅방 번호를 찾지 못했을 경우
	}
	const sellerChatBtn = document.querySelector(".sellerChatBtn");
	// 초기 탐색된 변수(toggleButton, dropdownMenu)는
	// attachDropdownListeners 함수 사용으로 인해 사용되지 않지만 기존 코드를 유지합니다.
	/*const toggleButton = document.getElementById('toggleButton');
	const dropdownMenu = document.getElementById('dropdownMenu');*/

	if (sellerChatBtn != null) {
		sellerChatBtn.addEventListener("click", async () => {
			// alert() 사용 대신 모달/커스텀 UI 사용을 권장합니다.
			const productUserNo = document.getElementById("productUserNo").value;
			const loginUserNo = document.getElementById("loginUserNo").value;

			if (productUserNo == loginUserNo) {
				console.warn('자신과 대화 시도 감지: 사용자 번호 동일');
				// 임시 alert 사용
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

	// 메시지 목록의 스크롤을 항상 맨 아래로 내리는 함수 (개선)
	function scrollToBottom() {
		// 스크롤이 실제로 일어나는 DOM 요소는 .message-area입니다.
		const messageArea = chatViewContainer.querySelector('.message-area');
		if (!messageArea) return;

		// *DOM 업데이트가 끝난 후 스크롤을 실행하도록 보장*
		requestAnimationFrame(() => {
			messageArea.scrollTop = messageArea.scrollHeight;
		});
	}

	async function leaveChatRoom(chatNo) {
		try {

			// 실제 서버 엔드포인트와 HTTP 메서드를 사용하세요. (여기서는 POST /chat/leave/{chatNo} 가정)
			const response = await fetch(`/chat/leave/${chatNo}`, {
				method: 'POST',
				credentials: 'same-origin'
			});

			if (!response.ok) {
				console.error(`HTTP Error: ${response.status} - ${response.statusText}`);
				throw new Error(`서버 요청 실패 (상태 코드: ${response.status})`);
			}

			const result = await response.json(); // 서버 응답 (예: {success: true})

			if (result.success) { // 서버 응답이 성공이라고 가정
				showMessage('✅ 채팅방에서 나갔습니다. 목록으로 돌아갑니다.');

				// 성공 시 채팅방 목록 페이지로 이동
				setTimeout(() => {
					location.href = '/chat/chatRoom'; // 채팅 목록 URL로 변경하세요.
				}, 1000);

			} else {
				// 서버에서 나가기 실패 메시지를 보냈을 경우
				showMessage(`❌ 채팅방 나가기 실패: ${result.message || '알 수 없는 오류'}`);
			}

		} catch (error) {
			console.error("채팅방 나가기 중 오류:", error);
			showMessage("❌ 채팅방 나가기 중 예상치 못한 오류가 발생했습니다.");
		}
	}
	function attachDropdownListeners(container) {
		// container에서 동적으로 로드된 토글 버튼과 메뉴를 탐색
		const newToggleButton = container.querySelector('#toggleButton');
		const newDropdownMenu = container.querySelector('#dropdownMenu');

		if (newToggleButton && newDropdownMenu) {
			// 토글 버튼 리스너
			newToggleButton.addEventListener('click', (event) => {
				event.stopPropagation();
				newDropdownMenu.classList.toggle('active');
			});

			// 메뉴 항목 리스너 (기존 showMessage 함수 사용)
			newDropdownMenu.addEventListener('click', (event) => {
				const menuItem = event.target.closest('.menu-item');
				if (!menuItem) return;

				const action = menuItem.dataset.action;
				if (action === 'report') {
					showMessage('💬 신고 요청 완료');
				} else if (action === 'leave') {
					// 기존 로직과 동일하게 confirm 사용
					const result = confirm("정말 채팅방을 나가시겠어요?(채팅방을 나갈 시 기록이 삭제됩니다.)");
					if (result) {
						const currentChatNo = getCurrentChatNoFromUrl();
						if (currentChatNo) {
							console.log(`🚪 채팅방 나가기 요청 ChatNo: ${currentChatNo}`);
							leaveChatRoom(currentChatNo); // async 함수 호출
						} else {
							showMessage('❌ 채팅방 정보를 찾을 수 없습니다.');
						}
						showMessage('🚪 채팅방 나가기');
					} else {
						showMessage('🚪 채팅방 나가기를 취소합니다.')
					}
				}

				newDropdownMenu.classList.remove('active');
			});
		}
	}

	// 채팅방 렌더링 함수
	async function loadChatRoom(chatNo) {
		try {
			// 채팅방 로딩 중 메시지를 표시 (기존 로직 유지)
			if (chatViewContainer) {
				chatViewContainer.innerHTML = `
					<div class="message-area">
						<ul class="message-list">
							<li class="no-message"><p>💬 채팅방 로딩 중...</p></li>
						</ul>
					</div>
				`;
			}


			const response = await fetch(`/chat/detail/${chatNo}`);
			if (!response.ok) throw new Error("서버 응답 오류");

			const data = await response.json();
			const chatInfo = data.chatInfo;
			const messages = data.messages;
			const loginUserNo = data.loginUser.userNo;

			// 채팅방 HTML 전체 렌더링 (드롭다운 메뉴 HTML 추가)
			if (chatViewContainer) {
				chatViewContainer.innerHTML = `
					<div class="chat-header text-20px">
						<span>${chatInfo.nickname || "이름 없음"}</span>
						<button class="icon-button" id="toggleButton">☰</button>
						
						<div id="dropdownMenu"
							class="
								dropdown-menu
								absolute right-0 mt-2 w-48
								bg-white rounded-xl shadow-2xl
								ring-1 ring-black ring-opacity-5
								divide-y divide-gray-100
								origin-top-right
							"
							style="right: 24px; top: 76px; z-index: 50;" 
							role="menu" aria-orientation="vertical"
							aria-labelledby="toggleButton">

							<div class="py-1">
								<a href="#" data-action="report"
									class="
										menu-item block px-4 py-3 text-sm text-gray-700
										hover:bg-red-50 hover:text-red-600
										transition duration-100 ease-in-out
										rounded-t-xl
									"
									role="menuitem"> 신고하기 </a>

								<a href="#" data-action="leave"
									class="
										menu-item block px-4 py-3 text-sm text-gray-700
										hover:bg-red-50 hover:text-red-600
										transition duration-100 ease-in-out
										rounded-b-xl
									"
									role="menuitem"> 채팅방 나가기 </a>
							</div>
						</div>
						
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
							const time = msg.timestamp.split('T')[1].slice(0, 5);
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

				// **[수정]** 동적 로드 후 드롭다운 리스너 재부착
				attachDropdownListeners(chatViewContainer);
			}

			// 1. **(수정 포인트)** 채팅방 로드 후 스크롤
			// DOM 갱신 후 바로 스크롤
			scrollToBottom();

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
				const formattedDate = dateObj.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

				if (lastDateMap[chatNo] !== currentDate) {
					messageList.insertAdjacentHTML('beforeend', `<li class="date-divider">${formattedDate}</li>`);
					lastDateMap[chatNo] = currentDate;
				}

				const time = msg.timestamp.split('T')[1].slice(0, 5);
				const noMessageEl = messageList.querySelector('.no-message');
				if (noMessageEl) noMessageEl.remove();

				const newMsgHTML = msg.senderNo == loginUserNo
					? `<li class="message"><div class="timestamp">${time}</div><div class="message-bubble">${msg.message}</div></li>`
					: `<li class="received"><div class="message-bubble">${msg.message}</div><div class="timestamp">${time}</div></li>`;

				messageList.insertAdjacentHTML('beforeend', newMsgHTML);

				// 2. **(수정 포인트)** 메시지 수신 후 스크롤
				scrollToBottom();


			};

			socket.onerror = (error) => console.error("❌ WebSocket 에러 발생:", error);

			socket.onclose = (event) => console.log(`⚠️ WebSocket 종료 (code: ${event.code}, reason: ${event.reason})`);

			// send 버튼 이벤트
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

				const messageList = chatViewContainer.querySelector('.message-list');
				const time = new Date().toISOString().split('T')[1].slice(0, 5);
				const newMsgHTML = `<li class="message"><div class="timestamp">${time}</div><div class="message-bubble">${message}</div></li>`;

				// 내가 보낸 메시지는 onmessage가 아닌 여기서 바로 렌더링 해야 사용자 경험이 좋습니다.
				messageList.insertAdjacentHTML('beforeend', newMsgHTML);

				// 3. **(수정 포인트)** 메시지 전송 후 스크롤
				scrollToBottom();



				messageInput.value = '';
			});
		} catch (error) {
			console.error("채팅방 로드 중 오류:", error);
			alert("채팅방 정보를 불러오지 못했습니다.");
		}
	}

	// 채팅방 클릭 이벤트 (기존 로직 유지)
	if (chatListContainer != null) {
		chatListContainer.addEventListener('click', (e) => {
			const item = e.target.closest('.chat-item');
			if (!item) return;
			const chatNo = item.dataset.chatNo;
			loadChatRoom(chatNo);
		});
	}

	// URL 기반 채팅방 자동 로드 (기존 로직 유지)
	const pathMatch = location.pathname.match(/\/chat\/chatRoom\/(\d+)/);
	if (pathMatch) {
		const chatNo = pathMatch[1];
		loadChatRoom(chatNo);
	}

	// **[수정 및 통합]**
	// 초기 Thymeleaf 렌더링 시 드롭다운 리스너 부착 및 기존 중복 로직 제거
	const initialChatViewPanel = document.querySelector('.chat-view-panel');
	if (initialChatViewPanel && initialChatViewPanel.querySelector('#toggleButton')) {
		// Thymeleaf에 의해 렌더링된 요소에 리스너를 부착합니다.
		attachDropdownListeners(initialChatViewPanel);
	}

	document.addEventListener('click', (event) => {
		// 동적 로드된 요소도 여기서 닫힙니다.
		const currentDropdownMenu = document.getElementById('dropdownMenu');
		const currentToggleButton = document.getElementById('toggleButton');

		if (!currentDropdownMenu || !currentToggleButton) return;

		// 'active' 클래스가 있는지 확인하여 드롭다운이 열려있는지 판단
		if (!currentDropdownMenu.classList.contains('active')) return;

		const isClickInside = currentToggleButton.contains(event.target) || currentDropdownMenu.contains(event.target);
		if (!isClickInside) currentDropdownMenu.classList.remove('active');
	});

	document.addEventListener('keydown', (event) => {
		const currentDropdownMenu = document.getElementById('dropdownMenu');
		if (currentDropdownMenu && event.key === 'Escape') currentDropdownMenu.classList.remove('active');
	});



	function showMessage(text, duration = 3000) {
		const messageBox = document.getElementById('messageBox'); // ✅ 여기서 매번 새로 탐색
		if (!messageBox) return;

		messageBox.textContent = text;
		messageBox.classList.remove('opacity-0');
		messageBox.classList.add('opacity-100');

		setTimeout(() => {
			messageBox.classList.remove('opacity-100');
			messageBox.classList.add('opacity-0');
		}, duration);
	}
});