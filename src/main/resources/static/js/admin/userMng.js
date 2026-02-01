/* userMng.js */

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
            setField('Id', data.id);
            //setField('Pwd', ''); // 비밀번호는 보안상 빈값으로 초기화 // html에서 ***로 고정출력

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


            updateStatusButton(data.state);

            // 모달 띄우기
            document.getElementById('userModal').style.display = 'flex';
        })
        .catch(error => {
            console.error('Error:', error);
            alert("정보를 불러오는데 실패했습니다.");
        });
}

// 상태 버튼 업데이트 및 이벤트 바인딩
function updateStatusButton(state) {
    const btn = document.querySelector('.modal-footer .btn-white-red');

    // 버튼 초기화
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    if (state === 'N') {
        newBtn.textContent = '활성화';
        newBtn.classList.remove('deactivate-btn');
        newBtn.style.color = 'blue';
    } else {
        // 'Y' 이거나 그 외의 경우 비활성화 버튼 노출
        newBtn.textContent = '비활성화';
        newBtn.classList.add('deactivate-btn');
        newBtn.style.color = 'red';
    }
    // 클릭 이벤트 연결
    newBtn.onclick = () => toggleUserStatus(state);
}

// 회원 상태 토글
async function toggleUserStatus(currentStatus) {
    const userNo = document.getElementById('modalUserNo').value;
    const newStatus = currentStatus === 'Y' ? 'N' : 'Y';
    const actionText = newStatus === 'N' ? '비활성화' : '활성화';

    if (!confirm(`정말로 이 회원을 ${actionText} 하시겠습니까?`)) return;

    try {
        const response = await fetch('/admin/user/toggleStatus', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userNo: userNo, newStatus: newStatus })
        });

        if (response.ok) {
            alert(`회원이 ${actionText}되었습니다.`);
            // 버튼 상태 즉시 업데이트
            updateStatusButton(newStatus);
            // fetchUsers();
        } else {
            alert('상태 변경에 실패했습니다.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('오류가 발생했습니다.');
    }
}

// 텍스트 설정 헬퍼
function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.innerText = value;
}

// 필드 값 설정
function setField(suffix, value) {
    const safeValue = value ? value : '';
    const viewEl = document.getElementById('view' + suffix);
    const editEl = document.getElementById('edit' + suffix);

    if (viewEl) viewEl.innerText = safeValue;
    if (editEl) editEl.value = safeValue;
}

// 수정 모드 토글
function toggleEditMode() {
    isEditMode = !isEditMode;

    const viewEls = document.querySelectorAll('.view-mode-el');
    const editEls = document.querySelectorAll('.edit-mode-el');

    if (isEditMode) {
        viewEls.forEach(el => el.style.display = 'none');
        editEls.forEach(el => el.style.display = 'inline-block');
        // 비밀번호 입력창 초기화 (placeholder만 보이게)
        document.getElementById('editPwd').value = '';
    } else {
        viewEls.forEach(el => el.style.display = 'inline-block');
        editEls.forEach(el => el.style.display = 'none');
    }
}

// 회원 정보 저장
async function saveUserDetail() {
    const userNo = document.getElementById('modalUserNo').value;

    const updatedData = {
        userNo: userNo,
        name: document.getElementById('editName').value,
        nickname: document.getElementById('editNickname').value,
        email: document.getElementById('editEmail').value,
        phone: document.getElementById('editPhone').value,
        pwd: document.getElementById('editPwd').value // 비어있으면 서버에서 무시됨
    };

    if(confirm('회원 정보를 수정하시겠습니까?')) {
        try {
            const response = await fetch('/admin/user/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });

            if (response.ok) {
                alert("회원 정보가 수정되었습니다.");
                closeModal();
                // 현재 페이지 새로고침하여 변경사항 반영
                location.reload();
            } else {
                alert("수정에 실패했습니다.");
            }
        } catch (error) {
            console.error('Update Error:', error);
            alert("통신 중 오류가 발생했습니다.");
        }
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


// 검색 및 리스트 렌더링 로직

document.addEventListener('DOMContentLoaded', () => {
    const userGrid = document.querySelector('.user-grid');
    const pagination = document.querySelector('.pagination');
    const searchForm = document.querySelector('#searchForm');

    let currentKeyword = '';
    let currentPage = 1;

    function renderUsers(data) {
        const users = data.userList;
        const pi = data.pi;
        userGrid.innerHTML = '';

        if (!users || users.length === 0) {
            userGrid.innerHTML = '<div style="width:100%; text-align:center; padding: 20px;">데이터가 없습니다.</div>';
            pagination.innerHTML = '';
            return;
        }

        users.forEach(user => {
            const imageUrl = user.imageurl ? user.imageurl : '/image/default-avatar.png';
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

        let paginationHTML = '';
        if (pi.currentPage > 1) {
            paginationHTML += `<a class="prev" data-page="1">&lt;&lt;</a>`;
            paginationHTML += `<a class="prev" data-page="${pi.currentPage - 1}">&lt;</a>`;
        }
        for (let p = pi.startPage; p <= pi.endPage; p++) {
            if (p === pi.currentPage) {
                paginationHTML += `<span class="active">${p}</span>`;
            } else {
                paginationHTML += `<a data-page="${p}">${p}</a>`;
            }
        }
        if (pi.currentPage < pi.maxPage) {
            paginationHTML += `<a class="next" data-page="${pi.currentPage + 1}">&gt;</a>`;
            paginationHTML += `<a class="next" data-page="${pi.maxPage}">&gt;&gt;</a>`;
        }
        pagination.innerHTML = paginationHTML;
    }

    async function fetchUsers() {
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

    if (searchForm) {
        searchForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            currentKeyword = e.target.keyword.value;
            currentPage = 1;
            await fetchUsers();
        });
    }

    if (pagination) {
        pagination.addEventListener('click', async (e) => {
            const target = e.target.closest('a');
            if (!target) return;
            e.preventDefault();
            const page = target.dataset.page;
            if (page) {
                currentPage = parseInt(page);
                await fetchUsers();
            }
        });
    }

    if (userGrid) {
        userGrid.addEventListener('click', (e) => {
            const card = e.target.closest('.user-card');
            if (card) {
                const userPk = card.dataset.pk;
                openUserDetail(userPk);
            }
        });
    }

    fetchUsers();
});