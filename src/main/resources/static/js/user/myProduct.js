let chatListModal;
let chatListContainer;
let closeModalBtn;
let confirmSelectionBtn;

document.addEventListener('DOMContentLoaded', () => {
	chatListModal = document.getElementById('chatListModal');
    chatListContainer = document.getElementById('chatListContainer');
    closeModalBtn = document.getElementById('closeModalBtn');
    confirmSelectionBtn = document.getElementById('confirmSelectionBtn');
    
    // 💡 초기 상태를 확실히 hidden으로 설정
    if (chatListModal) {
		chatListModal.classList.add('hidden');
	}

	// 날짜 / 위치 글자 포맷
	formatTimeAndLocation();

	// 상품 상태 필터
	setupTabs();

	// 더보기 버튼, 상품 상태변경 ajax
	setupMoreOptions();
	


	if (closeModalBtn) {
		closeModalBtn.addEventListener('click', () => {
			if (chatListModal) {
				chatListModal.classList.add('hidden');
				chatListModal.classList.remove('flex');
			}
		});
	}
});



function formatTimeAndLocation() {
	// 시간 n 일/시간/분 전
	const timeElements = document.querySelectorAll(".time-ago");
	timeElements.forEach(el => {
		const dateString = el.getAttribute("data-date");
		if (!dateString) return;
		const date = new Date(dateString);
		const now = new Date();
		const diffMinutes = Math.floor((now - date) / 60000);
		const diffHours = Math.floor(diffMinutes / 60);
		const diffDays = Math.floor(diffHours / 24);

		let result = "";
		if (diffMinutes < 1) result = "방금 전";
		else if (diffMinutes < 60) result = diffMinutes + "분 전";
		else if (diffHours < 24) result = diffHours + "시간 전";
		else result = diffDays + "일 전";
		el.textContent = result;
	});

	// 위치 (시/군/구 자르기)
	const locationItems = document.querySelectorAll(".location");
	locationItems.forEach(el => {
		const location = el.getAttribute("data-location");
		if (!location) return;
		const parts = location.split(" ");
		let endIndex = -1;
		parts.forEach((part, idx) => {
			if (part.endsWith("시") || part.endsWith("군") || part.endsWith("구")) endIndex = idx;
		});
		el.textContent = endIndex >= 0 ? parts.slice(0, endIndex + 1).join(" ") : location;
	});
}

function showChatListModal(chatList, productLink, newStatus) {
	
	if (!chatListContainer || !chatListModal) {
        console.error("모달 관련 DOM 요소를 찾을 수 없습니다. DOMContentLoaded 초기화 확인 필요.");
        return;
    }
	chatListContainer.innerHTML = ''; // 기존 리스트 초기화

	if (chatList.length === 0) {
		alert("관련된 채팅방이 없습니다. 상태 변경을 완료합니다.");
		finalizeStatusChange(productLink, newStatus);
		return;
	}

	chatList.forEach(chat => {
		// chat 객체는 { chatNo: 1, nickname: "판매자B", lastMessage: "..." } 형태라고 가정
		const listItem = document.createElement('li');
		listItem.className = 'flex items-center justify-between p-3 bg-gray-50 rounded-lg border';
		listItem.innerHTML = `
				            <div class="flex items-center space-x-3">
				                <input type="checkbox" 
				                       id="chat-${chat.chatNo}" 
				                       data-chat-no="${chat.chatNo}" 
				                       class="h-5 w-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500">
				                
									   <label for="chat-${chat.chatNo}" class="text-gray-800 font-medium flex items-center space-x-2">
		                                       <span class="font-bold text-gray-900">${chat.nickname}</span> 
		   				                </label>
				            </div>
				        `;
		chatListContainer.appendChild(listItem);
	});
	
	chatListModal.classList.remove('hidden');
	chatListModal.classList.add('flex'); // 중앙 정렬을 위해 flex로 변경
}

function setupTabs() {
	const tabs = document.querySelectorAll('.tab-item');
	const indicator = document.getElementById('tabIndicator');
	const productLinks = document.querySelectorAll('.product-link');
	const noResultMsg = document.getElementById('no-filter-result');

	function setIndicator(element) {
		if (!element || !indicator) return;
		indicator.style.width = element.offsetWidth + 'px';
		indicator.style.left = element.offsetLeft + 'px';
	}

	const activeTab = document.querySelector('.tab-item.active');
	if (activeTab) setIndicator(activeTab);

	tabs.forEach(tab => {
		tab.addEventListener('click', (e) => {
			const clickedTab = e.currentTarget;
			tabs.forEach(t => t.classList.remove('active'));
			clickedTab.classList.add('active');
			setIndicator(clickedTab);

			const filterType = clickedTab.dataset.filter;
			let visibleCount = 0;

			productLinks.forEach(link => {
				const productState = link.dataset.state;
				if (filterType === 'all' || productState === filterType) {
					link.style.display = '';
					visibleCount++;
				} else {
					link.style.display = 'none';
				}
			});

			if (noResultMsg) {
				noResultMsg.style.display = visibleCount === 0 ? 'block' : 'none';
			}
		});
	});

	window.addEventListener('resize', () => {
		const currentActive = document.querySelector('.tab-item.active');
		if (currentActive) setIndicator(currentActive);
	});
}

function finalizeStatusChange(productLink, newStatus) {
	// 1. UI 즉시 반영 (데이터 속성 업데이트)
	productLink.dataset.state = newStatus;

	// 2. 오버레이 닫기 (혹시 모르니 해당 상품의 오버레이를 닫음)
	const overlay = productLink.querySelector('.product-overlay');
	if (overlay) {
		overlay.style.display = 'none';
	}
	
	alert(`상품 상태가 ${newStatus === 'A' ? '판매중' : newStatus === 'R' ? '예약중' : '판매완료'}으로 변경되었습니다.`);
	
	// 3. 필터링 상태에 따라 목록 새로고침/숨김
	if (newStatus === 'S') {
		// 판매완료는 목록에서 사라져야 하므로 새로고침 또는 DOM 제거가 안전
		location.reload(); 
	} else {
		// 현재 활성화된 탭에 따라 상품 목록의 표시 여부를 재평가합니다.
		const activeTab = document.querySelector('.tab-item.active');
		const filterType = activeTab ? activeTab.dataset.filter : 'all';
		if (filterType !== 'all' && newStatus !== filterType) {
			productLink.style.display = 'none';
		}
	}
}

// 더보기 버튼 및 상태 변경  (AJAX 포함)
function setupMoreOptions() {

	// 오버레이 닫기 모션
	const closeOverlayWithAnimation = (overlay) => {
		const content = overlay.querySelector('.overlay-content');
		content.classList.add('closing');
		content.addEventListener('animationend', () => {
			overlay.style.display = 'none';      // 진짜 숨김
			content.classList.remove('closing'); // 다음을 위해 클래스 제거
		}, { once: true }); // 한 번만 실행되고 리스너 삭제
	};

	// 오버레이 열기
	const moreBtns = document.querySelectorAll('.more-option-btn');
	moreBtns.forEach(btn => {
		btn.addEventListener('click', (e) => {
			e.preventDefault(); // 페이지 이동 방지
			e.stopPropagation(); // 이벤트 전파 방지

			const productLink = btn.closest('.product-link');
			const overlay = productLink.querySelector('.product-overlay');
			const currentState = productLink.dataset.state; // 현재 상태 (A, R, S)

			// 버튼 상태 초기화 (빨간색 표시)
			const statusBtns = overlay.querySelectorAll('.status-btn');
			statusBtns.forEach(sBtn => {
				sBtn.classList.remove('current-status');
				sBtn.style.pointerEvents = 'auto'; // 다시 클릭 가능하게

				// 현재 상태와 버튼의 타입이 같으면 글짜 빨간색, 클릭방지
				if (sBtn.dataset.statusType === currentState) {
					sBtn.classList.add('current-status');
					sBtn.style.pointerEvents = 'none';
				}
			});

			overlay.style.display = 'flex'; // 오버레이 보이기
		});
	});

	// 닫기 버튼 클릭 -> 오버레이 닫기
	const closeBtns = document.querySelectorAll('.close-overlay-btn');
	closeBtns.forEach(btn => {
		btn.addEventListener('click', (e) => {
			e.preventDefault();
			e.stopPropagation();
			const overlay = btn.closest('.product-overlay');
			closeOverlayWithAnimation(overlay);
		});
	});

	// 오버레이 배경 클릭 시 닫기
	const overlays = document.querySelectorAll('.product-overlay');
	overlays.forEach(overlay => {
		overlay.addEventListener('click', (e) => {
			e.preventDefault();
			e.stopPropagation();
			if (e.target === overlay) { // 배경을 눌렀을 때만
				closeOverlayWithAnimation(overlay);
			}
		});
	});

	// 상태 변경 버튼 클릭 -> AJAX (주석)
	const statusBtns = document.querySelectorAll('.status-btn');
	statusBtns.forEach(btn => {
		btn.addEventListener('click', (e) => {
			e.preventDefault();
			e.stopPropagation();

			// ajax에 쓸 값
			const newStatus = btn.dataset.statusType; // 변경할 상태 (판중 A, 예약 R, 판완 S)
			const productLink = btn.closest('.product-link');
			const productNo = productLink.dataset.productNo; // 상품 번호

			// console.log(`[상태 변경 요청] 상품번호: ${productNo}, 변경할 상태: ${newStatus}`);


			fetch('/product/updateStatus', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					productNo: productNo,
					status: newStatus
				})
			})
				.then(response => {
					if (response.ok) {
						return response.json()
					}
					throw new Error('서버 통신 실패');
				})
				.then(data => {
					console.log("서버 응답:", data); // JSON 전체 구조 확인
					console.log('chatList: ' + data.data);
					alert('상품 상태가 변경되었습니다.');
					// 성공 시 UI 즉시 반영 = 데이터속성 업데이트
					productLink.dataset.state = newStatus;

					if (newStatus == 'S') {
						showChatListModal(data.data, productLink, newStatus);
					}

					// 오버레이 닫기
					const overlay = btn.closest('.product-overlay');
					overlay.style.display = 'none';






				})
				.catch(error => {
					console.error('에러 발생:', error);
					alert('상태 변경 중 오류가 발생했습니다.');
				});
		});
	});
}