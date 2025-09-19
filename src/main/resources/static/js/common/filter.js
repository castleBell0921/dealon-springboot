document.addEventListener('DOMContentLoaded', () => {
    const filterForm = document.getElementById('filter-form');

    // filterForm.addEventListener('change', () => {
    //     // 적용 버튼을 누를때만 리로드 하려면 이거 지우고 버튼을 submit으로 쓰기
    //     filterForm.submit();
    // });


    // 비동기
    filterForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // 기본 폼 제출(새로고침) 방지

        const formData = new FormData(filterForm);
        const params = new URLSearchParams(formData).toString();

        try {
            // 1. 서버에 필터링된 상품 목록(HTML 조각)을 요청
            const response = await fetch(`/products/filter?${params}`);
            const productsHtml = await response.text();

            // 2. 받아온 HTML로 상품 목록 영역을 교체
            const productListContainer = document.querySelector('.product-list');
            if (productListContainer) {
                productListContainer.innerHTML = productsHtml;
            }

            // 3. 브라우저 주소창의 URL을 업데이트 (사용자 경험 향상)
            window.history.pushState({}, '', `/products?${params}`);

        } catch (error) {
            console.error('상품 필터링 중 오류 발생:', error);
        }
    });

});