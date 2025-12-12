// 모달 오픈 
const modal = document.getElementById('loginModal');
const loginBtn = document.getElementById('loginButton');
const logoutBtn = document.getElementById('logoutButton');
if (loginBtn) {
	loginBtn.addEventListener('click', (e) => {
		e.preventDefault();
		modal.style.display = 'block';
	});
}


window.addEventListener('click', (e) => {

	if (e.target == modal) {
		modal.style.display = 'none';
	}
});
if (logoutBtn) {
	logoutBtn.addEventListener('click', () => {
		console.log('로그아웃 클릭');
		location.href = "/user/logout";

	});
}

const loginForm = document.querySelector('.login-form');
const signUpBtn = document.querySelector('.login-btn');
signUpBtn.addEventListener('click', () => {
	console.log('click');
	loginForm.submit();
});


// '키보드' 이벤트 리스너: 엔터키 입력 시 폼 제출
loginForm.addEventListener('keypress', (event) => {
	// 사용자가 누른 키가 'Enter'인지 확인
	if (event.key === 'Enter') {
		console.log('엔터키 입력');
		loginForm.submit();
	}
});

// 카카오 로그인
const kakaoBtn = document.querySelector('.kakao_button');

kakaoBtn.addEventListener('click', async () => {
	try {
		const response = await fetch("/auth/kakao/auth-url");
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const data = await response.text();
		window.location.href = data; // 카카오 인증 페이지로 이동
	} catch (error) {
		alert("카카오 로그인 URL을 가져오는 데 실패했습니다!");
		console.error(error);
	}
});

// 구글 로그인 버튼
const googleBtn = document.querySelector('.google_button'); // id면 # 붙여야 해요!

googleBtn.addEventListener('click', () => {
	window.location.href = "/auth/google/auth-url";
});

document.addEventListener('DOMContentLoaded', () => {
	if (document.getElementById('logoutButton')) { // 로그인 상태 확인을 위한 임시 DOM 요소
		myReviewState();
		updateNotificationBadge();
	}
});

async function myReviewState() {
	try {
		const res = await fetch(`/common/myReviewState`)

		if (!res.ok) {
			throw new Eerror(`오류 발생!`);
		}

		const reviewList = await res.json();

		console.log("서버에서 받은 리뷰 데이터:", reviewList);

		return reviewList;
	} catch {
		console.error("리뷰 상태를 가져오는 중 오류 발생:", error);
		return []; // 오류 발생 시 빈 배열 반환
	}
}

// 💡 페이지 로드 시 알림 뱃지 업데이트 함수
async function updateNotificationBadge() {
    const data = await myReviewState();
    const userNo = document.querySelector('#userNo')?.value;

    if (!userNo || !Array.isArray(data)) {
        console.warn("사용자 번호 또는 리뷰 데이터가 올바르지 않음");
        return;
    }

    const currentUserNo = String(userNo);

    // ✅ 조건문에 따라 표시될 알림만 필터링
    const filteredNotifications = data.filter(reviewItem => {
        const sellerMatch = String(reviewItem.sellerNo) === currentUserNo && reviewItem.reviewText != null;
        const buyerMatch = String(reviewItem.buyerNo) === currentUserNo && reviewItem.reviewText == null;
        return sellerMatch || buyerMatch;
    });

    // 실제 표시될 알림 개수만 카운트
    const unreadCount = filteredNotifications.length;

    const notificationBadge = document.getElementById('notificationBadge');

    if (notificationBadge) {
        if (unreadCount > 0) {
            notificationBadge.textContent = unreadCount > 99 ? '99+' : unreadCount;
            notificationBadge.style.display = 'block';
        } else {
            notificationBadge.style.display = 'none';
        }
    }
}



// 알림 개별 삭제
function removeNotification(btn) {
	btn.closest('li').remove();
}

// 닫기 버튼
document.getElementById('closeNotificationBtn').addEventListener('click', () => {
	document.getElementById('notificationModal').classList.add('hidden');
});


document.addEventListener('click', (e) => {
	const link = e.target.closest('#notificationLink');
	const userNo = document.querySelector('#userNo').value;



	if (link) {
		e.preventDefault();

		if (notificationModal) {
			notificationModal.classList.remove('hidden');
			notificationModal.style.display = 'flex';

			fetch(`/product/getReview`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				}
			})
				.then(response => {
					if (response.ok) {
						return response.json();
					}
					throw new Error('서버 통신 실패');
				})
				.then(data => {
					const reviewList = data;
					const currentUserNo = String(userNo); // userNo를 문자열로 통일하여 비교

					notificationList.innerHTML = ''; // 리스트 초기화

					// 🔔 데이터가 비어있을 때 알림
					if (reviewList.length === 0) {
						notificationList.innerHTML = '<li class="notification-empty-item">새로운 알림이 없습니다.</li>';
						return;
					}


					for (const reviewItem of reviewList) {
						let listItemHtml = '';

						// 1. 현재 사용자(currentUserNo)가 판매자일 때 (후기 도착 알림)
						if (String(reviewItem.sellerNo) === currentUserNo) {
							// reviewText가 있으면 후기 도착 알림
							if (reviewItem.reviewText != null) {
								const reviewerName = reviewItem.buyerNickname || `구매자(${reviewItem.buyerNo})`; // 닉네임 없을 시 대체

								listItemHtml = `
				                        <li class="notification-item type-review-received" data-review-no="${reviewItem.reviewNo}">
				                            <div class="notification-content">
				                                <div class="notification-left">
				                                    <p class="main-text fw-bold">
				                                        <span class="user-nickname">${reviewerName}</span>님이 보낸 후기가 도착했어요.
				                                    </p>
				                                </div>
				                                <div class="notification-right fw-regular">
                                                    <p class="detail-text">${reviewItem.reviewText}</p>
				                                </div>
				                            </div>
				                        </li>
				                    `;
							}
						}
						// 2. 현재 사용자(currentUserNo)가 구매자일 때 (거래 완료 및 후기 요청 알림)
						else if (String(reviewItem.buyerNo) === currentUserNo) {
							// reviewText가 아직 없으면 후기 요청 알림
							if (reviewItem.reviewText == null) {
								const sellerName = reviewItem.sellerNickname || `판매자(${reviewItem.sellerNo})`; // 닉네임 없을 시 대체

								listItemHtml = `
				                        <li class="notification-item type-transaction-complete" data-review-no="${reviewItem.reviewNo}">
				                            <div class="notification-content">
				                                <div class="notification-left">
				                                    <p class="main-text fw-bold">
				                                        <span class="user-nickname">${sellerName}</span>님과의 거래가 완료되었습니다.
				                                    </p>
				                                </div>
				                                <div class="notification-right">
                                                    <p class="detail-text buyer-prompt fw-regular">구매자로 선택되었습니다. 후기를 남겨주시면 서로에게 도움이 돼요!</p>
				                                </div>
				                            </div>
				                        </li>
				                    `;
							}
						}

						// 🚨 생성된 HTML을 리스트에 추가합니다.
						if (listItemHtml) {
							const tempDiv = document.createElement('div'); // 임시 div 사용
							tempDiv.innerHTML = listItemHtml.trim();
							// <li> 요소만 ul에 추가
							notificationList.appendChild(tempDiv.firstChild);
						}
					}
				})
				.catch(error => {
					console.error('알림 데이터 로드 중 에러 발생:', error);
					// 사용자에게 알림 목록을 불러오지 못했음을 알림
					notificationList.innerHTML = '<li>알림을 불러오는 데 실패했습니다.</li>';
				});
		}
	}

	// 🚨 모달 외부 클릭 시 닫기 로직 (추가된 코드)
	const closeBtn = e.target.closest('#closeNotificationBtn');
	if (closeBtn && notificationModal) {
		notificationModal.classList.add('hidden');
		notificationModal.style.display = 'none';
	}

	const isClickedOutside = notificationModal && !link && !e.target.closest('#notificationModal');
	if (isClickedOutside) {
		notificationModal.classList.add('hidden');
		notificationModal.style.display = 'none';
	}

	// 🚨 개별 알림 닫기 버튼 로직 (추가 권장)
	const closeItemBtn = e.target.closest('.close-notification-item');
	if (closeItemBtn) {
		// 해당 알림 항목을 DOM에서 제거
		closeItemBtn.closest('.notification-item').remove();
		// 필요하다면 서버에 해당 알림을 '읽음'으로 처리하는 AJAX 요청을 추가
	}

});

