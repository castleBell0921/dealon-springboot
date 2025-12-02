// src/main/resources/static/js/common/filter.js

document.addEventListener('DOMContentLoaded', () => {

    const categoryRadios = document.querySelectorAll('input[name="category"]');
    const availableCheckbox = document.getElementById('availableOnly');
    const priceApplyBtn = document.getElementById('price-apply-btn');
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');

    // 상품 리스트의 모든 아이템 선택자
    const productItems = document.querySelectorAll('.product-link');

    // 필터링
    function executeFilter() {
        // 현재 선택된 카테고리 값
        let selectedCategory = 'all';
        const checkedRadio = document.querySelector('input[name="category"]:checked');
        if (checkedRadio) {
            selectedCategory = checkedRadio.value;
        }

        // 거래 가능만 보기 체크 여부
        const isAvailableOnly = availableCheckbox.checked;

        // 입력된 가격 범위 가져오기 (값이 없으면 제한 없음)
        const minPrice = minPriceInput.value ? parseInt(minPriceInput.value) : 0;
        const maxPrice = maxPriceInput.value ? parseInt(maxPriceInput.value) : Infinity;

        //  모든 상품을 순회하며 조건 검사
        productItems.forEach(item => {
            // HTML에 심어둔 data-* 속성값 가져오기
            const itemCategory = item.dataset.category; // data-category
            const itemState = item.dataset.state;       // data-state
            const itemPrice = parseInt(item.dataset.price); // data-price

            let isVisible = true;

            //  카테고리 필터
            if (selectedCategory !== 'all' && itemCategory !== selectedCategory) {
                isVisible = false;
            }

            //  거래 가능만 보기 필터 (Normal 테이블 State가 'A'인 것만)
            if (isAvailableOnly && itemState !== 'A') {
                isVisible = false;
            }

            // 가격 필터 (적용 버튼 눌렀을 때만 동작하지만, 값은 항상 체크)
            // *주의: 사용자가 적용 버튼을 누르기 전에는 필터링하지 않으려면
            // 별도의 플래그가 필요하지만, 보통은 입력값 기반으로 필터링 로직에 포함시킴.
            // 여기서는 executeFilter가 '적용' 버튼 클릭 시에도 호출되므로 포함.
            if (itemPrice < minPrice || itemPrice > maxPrice) {
                isVisible = false;
            }

            // 결과 적용 -> 보이기/숨기기
            if (isVisible) {
                item.style.display = ''; // 보이기 (기본값)
            } else {
                item.style.display = 'none'; // 숨기기
            }
        });

        // 검색 결과가 없을 경우
        checkEmptyResult();
    }

    // 결과 없음 메시지
    function checkEmptyResult() {
        const visibleItems = document.querySelectorAll('.product-link:not([style*="display: none"])');
        let emptyMsg = document.getElementById('no-result-msg');

        // 메시지 요소가 없으면 생성 (list.html에 있는 <p> 태그 활용해도 됨)
        if(!emptyMsg) {
            const listContainer = document.querySelector('.product-list');
            emptyMsg = document.createElement('p');
            emptyMsg.id = 'no-result-msg';
            emptyMsg.style.width = '100%';
            emptyMsg.style.textAlign = 'center';
            emptyMsg.style.marginTop = '50px';
            emptyMsg.innerText = '해당 조건에 맞는 상품이 없습니다.';
            emptyMsg.style.display = 'none';
            listContainer.appendChild(emptyMsg);
        }

        if (visibleItems.length === 0) {
            emptyMsg.style.display = 'block';
        } else {
            emptyMsg.style.display = 'none';
        }
    }

    // 카테고리 라디오 버튼 클릭 시 즉시 필터링
    categoryRadios.forEach(radio => {
        radio.addEventListener('change', executeFilter);
    });

    // 거래 가능 체크박스 클릭 시 즉시 필터링
    availableCheckbox.addEventListener('change', executeFilter);

    // 가격 적용 버튼 클릭 시 필터링
    priceApplyBtn.addEventListener('click', executeFilter);

    // 위치 필터 일단 기능 제거
});