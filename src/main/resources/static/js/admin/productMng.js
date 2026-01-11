document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('productModal');
    const postGrid = document.querySelector('.post-grid');

    // ✅ 카드 클릭 (이벤트 위임 방식)
    postGrid.addEventListener('click', async (e) => {
        const card = e.target.closest('.post-card');
        if (!card) return; // post-card가 아닌 경우 무시

        const productNo = card.dataset.productNo;
        try {
            const res = await fetch(`/admin/getProductDetail?productNo=${productNo}`);
            const data = await res.json();

            let productStatus = data.status;

            // 모달 열기
            modal.style.display = 'flex';

            // 값 세팅
            document.querySelector('.modal-title').innerText = data.name;
            document.querySelector('.modal-price').innerText = data.price + '원';
            document.querySelector('.modal-seller').innerText = '판매자: ' + data.sellerNickname;
            document.querySelector('.modal-location').innerText = data.location;
            document.querySelector('.img').src = data.thumbnailUrl;
            document.querySelector('.modal-description').innerText = data.detail;
            document.querySelector('.modal-breadcrumb').innerText = data.categoryName;

            // 버튼 상태 설정
            const btn = document.querySelector('.product-modal-footer button');
            if (productStatus === 'Y') {
                btn.classList.remove('activate-btn');
                btn.classList.add('deactivate-btn');
                btn.textContent = '비활성화';
            } else {
                btn.classList.remove('deactivate-btn');
                btn.classList.add('activate-btn');
                btn.textContent = '활성화';
            }

            // 상태 토글
            btn.onclick = async () => {
                const newStatus = productStatus === 'Y' ? 'N' : 'Y';

                try {
                    const updateRes = await fetch(`/admin/toggleProductStatus`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ productNo, newStatus })
                    });

                    if (updateRes.ok) {
                        productStatus = newStatus;

                        // ✅ 카드 찾기 (현재 상품 카드)
                        const card = document.querySelector(`.post-card[data-product-no="${productNo}"]`);
                        const imageBox = card.querySelector('.post-image');
                        let overlay = imageBox.querySelector('.disabled-overlay');

                        // ✅ 상태 변경 반영
                        if (newStatus === 'N') {
                            btn.classList.remove('activate-btn');
                            btn.classList.add('deactivate-btn');
                            btn.textContent = '활성화';
                            alert('상품이 비활성화되었습니다.');

                            if (!overlay) {
                                const overlayDiv = document.createElement('div');
                                overlayDiv.className = 'disabled-overlay';
                                overlayDiv.textContent = '비활성화됨';
                                imageBox.appendChild(overlayDiv);
                            }
                        } else {
                            btn.classList.remove('deactivate-btn');
                            btn.classList.add('activate-btn');
                            btn.textContent = '비활성화';
                            alert('상품이 활성화되었습니다.');

                            if (overlay) overlay.remove();
                        }
                    } else {
                        alert('상태 변경 실패!');
                    }
                } catch (err) {
                    console.error('상품 상태 변경 중 오류:', err);
                }
            };
        } catch (err) {
            console.error('상품 상세 조회 실패', err);
        }
    }); // ✅ ← 여기가 누락되어 있었음!

    // ✅ 모달 바깥 클릭 시 닫기
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // ✅ 검색 이벤트 (비동기)
    document.querySelector('#searchForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const keyword = e.target.keyword.value;

        const res = await fetch(`/admin/product/search?keyword=${encodeURIComponent(keyword)}`);
        const data = await res.json();
        console.log('검색결과:', data);

        postGrid.innerHTML = ''; // 기존 상품 목록 초기화

        data.forEach(product => {
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
    });
});
