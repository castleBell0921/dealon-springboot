/* userMng.js
  - 검색, 페이징, 리스트 렌더링 (AJAX)
  - 상세 정보 모달 및 수정 기능
*/

// =========================================
// 1. 전역 변수 및 모달 관련 함수 (기존 로직 유지)
// =========================================

// 현재 수정 모드인지 상태 저장
let isEditMode = false;

// 상세 정보 모달 열기
function openUserDetail(userNo) {
    resetModalState();

    console.log("Fetching details for userNo:", userNo);

    fetch(`/admin/user/detail?userNo=${userNo}`)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            console.log("User Data:", data);

            // Hidden PK 값 설정
            const modalUserNo = document.getElementById('modalUserNo');
            if (modalUserNo) modalUserNo.value = data.userNo;

            // 헤더 정보 설정
            const modalImg = document.getElementById('modalImg');
            if (modalImg) modalImg.src = data.imageUrl ? data.imageUrl : '/image/default-avatar.png';

            document.getElementById('headerNickname').innerText = data.nickname;
            document.getElementById('headerTrustScore').innerText = data.trust + '%';
            document.getElementById('headerTrustFill').style.width = data.trust + '%';

            // 상세 필드 설정
            setField('Name', data.name);
            setField('Nickname', data.nickname);
            setField('Email', data.email);
            setField('Phone', data.phone);
            // setField('Birth', data.createDate);
            setField('Id', data.id);
            // setField('Pwd', data.pwd ? data.pwd : '********');

            // 통계 수치 설정
            setText('statReg', data.regPCnt);
            setText('statSell', data.sellPCnt);
            setText('statSold', data.soldPCnt);
            setText('statRsv', data.rsvPCnt);
            setText('statDis', data.disPCnt);
            setText('statWrt', data.wrtRCnt);
            setText('statRcv', data.rcvRCnt);
            setText('statBuy', data.buyPCnt);
            setText('statRpt', data.rptCnt);

            // 모달 띄우기
            document.getElementById('userModal').style.display = 'flex';
        })
        .catch(error => {
            console.error('Error:', error);
            alert("정보를 불러오는데 실패했습니다.");
        });
}

// 텍스트 설정 헬퍼 함수
function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.innerText = value;
}

// 필드 값 설정 (보기 모드 / 수정 모드)
function setField(suffix, value) {
    const safeValue = value ? value : '';
    const viewEl = document.getElementById('view' + suffix);
    const editEl = document.getElementById('edit' + suffix);

    if (viewEl) viewEl.innerText = safeValue;
    if (editEl) editEl.value = safeValue;
}

// 수정 모드 토글
function toggleEditMode() {
    isEditMode = !isEditMode; // 상태 반전

    const viewEls = document.querySelectorAll('.view-mode-el');
    const editEls = document.querySelectorAll('.edit-mode-el');

    if (isEditMode) {
        // 수정 모드: View 숨김, Edit 보임
        viewEls.forEach(el => el.style.display = 'none');
        editEls.forEach(el => el.style.display = 'inline-block');
    } else {
        // 보기 모드: View 보임, Edit 숨김
        viewEls.forEach(el => el.style.display = 'inline-block');
        editEls.forEach(el => el.style.display = 'none');
    }
}

// 회원 정보 저장 (AJAX 구현 필요)
function saveUserDetail() {
    const userNoEl = document.getElementById('modalUserNo');
    if (!userNoEl) return;

    const userNo = userNoEl.value;
    const updatedData = {
        userNo: userNo,
        name: document.getElementById('editName').value,
        nickname: document.getElementById('editNickname').value,
        email: document.getElementById('editEmail').value,
        phone: document.getElementById('editPhone').value,
        // ... 나머지 필드 추가 가능
    };

    if(confirm('회원 정보를 수정하시겠습니까?')) {
        console.log("Sending Update:", updatedData);
        // TODO: 실제 서버로 AJAX 요청 (fetch / post)
        // fetch('/admin/user/update', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(updatedData)
        // }).then(...)

        alert("수정 완료 (테스트)"); // 실제 구현 시 제거
        closeModal();

        // 수정 후 목록 새로고침 (현재 페이지 유지하며 리로드)
        // 만약 fetchUsers 함수가 전역이 아니라면 location.reload() 사용
        // 여기서는 DOMContentLoaded 안의 fetchUsers를 호출하기 어려우므로 reload 추천
        location.reload();
    }
}

// 모달 닫기
function closeModal() {
    document.getElementById('userModal').style.display = 'none';
    resetModalState();
}

// 모달 상태 초기화
function resetModalState() {
    isEditMode = false;
    const viewEls = document.querySelectorAll('.view-mode-el');
    const editEls = document.querySelectorAll('.edit-mode-el');

    viewEls.forEach(el => el.style.display = 'inline-block');
    editEls.forEach(el => el.style.display = 'none');
}

// 모달 외부 클릭 시 닫기
window.onclick = function(event) {
    const modal = document.getElementById('userModal');
    if (event.target == modal) {
        closeModal();
    }
}


// =========================================
// 2. 검색 및 리스트 렌더링 로직 (DOMContentLoaded)
// =========================================

document.addEventListener('DOMContentLoaded', () => {
    const userGrid = document.querySelector('.user-grid');
    const pagination = document.querySelector('.pagination');
    const searchForm = document.querySelector('#searchForm');

    let currentKeyword = '';
    let currentPage = 1;

    // ✅ 회원 목록 화면 그리기
    function renderUsers(data) {
        const users = data.userList;
        const pi = data.pi;

        userGrid.innerHTML = ''; // 기존 목록 비우기

        // 데이터가 없을 경우
        if (!users || users.length === 0) {
            userGrid.innerHTML = '<div style="width:100%; text-align:center; padding: 20px;">데이터가 없습니다.</div>';
            pagination.innerHTML = '';
            return;
        }

        // 유저 카드 생성
        users.forEach(user => {
            const imageUrl = user.imageurl ? user.imageurl : '/image/default-avatar.png';

            // data-pk 속성에 user.pk(userNo) 저장
            const cardHTML = `
                <div class="user-card detailed" data-pk="${user.pk}" style="cursor: pointer;">
                    <div class="detailed-left">
                        <img src="${imageUrl}" alt="profile" class="user-avatar">

                        <div class="user-info-mini">
                            <span class="user-nickname fw-bold">${user.nickname}</span>
                            <div class="trust-label-mini">
                                Trust Gauge <span class="trust-percent">${user.trustGauge}%</span>
                            </div>
                            <div class="trust-bar">
                                <div class="trust-fill" style="width:${user.trustGauge}%;"></div>
                            </div>
                        </div>
                    </div>

                    <div class="detailed-right">
                        <div class="stat-item">
                            <span class="stat-label">등록한 상품</span>
                            <span class="stat-value purple-text">${user.regPCnt}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">구매한 상품</span>
                            <span class="stat-value purple-text">${user.buyPCnt}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">후기</span>
                            <span class="stat-value purple-text">${user.wrtRCnt}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">신고</span>
                            <span class="stat-value red-text">${user.rptCnt}</span>
                        </div>
                    </div>
                </div>
            `;
            userGrid.insertAdjacentHTML('beforeend', cardHTML);
        });

        // ✅ 페이징 버튼 렌더링
        let paginationHTML = '';

        // 이전 버튼
        if (pi.currentPage > 1) {
            paginationHTML += `<a class="prev" data-page="1">&lt;&lt;</a>`;
            paginationHTML += `<a class="prev" data-page="${pi.currentPage - 1}">&lt;</a>`;
        }

        // 페이지 번호
        for (let p = pi.startPage; p <= pi.endPage; p++) {
            if (p === pi.currentPage) {
                paginationHTML += `<span class="active">${p}</span>`;
            } else {
                paginationHTML += `<a data-page="${p}">${p}</a>`;
            }
        }

        // 다음 버튼
        if (pi.currentPage < pi.maxPage) {
            paginationHTML += `<a class="next" data-page="${pi.currentPage + 1}">&gt;</a>`;
            paginationHTML += `<a class="next" data-page="${pi.maxPage}">&gt;&gt;</a>`;
        }

        pagination.innerHTML = paginationHTML;
    }

    // ✅ 서버에서 데이터 가져오기 (AJAX)
    async function fetchUsers() {
        // 검색어 인코딩 처리
        const keywordParam = encodeURIComponent(currentKeyword || '');
        const url = `/admin/user/search?keyword=${keywordParam}&page=${currentPage}`;

        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error('서버 응답 오류');
            const data = await res.json();
            renderUsers(data);
        } catch (err) {
            console.error("회원 목록 조회 실패:", err);
        }
    }

    // ✅ 이벤트 1: 검색 폼 제출
    if (searchForm) {
        searchForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            // input name="keyword" 값 가져오기
            currentKeyword = e.target.keyword.value;
            currentPage = 1; // 검색 시 1페이지로 초기화
            await fetchUsers();
        });
    }

    // ✅ 이벤트 2: 페이지네이션 클릭 (이벤트 위임)
    if (pagination) {
        pagination.addEventListener('click', async (e) => {
            const target = e.target.closest('a');
            if (!target) return;

            e.preventDefault(); // href 이동 방지
            const page = target.dataset.page;
            if (page) {
                currentPage = parseInt(page);
                await fetchUsers();
            }
        });
    }

    // ✅ 이벤트 3: 유저 카드 클릭 시 모달 열기 (이벤트 위임)
    // 리스트가 동적으로 다시 그려지므로 부모(userGrid)에 이벤트를 걸어야 함
    if (userGrid) {
        userGrid.addEventListener('click', (e) => {
            const card = e.target.closest('.user-card');
            if (card) {
                const userPk = card.dataset.pk; // data-pk 값 가져오기
                openUserDetail(userPk);
            }
        });
    }

    // ✅ 초기 로드 시 전체 목록 가져오기
    fetchUsers();
});