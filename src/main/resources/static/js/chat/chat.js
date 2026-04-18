document.addEventListener('DOMContentLoaded', () => {

	function sendMessage(socket, chatInfo, loginUserNo, messageInput, messageList) {
		const message = messageInput.value.trim();
		if (!message) return;

		const now = new Date();
		const formattedTime = now.toISOString();

		const displayTime = now.toLocaleTimeString('ko-KR', {
			hour: '2-digit', minute: '2-digit', hour12: false
		});

		const myMsgHTML = `
	        <li class="message my-temp-msg" data-timestamp="${formattedTime}">
	            <div class="timestamp">${displayTime}</div>
	            <div class="message-bubble">${message}</div>
	        </li>
	    `;

		const noMessageEl = messageList.querySelector('.no-message');
		if (noMessageEl) noMessageEl.remove();

		messageList.insertAdjacentHTML('beforeend', myMsgHTML);
		scrollToBottom();

		const chatData = {
			chatNo: chatInfo.chatNo,
			senderNo: loginUserNo,
			message,
			timestamp: formattedTime
		};

		if (socket.readyState === WebSocket.OPEN) {
			socket.send(JSON.stringify(chatData));
		}

		messageInput.value = '';
	}

	function getCurrentChatNoFromUrl() {
		const pathMatch = location.pathname.match(/\/chat\/chatRoom\/(\d+)/);
		if (pathMatch && pathMatch[1]) {
			return pathMatch[1];
		}
		return null;
	}

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
					const chatListContainer = document.querySelector(".chat-list");

					if (chatListContainer) {
						let existingRoom = chatListContainer.querySelector(
							`[data-chat-no="${data.chatRoomId}"]`
						);

						if (!existingRoom) {
							const newChatItem = document.createElement("li");
							newChatItem.classList.add("chat-item");
							newChatItem.dataset.chatNo = data.chatRoomId;

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

							chatListContainer.prepend(newChatItem);
							existingRoom = newChatItem;
						}

						if (existingRoom && existingRoom !== chatListContainer.firstElementChild) {
							chatListContainer.prepend(existingRoom);
						}
					}

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
			}
		});
	}

	const chatViewContainer = document.querySelector('.chat-view-panel');
	const chatListContainer = document.querySelector('.chat-list');
	let socket = null;
	let lastDateMap = {};

	function scrollToBottom() {
		const messageArea = chatViewContainer.querySelector('.message-area');
		if (!messageArea) return;

		requestAnimationFrame(() => {
			messageArea.scrollTop = messageArea.scrollHeight;
		});
	}

	async function leaveChatRoom(chatNo) {
		try {
			const response = await fetch(`/chat/leave/${chatNo}`, {
				method: 'POST',
				credentials: 'same-origin'
			});

			if (!response.ok) {
				throw new Error();
			}

			const result = await response.json();

			if (result.success) {
				showMessage('✅ 채팅방에서 나갔습니다. 목록으로 돌아갑니다.');

				setTimeout(() => {
					location.href = '/chat/chatRoom';
				}, 1000);

			} else {
				showMessage(`❌ 채팅방 나가기 실패`);
			}

		} catch (error) {
			showMessage("❌ 채팅방 나가기 중 예상치 못한 오류가 발생했습니다.");
		}
	}
	function attachDropdownListeners(container) {
		const newToggleButton = container.querySelector('#toggleButton');
		const newDropdownMenu = container.querySelector('#dropdownMenu');

		if (newToggleButton && newDropdownMenu) {
			newToggleButton.addEventListener('click', (event) => {
				event.stopPropagation();
				newDropdownMenu.classList.toggle('active');
			});

			newDropdownMenu.addEventListener('click', (event) => {
				const menuItem = event.target.closest('.menu-item');
				if (!menuItem) return;

				const action = menuItem.dataset.action;
				if (action === 'report') {
					reportProduct(event);
				} else if (action === 'leave') {
					const result = confirm("정말 채팅방을 나가시겠어요?(채팅방을 나갈 시 기록이 삭제됩니다.)");
					if (result) {
						const currentChatNo = getCurrentChatNoFromUrl();
						if (currentChatNo) {
							leaveChatRoom(currentChatNo);
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

	async function loadChatRoom(chatNo) {
		try {
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
			if (!response.ok) throw new Error();

			const data = await response.json();
			const chatInfo = data.chatInfo;
			const messages = data.messages;
			const loginUserNo = data.loginUser.userNo;

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
							const prevTimestampStr = index > 0 ? arr[index - 1].timestamp : null;

							const formattedTime = formatTimestamp(msg.timestamp, prevTimestampStr);

							const currentDate = new Date(msg.timestamp).toISOString().split('T')[0];
							const prevDate = index > 0 ? new Date(arr[index - 1].timestamp).toISOString().split('T')[0] : null;
							const dateDividerHtml = (currentDate !== prevDate)
								? `<li class="date-divider">${new Date(msg.timestamp).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</li>`
								: '';

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
			scrollToBottom();

			history.replaceState(null, '', `/chat/chatRoom/${chatNo}`);

			if (socket && socket.readyState === WebSocket.OPEN) {
				socket.close();
			}

			let wsUrl;

			const protocol = location.protocol === "https:" ? "wss:" : "ws:";

			if (location.hostname === "localhost") {
				wsUrl = `${protocol}//localhost:9090/ws/chat?chatNo=${chatNo}&userNo=${loginUserNo}`;
			} else {
				wsUrl = `${protocol}//${location.host}/ws/chat?chatNo=${chatNo}&userNo=${loginUserNo}`;
			}


			socket = new WebSocket(wsUrl);




			lastDateMap[chatNo] = null;

			const messageList = chatViewContainer.querySelector('.message-list');
			const sendButton = chatViewContainer.querySelector('.send-button');
			const messageInput = chatViewContainer.querySelector('.message-input');


			socket.onopen = () => {};

			socket.onmessage = (event) => {
				const msg = JSON.parse(event.data);
				const dateObj = new Date(msg.timestamp);
				const currentDate = dateObj.toISOString().split('T')[0];
				const formattedDate = dateObj.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

				if (msg.senderNo == loginUserNo) {
					const tempMsg = messageList.querySelector(`.my-temp-msg[data-timestamp="${msg.timestamp}"]`);
					if (tempMsg) {
						tempMsg.classList.remove('my-temp-msg');
						return;
					}
				}

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

				scrollToBottom();


			};

			socket.onerror = (error) => {};

			socket.onclose = (event) => {};

			sendButton.addEventListener('click', () => sendMessage(socket, chatInfo, loginUserNo, messageInput, messageList));
			messageInput.addEventListener('keydown', (e) => {
				if (e.key === 'Enter') {
					e.preventDefault();
					sendMessage(socket, chatInfo, loginUserNo, messageInput, messageList);
				}
			});


		} catch (error) {
			alert("채팅방 정보를 불러오지 못했습니다.");
		}
	}

	if (chatListContainer != null) {
		chatListContainer.addEventListener('click', (e) => {
			const item = e.target.closest('.chat-item');
			if (!item) return;
			const chatNo = item.dataset.chatNo;
			loadChatRoom(chatNo);
		});
	}

	const pathMatch = location.pathname.match(/\/chat\/chatRoom\/(\d+)/);
	if (pathMatch) {
		const chatNo = pathMatch[1];
		loadChatRoom(chatNo);
	}

	const initialChatViewPanel = document.querySelector('.chat-view-panel');
	if (initialChatViewPanel && initialChatViewPanel.querySelector('#toggleButton')) {
		attachDropdownListeners(initialChatViewPanel);
	}

	document.addEventListener('click', (event) => {
		const currentDropdownMenu = document.getElementById('dropdownMenu');
		const currentToggleButton = document.getElementById('toggleButton');

		if (!currentDropdownMenu || !currentToggleButton) return;

		if (!currentDropdownMenu.classList.contains('active')) return;

		const isClickInside = currentToggleButton.contains(event.target) || currentDropdownMenu.contains(event.target);
		if (!isClickInside) currentDropdownMenu.classList.remove('active');
	});

	document.addEventListener('keydown', (event) => {
		const currentDropdownMenu = document.getElementById('dropdownMenu');
		if (currentDropdownMenu && event.key === 'Escape') currentDropdownMenu.classList.remove('active');
	});



	function showMessage(text, duration = 3000) {
		const messageBox = document.getElementById('messageBox');
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
		const productBar = event.target.closest('#product-bar');

		if (productBar) {
			const product = productBar.querySelector("#productNo");

			if (product) {
				const productNo = product.value;

				if (productNo?.trim()) {
					location.href = `/product/detail/${productNo}`;
				} else {
					alert("상품 번호를 확인할 수 없습니다.");
				}
			}
		}
	});


});

async function updateChatList(targetChatNo) {
	const chatListPanel = document.querySelector('.chat-list-panel');
	const chatListContainer = document.querySelector('.chat-list');

	if (!chatListPanel || !chatListContainer) return;

	try {
		const response = await fetch("/chat/api/chatList");
		const data = await response.json();

		if (data.success) {
			let newHtml = '';

			if (data.chatList && data.chatList.length > 0) {

				let lastChatTimestamp = null;

				data.chatList.forEach(chat => {
					const lastMsg = data.lastChat[chat.chatNo];
					const msgPreview = lastMsg ? (lastMsg.message.length > 11 ? lastMsg.message.substring(0, 11) + '...' : lastMsg.message) : '대화 내용이 없습니다.';

					let timestampText = '';
					let currentTimestamp = lastMsg ? lastMsg.timestamp : null;

					if (currentTimestamp) {

						const timestamp = new Date(currentTimestamp);
						const now = new Date();
						const isToday = timestamp.toDateString() === now.toDateString();

						if (isToday) {
							timestampText = timestamp.toLocaleTimeString('ko-KR', {
								hour: '2-digit',
								minute: '2-digit',
								hour12: true
							});
						} else {
							const datePart = timestamp.toLocaleDateString('ko-KR', {
								year: 'numeric',
								month: '2-digit',
								day: '2-digit'
							}).replace(/\./g, '-').slice(0, -1);

							const timePart = timestamp.toLocaleTimeString('ko-KR', {
								hour: '2-digit',
								minute: '2-digit',
								hour12: false
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

					lastChatTimestamp = currentTimestamp;
				});
			}


			chatListContainer.innerHTML = newHtml;

		} else {
		}
	} catch (e) {
	}
}



function formatTimestamp(timestampStr, lastTimestampStr) {
	if (!timestampStr) return '';

	const timestamp = new Date(timestampStr);
	const lastTimestamp = lastTimestampStr ? new Date(lastTimestampStr) : null;

	const timeOnly = timestamp.toLocaleTimeString('ko-KR', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: false
	});

	const dateOnly = timestamp.toLocaleDateString('ko-KR', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	}).replace(/\./g, '-').slice(0, -1);

	if (lastTimestamp && dateOnly === lastTimestamp.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\./g, '-').slice(0, -1)) {
		return timeOnly;
	} else {
		return `${dateOnly} ${timeOnly}`;
	}
}


function reportProduct() {
	const modal = document.getElementById('reportModal');
	if(modal) {
		modal.style.display = 'flex';
		document.body.style.overflow = 'hidden';
	}
}

function closeReportModal() {
	const modal = document.getElementById('reportModal');
	if(modal) {
		modal.style.display = 'none';
		document.body.style.overflow = 'auto';
		const form = document.getElementById('reportForm');
		if(form) form.reset();
	}
}

function submitReport(event) {
	event.preventDefault();

	const productNoEl = document.getElementById('productNo');
	const productNo = productNoEl ? productNoEl.value : null;

	if (!productNo) {
		alert("상품 번호를 확인할 수 없습니다.");
		return;
	}

	const pathMatch = location.pathname.match(/\/chat\/chatRoom\/(\d+)/);
	const chatNo = pathMatch ? pathMatch[1] : null;

	const checkedReason = document.querySelector('input[name="reportReason"]:checked');
	const reason = checkedReason ? checkedReason.value : '';

	const detailEl = document.getElementById('reportDetail');
	const detail = detailEl ? detailEl.value : '';

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
		if (!res.ok) {
			throw new Error(`HTTP Error: ${res.status}`);
		}
		return res.text(); // JSON 파싱 에러 원천 차단
	}).then(text => {
		const data = parseInt(text.trim(), 10);

		if (data === 1) {
			alert("신고가 정상적으로 접수되었습니다.");
			closeReportModal();
		} else if (data === 2) {
			alert("이미 해당 사용자를 신고하셨습니다.");
			closeReportModal();
		} else if (data === -1) {
			alert("로그인이 필요한 서비스입니다.");
		} else {
			// 이 메시지가 뜬다면 백엔드 쿼리/로직 에러입니다. (인텔리제이 콘솔창 확인 필요)
			alert("신고 처리 중 오류가 발생했습니다. (백엔드 로직 오류)");
		}
	})
		.catch(error => {
			console.error('Report Error:', error);
			// 이 메시지가 뜬다면 URL 접근이 막혔거나 서버가 죽은 것입니다.
			alert("서버와 통신 중 오류가 발생했습니다. (네트워크/보안 차단)");
		});
}

window.addEventListener('click', function(event) {
	const modal = document.getElementById('reportModal');
	if (event.target == modal) {
		closeReportModal();
	}
});