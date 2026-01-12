document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('productModal');
    const postGrid = document.querySelector('.post-grid');
    const pagination = document.querySelector('.pagination');
    const searchForm = document.querySelector('#searchForm');
    let currentKeyword = '';
    let currentPage = 1;

    // ✅ 상품 목록 렌더링
    function renderProducts(data) {
        const products = data.productList;
        const pi = data.pi;

        postGrid.innerHTML = '';

        products.forEach(product => {
            const card = `
                <div class="post-card" data-product-no="${product.productNo}">
                    <div class="post-image">
                        <img src="${product.thumbnailUrl}">
                        ${product.status === 'N' ? '<div class="disabled-overlay">비활성화됨</div>' : ''}
                    </div>
                    <div class="post-content">
                        <div class="post-location">${product.location}</div>
                        <div class="post-title">${product.name}</div>
                        <div class="post-price">${product.price}원</div>
                        <div class="post-seller">판매자: ${product.sellerNickname}</div>
                    </div>
                </div>
            `;
            postGrid.insertAdjacentHTML('beforeend', card);
        });

        // ✅ 페이징 버튼 렌더링
        let paginationHTML = '';
        if (pi.currentPage > 1) {
            paginationHTML += `<a class="prev" data-page="${pi.currentPage - 1}">&lt;</a>`;
        }
        for (let p = pi.startPage; p <= pi.endPage; p++) {
            paginationHTML += (p === pi.currentPage)
                ? `<span class="active">${p}</span>`
                : `<a data-page="${p}">${p}</a>`;
        }
        if (pi.currentPage < pi.maxPage) {
            paginationHTML += `<a class="next" data-page="${pi.currentPage + 1}">&gt;</a>`;
        }
        pagination.innerHTML = paginationHTML;
    }

    // ✅ 상품 목록 가져오기
    async function fetchProducts() {
        const url = `/admin/product/search?keyword=${encodeURIComponent(currentKeyword || '')}&page=${currentPage}`;
        const res = await fetch(url);
        const data = await res.json();
        renderProducts(data);
    }

    // ✅ 검색 이벤트
    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        currentKeyword = e.target.keyword.value;
        currentPage = 1;
        await fetchProducts();
    });

    // ✅ 페이지 이동 이벤트
    pagination.addEventListener('click', async (e) => {
        const target = e.target.closest('a');
        if (!target) return;
        e.preventDefault();

        currentPage = parseInt(target.dataset.page);
        await fetchProducts();
    });

    // ✅ 카드 클릭 (모달 열기)
    postGrid.addEventListener('click', async (e) => {
        const card = e.target.closest('.post-card');
        if (!card) return;

        const productNo = card.dataset.productNo;
        try {
            const res = await fetch(`/admin/getProductDetail?productNo=${productNo}`);
            const data = await res.json();
            let productStatus = data.status;

            // 모달 열기
            modal.style.display = 'flex';
            document.querySelector('.modal-title').innerText = data.name;
            document.querySelector('.modal-price').innerText = `${data.price}원`;
            document.querySelector('.modal-seller').innerText = `판매자: ${data.sellerNickname}`;
            document.querySelector('.modal-location').innerText = data.location;
            document.querySelector('.img').src = data.thumbnailUrl;
            document.querySelector('.modal-description').innerText = data.detail;
            document.querySelector('.modal-breadcrumb').innerText = data.categoryName;

            const btn = document.querySelector('.product-modal-footer button');
            if (productStatus == 'Y') {
                btn.classList.remove('activate-btn');
                btn.classList.add('deactivate-btn');
                btn.textContent = '비활성화';
            } else {
                btn.classList.remove('deactivate-btn');
                btn.classList.add('activate-btn');
                btn.textContent = '활성화';
            }

            // 상태 토글 버튼
            btn.onclick = async () => {
                const newStatus = productStatus == 'Y' ? 'N' : 'Y';
                const updateRes = await fetch(`/admin/toggleProductStatus`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productNo, newStatus })
                });

                if (updateRes.ok) {
                    productStatus = newStatus;

                    const card = document.querySelector(`.post-card[data-product-no="${productNo}"]`);
                    const imageBox = card.querySelector('.post-image');
                    let overlay = imageBox.querySelector('.disabled-overlay');

                    if (newStatus == 'N') {
                        btn.classList.add('activate-btn');
                        btn.classList.remove('deactivate-btn');
                        btn.textContent = '활성화';
                        alert('상품이 비활성화되었습니다.');

                        if (!overlay) {
                            const overlayDiv = document.createElement('div');
                            overlayDiv.className = 'disabled-overlay';
                            overlayDiv.textContent = '비활성화됨';
                            imageBox.appendChild(overlayDiv);
                        }
                    } else {
                        btn.classList.add('deactivate-btn');
                        btn.classList.remove('activate-btn');
                        btn.textContent = '비활성화';
                        alert('상품이 활성화되었습니다.');
                        if (overlay) overlay.remove();
                    }
                } else {
                    alert('상태 변경 실패!');
                }
            };
        } catch (err) {
            console.error('상품 상세 조회 실패', err);
        }
    });

    // ✅ 모달 외부 클릭 시 닫기
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // ✅ 초기 상품 목록 로드
    fetchProducts();
});
