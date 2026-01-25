// 전역 변수: 현재 수정 모드인지 상태 저장
let isEditMode = false;

/**
 * 1. 유저 상세 정보 불러오기 & 모달 열기
 */
function openUserDetail(userNo) {
    // 1-1. 데이터를 가져오기 전 초기화 (이전 잔상 제거)
    resetModalState();

    console.log("Fetching details for userNo:", userNo);

    fetch(`/admin/user/detail?userNo=${userNo}`)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            console.log("User Data:", data);

            // 2. 데이터 바인딩 (View용 Span과 Edit용 Input에 모두 넣기)
            document.getElementById('modalUserNo').value = data.userNo; // Hidden PK

            // 프로필 섹션
            document.getElementById('modalImg').src = data.imageUrl ? data.imageUrl : '/image/default-avatar.png';
            document.getElementById('headerNickname').innerText = data.nickname;
            document.getElementById('headerTrustScore').innerText = data.trust + '%';
            document.getElementById('headerTrustFill').style.width = data.trust + '%';

            // 왼쪽 정보 컬럼 (View / Edit 동시 세팅)
            setField('Name', data.name);
            setField('Nickname', data.nickname);
            setField('Email', data.email);
            setField('Phone', data.phone);

            // 생년월일 (Date 타입일 경우 포맷팅 필요, 여기선 문자열/Date 가정)
            let birthStr = data.createDate; // 예시로 createDate를 썼으나 실제론 birth 필드 매핑
            // 만약 data.birth가 있다면: document.getElementById('viewBirth').innerText = data.birth;
            // 여기선 화면 예시에 맞춰 임의의 값 또는 DTO 필드 사용
            setField('Birth', '19960308'); // DTO에 birth 필드가 있다면 data.birth 사용

            setField('Id', data.id);
            setField('Pwd', data.pwd ? data.pwd : '********'); // 실제 비밀번호 혹은 마스킹

            // 오른쪽 통계 컬럼 (Text Only)
            document.getElementById('statReg').innerText = data.regPCnt;
            document.getElementById('statSell').innerText = data.sellPCnt;
            document.getElementById('statSold').innerText = data.soldPCnt;
            document.getElementById('statRsv').innerText = data.rsvPCnt;
            document.getElementById('statDis').innerText = data.disPCnt;
            document.getElementById('statWrt').innerText = data.wrtRCnt;
            document.getElementById('statRcv').innerText = data.rcvRCnt;
            document.getElementById('statBuy').innerText = data.buyPCnt;
            document.getElementById('statRpt').innerText = data.rptCnt;

            // 3. 모달 띄우기
            document.getElementById('userModal').style.display = 'flex';
        })
        .catch(error => {
            console.error('Error:', error);
            alert("정보를 불러오는데 실패했습니다.");
        });
}

// 헬퍼 함수: View Span과 Edit Input에 값 동시에 넣기
function setField(suffix, value) {
    const safeValue = value ? value : '';
    document.getElementById('view' + suffix).innerText = safeValue;
    document.getElementById('edit' + suffix).value = safeValue;
}

/**
 * 2. 수정 모드 토글 (연필 아이콘 클릭 시)
 */
function toggleEditMode() {
    isEditMode = !isEditMode; // 상태 반전

    const viewEls = document.querySelectorAll('.view-mode-el');
    const editEls = document.querySelectorAll('.edit-mode-el');

    if (isEditMode) {
        // 수정 모드: View 숨김, Edit 보임
        viewEls.forEach(el => el.style.display = 'none');
        editEls.forEach(el => el.style.display = 'inline-block'); // or block
    } else {
        // 보기 모드: View 보임, Edit 숨김
        viewEls.forEach(el => el.style.display = 'inline-block');
        editEls.forEach(el => el.style.display = 'none');
    }
}

/**
 * 3. 변경사항 저장 (변경하기 버튼 클릭 시)
 */
function saveUserDetail() {
    const userNo = document.getElementById('modalUserNo').value;
    const updatedData = {
        userNo: userNo,
        name: document.getElementById('editName').value,
        nickname: document.getElementById('editNickname').value,
        email: document.getElementById('editEmail').value,
        phone: document.getElementById('editPhone').value,
        // ... 필요한 필드 추가
    };

    if(confirm('회원 정보를 수정하시겠습니까?')) {
        console.log("Sending Update:", updatedData);
        // TODO: 실제 서버로 AJAX 요청 (fetch / post)
        // fetch('/admin/user/update', { ... }) ...

        alert("수정 완료 (테스트)");
        closeModal();
        location.reload(); // 리스트 갱신을 위해 새로고침
    }
}

/**
 * 4. 모달 닫기
 */
function closeModal() {
    document.getElementById('userModal').style.display = 'none';
    resetModalState();
}

/**
 * 5. 모달 상태 초기화 (닫을 때 실행)
 */
function resetModalState() {
    isEditMode = false;
    // 모든 요소를 View 모드로 강제 복구
    const viewEls = document.querySelectorAll('.view-mode-el');
    const editEls = document.querySelectorAll('.edit-mode-el');

    viewEls.forEach(el => el.style.display = 'inline-block');
    editEls.forEach(el => el.style.display = 'none');
}

// (선택) 모달 바깥 배경 클릭 시 닫기
window.onclick = function(event) {
    const modal = document.getElementById('userModal');
    if (event.target == modal) {
        closeModal();
    }
}