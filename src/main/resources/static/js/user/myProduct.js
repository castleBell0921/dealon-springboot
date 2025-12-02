document.addEventListener('DOMContentLoaded', () => {

    // 날짜 / 위치 글자 포맷
    formatTimeAndLocation();

    // 상품 상태 필터
    setupTabs();

    // 더보기 버튼, 상품 상태변경 ajax
    setupMoreOptions();
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

            /*
            fetch('/product/updateStatus', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    //  CSRF 토큰 헤더라고 요청시 암호를 같이 보내서 요청에 해킹 개입 방지 라는데 몰루
                    // 'X-CSRF-TOKEN': document.querySelector('meta[name="_csrf"]').content 
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
                alert('상품 상태가 변경되었습니다.');
                
                // 성공 시 UI 즉시 반영 = 데이터속성 업데이트
                productLink.dataset.state = newStatus;
                
                // 오버레이 닫기
                const overlay = btn.closest('.product-overlay');
                overlay.style.display = 'none';

                // 리로드 없이 보고있는 전체, 판매중 등 에서 사라지게 하고싶은데 일단 새로고침
                location.reload();
            })
            .catch(error => {
                console.error('에러 발생:', error);
                alert('상태 변경 중 오류가 발생했습니다.');
            });
            */
        });
    });
}