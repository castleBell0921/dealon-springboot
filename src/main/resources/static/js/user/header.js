// 모달 오픈 
const modal = document.getElementById('loginModal');
const loginBtn = document.getElementById('loginButton');
const logoutBtn = document.getElementById('logoutButton');
let reviewNo = '';
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
	
function showMessage(text, duration = 3000) {
    const messageBox = document.getElementById('messageBox');
    if (!messageBox) return;

    // 메시지 텍스트 삽입
    messageBox.textContent = text;

    // '.show' 클래스 추가하여 나타나게 함
    messageBox.classList.add('show');

    // 지정된 시간 후 '.show' 클래스 제거하여 사라지게 함
    setTimeout(() => {
        messageBox.classList.remove('show');
    }, duration);
}


const stars = document.querySelectorAll('.star-container input');
const ratingValue = document.getElementById('ratingValue');

stars.forEach(star => {
	star.addEventListener('change', function() {
		ratingValue.value = this.value; // 선택한 별점 값 저장
	});
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
											<input type='hidden' value=${reviewItem.reviewNo} id='reviewNo'>
				                            <div class="notification-content">
				                                <div class="notification-left">
				                                    <p class="main-text fw-regular">
				                                        <span class="user-nickname">${reviewerName}</span>님이 보낸 <br/>후기가 도착했어요.
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
				                                    <p class="main-text fw-regular">
				                                        <span class="user-nickname">${sellerName}</span>님과의 거래가 <br/> 완료되었습니다.
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

	const clickedElement = e.target;

	// 🚨 1. 알림 항목(LI)을 찾기 위해 closest() 사용
	// '거래 완료 알림' 항목을 클릭했는지 확인합니다.
	const notificationItem = clickedElement.closest('.notification-item.type-transaction-complete');

	// 🚨 2. '후기 도착 알림' 항목을 클릭했는지 확인합니다.
	const reviewReceivedItem = clickedElement.closest('.notification-item.type-review-received');

	const reviewModal = document.querySelector('.review-modal-overlay');

	if (notificationItem || reviewReceivedItem) {
		// 상위 알림 항목에서 reviewNo와 상품 정보를 가져옵니다.
		const targetItem = notificationItem || reviewReceivedItem;
		reviewNo = targetItem.dataset.reviewNo;

		// 🚨 3. 모달에 데이터를 채우는 함수 호출
		if (reviewNo) {
			document.querySelector('#reviewNo').value = reviewNo;
			fetchReviewDetails(reviewNo, targetItem);
			reviewModal.style.display = 'flex'; // 모달 표시
		}
	}

	// 🚨 후기 모달 닫기 로직 추가
	const closeReviewBtn = e.target.closest('#closeReviewModalBtn');
	if (closeReviewBtn && reviewModal) {
		reviewModal.style.display = 'none';
	}

	// 🚨 후기 모달 외부 클릭 시 닫기 (추가)
	const isClickedOutsideReview = reviewModal && reviewModal.style.display === 'flex' &&
		!e.target.closest('.review-modal') && !e.target.closest('#notificationModal');
	if (isClickedOutsideReview) {
		reviewModal.style.display = 'none';
	}


	// 🚨 4. 리뷰 상세 정보를 서버에서 가져와 모달을 채우는 비동기 함수
	async function fetchReviewDetails(reviewNo, targetItem) {
		// 이 URL은 실제 서버의 API 엔드포인트에 맞게 조정해야 합니다.
		// 여기서는 상품 정보와 리뷰 데이터를 한 번에 가져오는 엔드포인트를 가정합니다.
		try {
			const response = await fetch(`/user/reviewDetails/${reviewNo}`);

			if (!response.ok) {
				throw new Error('리뷰 상세 정보를 가져오는 데 실패했습니다.');
			}

			const data = await response.json();

			const modalNickname = document.getElementById('reviewModalNickname');
			const modalSubText = document.getElementById('reviewModalSubText');
			const modalReviewText = document.getElementById('reviewText');

			if (modalNickname && modalSubText && modalReviewText) {
				// 🚨 데이터 채우기

				// 후기 작성자 닉네임 (판매자/구매자에 따라 다름)
				const nickname = data.sellerNickname || '사용자';

				// 거래 상품 이름
				const productName = data.name || '거래 상품';

				modalNickname.textContent = nickname;

				// 서브 텍스트 (예: "OOO님과 [상품명]을 거래했어요.")
				if (targetItem.classList.contains('type-transaction-complete')) {
					// 구매자 (후기 요청 모달)
					modalSubText.textContent = `${nickname}님과 ${productName}을 거래했어요.`;
					modalReviewText.value = "솔직한 후기를 남겨주세요."; // textarea 기본값
					modalReviewText.readOnly = false; // 구매자는 입력 가능
					document.querySelector('.review-modal .submit-btn').style.display = 'block'; // 완료 버튼 표시

				} else if (targetItem.classList.contains('type-review-received')) {
					document.querySelectorAll('.star-container input[name="star"]').forEach(radio => {
				 	   radio.checked = false;
					   radio.disabled = true; // 클릭 불가능하게 막기
					});
	
					  // 전달된 점수와 같은 value 가진 input 체크
					const target = document.querySelector(`.star-container input[value="${data.rateScore}"]`);
					if (target) target.checked = true;
						
					modalSubText.textContent = `${data.sellerNickname}님이 ${productName}에 대해 남긴 후기입니다.`;
					modalReviewText.value = data.reviewText || '후기 내용이 없습니다.';
					modalReviewText.readOnly = true; // 판매자는 수정 불가
					document.querySelector(".star-container").classList.add("readonly");
					document.querySelector('.review-modal .submit-btn').style.display = 'none'; // 완료 버튼 숨김
				}
			}

		} catch (error) {
			console.error("후기 상세 정보 로드 중 오류 발생:", error);
			alert('후기 정보를 불러오는데 실패했습니다.');
		}
	}

	const submitBtn = document.querySelector('.submit-btn');
	const form = document.querySelector('#reviewForm');
	submitBtn.addEventListener('click', () => {
		form.submit();
	});
});

