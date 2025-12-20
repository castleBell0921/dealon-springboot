// ====================== 로그인 모달 관련 ======================
const modal = document.getElementById('loginModal');
const loginBtn = document.getElementById('loginButton');
const logoutBtn = document.getElementById('logoutButton');
const userNo = document.querySelector('#userNo')?.value;
const loginForm = document.querySelector('.login-form');
const signUpBtn = document.querySelector('.login-btn');
const kakaoBtn = document.querySelector('.kakao_button');
const googleBtn = document.querySelector('.google_button');

// 로그인 버튼 클릭 → 로그인 모달 열기
if (loginBtn) {
  loginBtn.addEventListener('click', e => {
    e.preventDefault();
    modal.style.display = 'block';
  });
}

// 모달 외부 클릭 시 닫기
window.addEventListener('click', e => {
  if (e.target === modal) modal.style.display = 'none';
});

// 로그아웃
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    console.log('로그아웃 클릭');
    location.href = "/user/logout";
  });
}

// 로그인 버튼 클릭 시 submit
if (signUpBtn) {
  signUpBtn.addEventListener('click', () => {
    console.log('click');
    loginForm.submit();
  });
}

// 엔터키로 로그인 폼 제출
if (loginForm) {
  loginForm.addEventListener('keypress', event => {
    if (event.key === 'Enter') {
      console.log('엔터키 입력');
      loginForm.submit();
    }
  });
}

// 카카오 로그인
if (kakaoBtn) {
  kakaoBtn.addEventListener('click', async () => {
    try {
      const res = await fetch("/auth/kakao/auth-url");
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const url = await res.text();
      window.location.href = url;
    } catch (err) {
      alert("카카오 로그인 URL을 가져오는 데 실패했습니다!");
      console.error(err);
    }
  });
}

// 구글 로그인
if (googleBtn) {
  googleBtn.addEventListener('click', () => {
    window.location.href = "/auth/google/auth-url";
  });
}

// ====================== 알림 & 후기 관련 ======================
const notificationModal = document.getElementById('notificationModal');
const reviewModal = document.querySelector('.review-modal-overlay');
const reviewCloseBtn = document.querySelector('.close-btn');
const stars = document.querySelectorAll('.star-container input');
const ratingValue = document.getElementById('ratingValue');
let reviewNo = "";

// 별점 클릭 시 값 저장
stars.forEach(star => {
  star.addEventListener('change', () => {
    ratingValue.value = star.value;
  });
});

// 메시지 출력 함수
function showMessage(text, duration = 3000) {
  const box = document.getElementById('messageBox');
  if (!box) return;
  box.textContent = text;
  box.classList.add('show');
  setTimeout(() => box.classList.remove('show'), duration);
}

// 로그인 상태라면 알림 업데이트 실행
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('logoutButton')) {
    myReviewState();
    updateNotificationBadge();
  }
});

// 후기 상태 조회
async function myReviewState() {
  try {
    const res = await fetch(`/common/myReviewState`);
    if (!res.ok) throw new Error(`서버 오류`);
    return await res.json();
  } catch (err) {
    console.error("리뷰 상태를 가져오는 중 오류:", err);
    return [];
  }
}

// 알림 뱃지 갱신
async function updateNotificationBadge() {
  const data = await myReviewState();
  if (!userNo || !Array.isArray(data)) return;

  const currentUser = String(userNo);
  const filtered = data.filter(item => (
    (String(item.sellerNo) === currentUser && item.reviewText != null) ||
    (String(item.buyerNo) === currentUser && item.reviewText == null)
  ));

  const badge = document.getElementById('notificationBadge');
  if (!badge) return;

  if (filtered.length > 0) {
    badge.textContent = filtered.length > 99 ? '99+' : filtered.length;
    badge.style.display = 'block';
  } else {
    badge.style.display = 'none';
  }
}

// 알림 닫기 버튼
const closeNotificationBtn = document.getElementById('closeNotificationBtn');
if (closeNotificationBtn) {
  closeNotificationBtn.addEventListener('click', () => {
    notificationModal.classList.add('hidden');
  });
}

// 후기 모달 닫기 버튼
if (reviewCloseBtn) {
  reviewCloseBtn.addEventListener('click', e => {
    e.stopPropagation();
    reviewModal.style.display = 'none';
  });
}

// ====================== 클릭 이벤트 통합 ======================
document.addEventListener('click', async e => {
  const link = e.target.closest('#notificationLink');
  const closeBtn = e.target.closest('#closeNotificationBtn');
  const clickedElement = e.target;
  const notificationItem = clickedElement.closest('.notification-item.type-transaction-complete');
  const reviewReceivedItem = clickedElement.closest('.notification-item.type-review-received');

  // 알림 모달 외부 클릭 시 닫기
  if (notificationModal && e.target === notificationModal) {
    notificationModal.classList.add('hidden');
  }

  // 알림 링크 클릭 시 모달 열기
  if (link) {
    e.preventDefault();
    notificationModal.classList.remove('hidden');
    notificationModal.style.display = 'flex';

    try {
      const res = await fetch(`/product/getReview`);
      if (!res.ok) throw new Error('서버 통신 실패');
      const reviewList = await res.json();
      const list = document.getElementById('notificationList');
      list.innerHTML = '';

      if (reviewList.length === 0) {
        list.innerHTML = '<li class="notification-empty-item">새로운 알림이 없습니다.</li>';
        return;
      }

      const currentUserNo = String(userNo);
      reviewList.forEach(item => {
        let html = '';
        if (String(item.sellerNo) === currentUserNo && item.reviewText != null) {
          html = `
            <li class="notification-item type-review-received" data-review-no="${item.reviewNo}">
              <div class="notification-content">
                <div class="notification-left">
                  <p class="main-text fw-regular">
                    <span class="user-nickname">${item.buyerNickname || '구매자'}</span>님이 보낸 <br/>후기가 도착했어요.
                  </p>
                </div>
                <div class="notification-right fw-regular">
                  <p class="detail-text">${item.reviewText}</p>
                </div>
              </div>
            </li>`;
        } else if (String(item.buyerNo) === currentUserNo && item.reviewText == null) {
          html = `
            <li class="notification-item type-transaction-complete" data-review-no="${item.reviewNo}">
              <div class="notification-content">
                <div class="notification-left">
                  <p class="main-text fw-regular">
                    <span class="user-nickname">${item.sellerNickname || '판매자'}</span>님과의 거래가 <br/> 완료되었습니다.
                  </p>
                </div>
                <div class="notification-right">
                  <p class="detail-text buyer-prompt fw-regular">구매자로 선택되었습니다. 후기를 남겨주시면 서로에게 도움이 돼요!</p>
                </div>
              </div>
            </li>`;
        }

        if (html) {
          const temp = document.createElement('div');
          temp.innerHTML = html.trim();
          list.appendChild(temp.firstChild);
        }
      });
    } catch (err) {
      console.error('알림 데이터 로드 중 에러:', err);
    }
  }

  // 후기 알림 클릭 → 후기 모달 열기
  if (notificationItem || reviewReceivedItem) {
    const targetItem = notificationItem || reviewReceivedItem;
    reviewNo = targetItem.dataset.reviewNo;
    document.querySelector('#reviewNo').value = reviewNo;
    if (reviewNo) {
      await fetchReviewDetails(reviewNo, targetItem);
      reviewModal.style.display = 'flex';
    }
  }

  // 후기 모달 외부 클릭 시 닫기
  if (reviewModal && reviewModal.style.display === 'flex' &&
      !e.target.closest('.review-modal') && !e.target.closest('#notificationModal')) {
    reviewModal.style.display = 'none';
  }
});

// ====================== 후기 상세 로드 함수 ======================
async function fetchReviewDetails(reviewNo, targetItem) {
  try {
    const res = await fetch(`/user/reviewDetails/${reviewNo}`);
    if (!res.ok) throw new Error('리뷰 정보 불러오기 실패');
    const data = await res.json();

    const modalNickname = document.getElementById('reviewModalNickname');
    const modalSubText = document.getElementById('reviewModalSubText');
    const modalReviewText = document.getElementById('reviewText');
    const submitBtn = document.querySelector('.submit-btn');
    const stars = document.querySelectorAll('.star-container input[name="star"]');

    if (targetItem.classList.contains('type-transaction-complete')) {
      modalNickname.textContent = data.sellerNickname || '사용자';
      modalSubText.textContent = `${data.sellerNickname}님과 ${data.name}을 거래했어요.`;
      modalReviewText.placeholder = "솔직한 후기를 남겨주세요.";
      modalReviewText.readOnly = false;
      submitBtn.style.display = 'block';
      stars.forEach(star => { star.disabled = false; });
    } else {
      stars.forEach(star => { star.checked = false; star.disabled = true; });
      const target = document.querySelector(`.star-container input[value="${data.rateScore}"]`);
      if (target) target.checked = true;

      modalNickname.textContent = data.sellerNickname || '사용자';
      modalSubText.textContent = `${data.sellerNickname}님이 ${data.name}에 대해 남긴 후기입니다.`;
      modalReviewText.value = data.reviewText || '후기 내용이 없습니다.';
      modalReviewText.readOnly = true;
      submitBtn.style.display = 'none';
    }
  } catch (err) {
    console.error("후기 상세 로드 중 오류:", err);
    alert('후기 정보를 불러오는데 실패했습니다.');
  }
}

// 후기 작성 제출
const submitBtn = document.querySelector('.submit-btn');
if (submitBtn) {
  submitBtn.addEventListener('click', () => {
    document.querySelector('#reviewForm').submit();
  });
}
