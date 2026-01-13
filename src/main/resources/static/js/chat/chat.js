document.addEventListener('DOMContentLoaded', () => {
	
	function sendMessage(socket, chatInfo, loginUserNo, messageInput, messageList) {
	       const message = messageInput.value.trim();
	       if (!message) return;

	       const now = new Date();
	       const koreaTime = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (9 * 60 * 60000));
	       const formattedTime = koreaTime.toISOString();

	       const chatData = { chatNo: chatInfo.chatNo, senderNo: loginUserNo, message, timestamp: formattedTime };

	       if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(chatData));

	       const noMessageEl = messageList.querySelector('.no-message');
	       if (noMessageEl) noMessageEl.remove();

	       const time = new Date(chatData.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
	       const newMsgHTML = `<li class="message"><div class="timestamp">${time}</div><div class="message-bubble">${message}</div></li>`;
	       messageList.insertAdjacentHTML('beforeend', newMsgHTML);

	       scrollToBottom(messageList.closest('.chat-view-panel'));
	       updateChatList(chatInfo.chatNo);
	       messageInput.value = '';
	   }

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

	// 상품 디테일에서 "채팅하기" 버튼 클릭 시
	const sellerChatBtn = document.querySelector(".sellerChatBtn");

	if (sellerChatBtn) {
		sellerChatBtn.addEventListener("click", async () => {
			const productNo = document.querySelector("input[name='productNo']").value;

			try {
				const response = await fetch("/chat/createRoom", {
					method: "POST",
					headers: { "Content-Type": "application/x-www-form-urlencoded" },
					body: new URLSearchParams({ productNo }),
				});
				const data = await response.json();

				if (data.chatRoomId) {
					// ✅ 채팅방 재입장 또는 생성 성공 시

					const chatListContainer = document.querySelector(".chat-list");

					// 💡 [핵심 수정 로직] 좌측 채팅 리스트 갱신
					if (chatListContainer) {
						// 1. 좌측 채팅 리스트에 이미 존재하는지 확인
						let existingRoom = chatListContainer.querySelector(
							`[data-chat-no="${data.chatRoomId}"]`
						);

						// 2. 항목이 존재하지 않는다면 (나갔던 방이라 'N' 상태라 목록에 없었음) 새로 추가
						if (!existingRoom) {
							// chat.html 구조에 맞춰 li 태그로 생성
							const newChatItem = document.createElement("li");
							newChatItem.classList.add("chat-item");
							newChatItem.dataset.chatNo = data.chatRoomId;

							// 서버 응답 (data)의 최신 정보 사용
							newChatItem.innerHTML = `
						        <div class="avatar">👤</div>
						        <div class="chat-content">
						            <div class="user-name">${data.nickname || '상대방'}</div>
						            <div class="message-preview">대화 내용이 없습니다.</div> 
						        </div>
						        <div class="chat-meta">
						            <div class="timestamp"></div>
						            <img src="${data.imageUrl || '/img/default.png'}" class="thumbnail">
						        </div>
							`;

							chatListContainer.prepend(newChatItem); // 목록 맨 앞에 추가
							existingRoom = newChatItem; // 새로 만든 요소를 existingRoom에 할당하여 다음 로직에서 사용
						}

						// 3. (옵션) 이미 존재했던 방이라도, 목록의 가장 위로 옮깁니다. (최근 활동 방)
						if (existingRoom && existingRoom !== chatListContainer.firstElementChild) {
							chatListContainer.prepend(existingRoom);
						}
					}

					// ✅ 방 이동
					setTimeout(() => {
						window.location.href = `/chat/chatRoom/${data.chatRoomId}`;
					}, 300);
				} else if (data.noChat != null) {
					alert(data.noChat);
				}
				else {
					alert(data.message || "채팅방을 생성할 수 없습니다.");
				}
			} catch (err) {
				console.error("채팅방 생성 중 오류:", err);
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
					reportProduct(event);
					// showMessage('💬 신고 요청 완료');
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
			if ((loginUserNo == chatInfo.sellerNo && chatInfo.buyerStatus == 'Y') ||
				(loginUserNo == chatInfo.buyerNo && chatInfo.sellerStatus == 'Y')) {
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
							<div class="product-bar" id="product-bar">
								<img src="${chatInfo.imageUrl || ''}" class="product-image">
								<div class="product-info">
									<input type="hidden" id="productNo" value=${chatInfo.productNo}>
									<div class="product-name">${chatInfo.name || ''}</div>
									<div class="product-price">${chatInfo.price ? chatInfo.price + "원" : ''}</div>
								</div>
							</div>
							<div class="message-area">
							<ul class="message-list">
																${messages.length > 0
							? messages.map((msg, index, arr) => {
								// 이전 메시지의 timestamp를 가져옵니다.
								const prevTimestampStr = index > 0 ? arr[index - 1].timestamp : null;

								// 💡 수정: formatTimestamp 함수를 사용하여 시간 포맷 적용
								const formattedTime = formatTimestamp(msg.timestamp, prevTimestampStr);

								// 💡 수정: 현재 메시지와 이전 메시지의 날짜가 다를 경우에만 날짜 구분선 렌더링
								const currentDate = new Date(msg.timestamp).toISOString().split('T')[0];
								const prevDate = index > 0 ? new Date(arr[index - 1].timestamp).toISOString().split('T')[0] : null;
								const dateDividerHtml = (currentDate !== prevDate)
									? `<li class="date-divider">${new Date(msg.timestamp).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</li>`
									: '';

								// 💡 수정: <li class="message"> 내부의 timestamp 형식도 `time` 대신 `formattedTime`을 사용해야 하지만, 
								// 여기서는 기존 `loadChatRoom`의 `HH:mm` 형식을 유지하기 위해 `time`을 사용하고,
								// 날짜 구분선은 WebSocket 로직과 동일하게 날짜가 바뀔 때만 뜨도록 조정합니다. (기존 Thymeleaf와 동작 유사)
								const time = new Date(msg.timestamp).toLocaleTimeString('ko-KR', {
									hour: '2-digit',
									minute: '2-digit',
									hour12: false
								});

								return `
							                                        ${dateDividerHtml}
							                                        ${msg.senderNo == loginUserNo
										? `<li class="message"><div class="timestamp" data-timestamp="${msg.timestamp}">${time}</div><div class="message-bubble">${msg.message}</div></li>`
										: `<li class="received"><div class="message-bubble">${msg.message}</div><div class="timestamp" data-timestamp="${msg.timestamp}">${time}</div></li>`
									}`;
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
			} else {
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
	
				            <div class="product-bar" id="product-bar">
				                <img src="${chatInfo.imageUrl || ''}" class="product-image">
				                <div class="product-info">
				                    <input type="hidden" id="productNo" value=${chatInfo.productNo}>
				                    <div class="product-name">${chatInfo.name || ''}</div>
				                    <div class="product-price">${chatInfo.price ? chatInfo.price + "원" : ''}</div>
				                </div>
				            </div>
	
				            <div class="message-area">
				                <ul class="message-list">
				                    ${messages.length > 0
							? messages.map(msg => {
								const time = new Date(msg.timestamp).toLocaleTimeString('ko-KR', {
									hour: '2-digit',
									minute: '2-digit',
									hour12: false
								});
								return msg.senderNo == loginUserNo
									? `<li class="message"><div class="timestamp">${time}</div><div class="message-bubble">${msg.message}</div></li>`
									: `<li class="received"><div class="message-bubble">${msg.message}</div><div class="timestamp">${time}</div></li>`;
							}).join('')
							: `<li class="no-message"><p>💬 채팅을 시작해주세요!</p></li>`
						}
	

				                    <li class="system-message">
				                        <p>⚠ 상대방이 채팅방을 나갔습니다.</p>
				                    </li>
				                </ul>
				            </div>
	

				            <div class="input-area">
				                <button class="icon-button" disabled>+</button>
				                <input type="text" class="message-input" 
				                    placeholder="상대방이 채팅방을 나갔습니다." disabled>
				                <button class="send-button" disabled>➤</button>
				            </div>
				        `;

					attachDropdownListeners(chatViewContainer);
				}
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

			const protocol = location.protocol === "https:" ? "wss:" : "ws:";
			socket = new WebSocket(`${protocol}//${serverIp}:${serverPort}/ws/chat?chatNo=${chatNo}&userNo=${loginUserNo}`);



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

				const time = new Date(msg.timestamp).toLocaleTimeString('ko-KR', {
					hour: '2-digit',
					minute: '2-digit',
					hour12: false
				});
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
			
			// sendButton / Enter 이벤트
            sendButton.addEventListener('click', () => sendMessage(socket, chatInfo, loginUserNo, messageInput, messageList));
            messageInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') { 
					e.preventDefault(); 
					sendMessage(socket, chatInfo, loginUserNo, messageInput, messageList); 
				}
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

	document.addEventListener('click', (event) => {
		// 클릭된 요소부터 상위로 탐색하여 가장 가까운 #product-bar 요소를 찾습니다.
		const productBar = event.target.closest('#product-bar');

		if (productBar) {
			// #product-bar 내부의 #productNo input을 찾습니다.
			// productNo input이 <div class="product-info"> 안에 있으므로 
			// productBar.querySelector("#productNo")로 접근 가능합니다.
			const product = productBar.querySelector("#productNo");

			if (product) {
				const productNo = product.value;

				console.log('✅ productBar 클릭 - 이벤트 위임'); // 이 콘솔이 찍히는지 확인하세요!

				if (productNo?.trim()) {
					location.href = `/product/detail/${productNo}`;
				} else {
					// showAlert 함수가 있다면 사용하거나, alert 사용
					alert("상품 번호를 확인할 수 없습니다.");
				}
			}
		}
	});
	
	
});

async function updateChatList(targetChatNo) {
	const chatListPanel = document.querySelector('.chat-list-panel'); // 좌측 전체 패널
	const chatListContainer = document.querySelector('.chat-list'); // <ul class="chat-list">

	if (!chatListPanel || !chatListContainer) return;

	try {
		const response = await fetch("/chat/api/chatList");
		const data = await response.json();

		if (data.success) {
			// Thymeleaf Fragment를 사용하지 않는다면, JS에서 목록 HTML을 생성해야 합니다.
			// 여기서는 목록 HTML을 JS에서 직접 생성하는 방식으로 구현합니다.
			let newHtml = '';

			// 받은 리스트를 순회하며 <li> 항목을 생성합니다.
			if (data.chatList && data.chatList.length > 0) {
				/*				data.chatList.sort((a, b) => {
									const lastMsgA = data.lastChat[a.chatNo];
									const lastMsgB = data.lastChat[b.chatNo];
				
									const timeA = lastMsgA ? new Date(lastMsgA.timestamp).getTime() : 0;
									const timeB = lastMsgB ? new Date(lastMsgB.timestamp).getTime() : 0;
				
									return timeB - timeA; // 최신 메시지 먼저
								});*/

				let lastChatTimestamp = null;

				data.chatList.forEach(chat => {
					const lastMsg = data.lastChat[chat.chatNo];
					const msgPreview = lastMsg ? (lastMsg.message.length > 11 ? lastMsg.message.substring(0, 11) + '...' : lastMsg.message) : '대화 내용이 없습니다.';

					let timestampText = '';
					let currentTimestamp = lastMsg ? lastMsg.timestamp : null;

					if (currentTimestamp) {
						// 💡 수정: formatTimestamp 함수를 사용하여 시간 포맷 적용
						// lastChatTimestamp는 이전 방의 최종 메시지 시간이므로, 여기서는 단순히 현재 시간만 표시하는 로직을 사용합니다.
						// (채팅 목록에서는 날짜 비교 없이 단순히 오늘/어제 구분만 하는 경우가 많습니다. '년월일 시간' 포맷 요구에 따라 `formatTimestamp`를 사용해 현재 방의 최종 시간만 포맷합니다.)

						const timestamp = new Date(currentTimestamp);
						const now = new Date();
						const isToday = timestamp.toDateString() === now.toDateString();

						if (isToday) {
							// 오늘: 시간만 (오후 03:54)
							timestampText = timestamp.toLocaleTimeString('ko-KR', {
								hour: '2-digit',
								minute: '2-digit',
								hour12: true
							});
						} else {
							// 오늘 아님: 년월일 시간 (2025-11-27 23:16)
							const datePart = timestamp.toLocaleDateString('ko-KR', {
								year: 'numeric',
								month: '2-digit',
								day: '2-digit'
							}).replace(/\./g, '-').slice(0, -1);

							const timePart = timestamp.toLocaleTimeString('ko-KR', {
								hour: '2-digit',
								minute: '2-digit',
								hour12: false // 24시간 형식
							});

							timestampText = `${datePart} ${timePart}`;
						}
					}

					const activeClass = chat.chatNo == targetChatNo ? 'active' : '';

					newHtml += `
							            <li class="chat-item ${activeClass}" data-chat-no="${chat.chatNo}">
							                <div class="avatar">👤</div>
							                <div class="chat-content">
							                    <div class="user-name">${chat.nickname}</div>
							                    <div class="message-preview">${msgPreview}</div>
							                </div>
							                <div class="chat-meta">
							                    <div class="timestamp" data-timestamp="${currentTimestamp || ''}">${timestampText}</div>
							                    <img src="${chat.imageUrl || '/img/default.png'}" class="thumbnail">
							                </div>
							            </li>
							        `;

					// 다음 방을 위해 현재 시간 저장 (채팅 목록 순서 정렬을 위한 시간 추적 아님)
					lastChatTimestamp = currentTimestamp;
				});
			}


			chatListContainer.innerHTML = newHtml;

			// 목록 갱신 후, 새로 생성된 채팅방으로 이동
		} else {
			console.error("채팅 목록을 불러오는 데 실패했습니다.");
		}
	} catch (e) {
		console.error("AJAX 오류:", e);
	}
}



// 날짜를 원하는 형식으로 포맷하는 함수
function formatTimestamp(timestampStr, lastTimestampStr) {
	if (!timestampStr) return '';

	const timestamp = new Date(timestampStr);
	const lastTimestamp = lastTimestampStr ? new Date(lastTimestampStr) : null;

	// 시간 (HH:mm) 포맷
	const timeOnly = timestamp.toLocaleTimeString('ko-KR', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: false // 24시간 형식 (loadChatRoom과 통일)
	});

	// 날짜 (yyyy-MM-dd) 포맷
	const dateOnly = timestamp.toLocaleDateString('ko-KR', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	}).replace(/\./g, '-').slice(0, -1); // 2025-11-27 형식

	if (lastTimestamp && dateOnly === lastTimestamp.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\./g, '-').slice(0, -1)) {
		// 날짜가 같으면 시간만 반환
		return timeOnly;
	} else {
		// 날짜가 다르면 년월일 시간 반환
		return `${dateOnly} ${timeOnly}`;
	}
}

// 모달 열기
function reportProduct() {
    const modal = document.getElementById('reportModal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
}

// 모달 닫기
function closeReportModal() {
    const modal = document.getElementById('reportModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // 배경 스크롤 허용
    document.getElementById('reportForm').reset(); // 폼 초기화
}

// 신고 제출 처리
function submitReport(event) {
    event.preventDefault();
    

		
	//상품 번호
	const productNo = document.getElementById('productNo');
	
	//채팅 번호(없을 수도 있음)
	// 1. 현재 브라우저 주소(URL)에서 chatNo를 직접 꺼내옵니다.
	// 예: 주소가 /chat/chatRoom/15 라면 "15"를 가져옴
	const pathMatch = location.pathname.match(/\/chat\/chatRoom\/(\d+)/);
	const chatNo = pathMatch ? pathMatch[1] : null;		
	
	//신고 카테고리
	const reason = document.querySelector('input[name="reportReason"]:checked').value;
	
	//신고 내용
	const detail = document.getElementById('reportDetail').value;
	
	//위배자는 채팅 번호를 넘겨 AdminController에서 처리

    fetch('/admin/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            productNo: productNo,
			chatNo : chatNo,
            reason: reason,
            detail: detail
        })
    }).then(res => {
        if(res.ok) {
            alert('신고가 성공적으로 접수되었습니다.');
            closeReportModal();
        }
    });

    alert(`신고가 접수되었습니다.\n사유: ${reason}\n내용: ${detail}`);
    closeReportModal();
}

// 모달 바깥 영역 클릭 시 닫기
window.onclick = function(event) {
    const modal = document.getElementById('reportModal');
    if (event.target == modal) {
        closeReportModal();
    }
}



