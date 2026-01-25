// 현재 수정 모드인지 상태 저장
let isEditMode = false;

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

            document.getElementById('modalUserNo').value = data.userNo; // Hidden PK

            document.getElementById('modalImg').src = data.imageUrl ? data.imageUrl : '/image/default-avatar.png';
            document.getElementById('headerNickname').innerText = data.nickname;
            document.getElementById('headerTrustScore').innerText = data.trust + '%';
            document.getElementById('headerTrustFill').style.width = data.trust + '%';

            setField('Name', data.name);
            setField('Nickname', data.nickname);
            setField('Email', data.email);
            setField('Phone', data.phone);
            setField('CreateDate', data.createDate);
            setField('Id', data.id);
            setField('Pwd', data.pwd ? data.pwd : '********'); // 실제 비밀번호 혹은 마스킹

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


function setField(suffix, value) {
    const safeValue = value ? value : '';
    document.getElementById('view' + suffix).innerText = safeValue;
    document.getElementById('edit' + suffix).value = safeValue;
}


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

// 해야됨
function saveUserDetail() {
    const userNo = document.getElementById('modalUserNo').value;
    const updatedData = {
        userNo: userNo,
        name: document.getElementById('editName').value,
        nickname: document.getElementById('editNickname').value,
        email: document.getElementById('editEmail').value,
        phone: document.getElementById('editPhone').value,
        // ... 나머지필드
    };

    if(confirm('회원 정보를 수정하시겠습니까?')) {
        console.log("Sending Update:", updatedData);
        // TODO: 실제 서버로 AJAX 요청 (fetch / post)
        // fetch('/admin/user/update', { ... }) 해 ㅑ도ㅟㅁ

        alert("수정 완료 (테스트)");
        closeModal();
        location.reload();
    }
}


function closeModal() {
    document.getElementById('userModal').style.display = 'none';
    resetModalState();
}


function resetModalState() {
    isEditMode = false;
    const viewEls = document.querySelectorAll('.view-mode-el');
    const editEls = document.querySelectorAll('.edit-mode-el');

    viewEls.forEach(el => el.style.display = 'inline-block');
    editEls.forEach(el => el.style.display = 'none');
}

window.onclick = function(event) {
    const modal = document.getElementById('userModal');
    if (event.target == modal) {
        closeModal();
    }
}