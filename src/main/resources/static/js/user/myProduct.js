document.addEventListener('DOMContentLoaded', () => {

    // 시간 계산 (방금 전, n분 전, n시간 전, n일 전)
    const timeElements = document.querySelectorAll(".time-ago");
    timeElements.forEach(el => {
        const dateString = el.getAttribute("data-date");
        if (!dateString) return; // 데이터가 없으면 패스

        const date = new Date(dateString);
        const now = new Date();

        const diffMs = now - date;
        const diffMinutes = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        let result = "";
        if (diffMinutes < 1) {
            result = "방금 전";
        } else if (diffMinutes < 60) {
            result = diffMinutes + "분 전";
        } else if (diffHours < 24) {
            result = diffHours + "시간 전";
        } else {
            result = diffDays + "일 전";
        }
        el.textContent = result;
    });

    // 주소 자르기
    const locationItems = document.querySelectorAll(".location");
    locationItems.forEach(el => {
        const location = el.getAttribute("data-location");
        if (!location) return;

        const parts = location.split(" ");
        let endIndex = -1;

        parts.forEach((part, idx) => {
            if (part.endsWith("시") || part.endsWith("군") || part.endsWith("구")) {
                endIndex = idx;
            }
        });

        const result = endIndex >= 0
            ? parts.slice(0, endIndex + 1).join(" ")
            : location;

        el.textContent = result;
    });


    const tabs = document.querySelectorAll('.tab-item');
    const indicator = document.getElementById('tabIndicator');
    const productLinks = document.querySelectorAll('.product-link');
    const noResultMsg = document.getElementById('no-filter-result');

    // 탭 밑줄(인디케이터) 위치 설정 함수
    function setIndicator(element) {
        if (!element || !indicator) return;
        indicator.style.width = element.offsetWidth + 'px';
        indicator.style.left = element.offsetLeft + 'px';
    }

    // 초기화시 'active' 클래스가 있는 '전체'에 밑줄 위치시키기
    const activeTab = document.querySelector('.tab-item.active');
    if (activeTab) {
        setIndicator(activeTab);
    }

    // 탭 클릭 이벤트 처리
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            const clickedTab = e.currentTarget;

            // 탭 스타일 변경
            tabs.forEach(t => t.classList.remove('active'));
            clickedTab.classList.add('active');

            // 밑줄 애니메이션 이동
            setIndicator(clickedTab);

            // 상품 필터링 로직
            const filterType = clickedTab.dataset.filter; // 'all', 'A', 'R', 'S'
            let visibleCount = 0;

            productLinks.forEach(link => {
                const productState = link.dataset.state;

                if (filterType === 'all') {
                    link.style.display = '';
                    visibleCount++;
                } else {
                    if (productState === filterType) {
                        link.style.display = '';
                        visibleCount++;
                    } else {
                        link.style.display = 'none';
                    }
                }
            });

            // 결과 없음 메시지
            if (noResultMsg) {
                if (visibleCount === 0) {
                    noResultMsg.style.display = 'block';
                } else {
                    noResultMsg.style.display = 'none';
                }
            }
        });
    });

    // 창 크기 변경 시 밑줄 위치 재조정
    window.addEventListener('resize', () => {
        const currentActive = document.querySelector('.tab-item.active');
        if (currentActive) setIndicator(currentActive);
    });
});