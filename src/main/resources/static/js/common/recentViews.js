document.addEventListener('DOMContentLoaded', () => {
    const recentContainer = document.querySelector('.recent-viewed-items');

    const userNo = document.querySelector('#userNo')?.value;
    const storageKey = `recentViewedProducts_${userNo}`;

    // 1. Detail 페이지: 현재 상품 저장
    const productNo = document.querySelector('#productNo')?.value;
    const productName = document.querySelector('#productName')?.textContent;
	const productImage = document.querySelector('.slider-image img')?.src;

    if (productNo && productName && productImage) {
        let list = JSON.parse(localStorage.getItem(storageKey) || '[]');

        // 중복 제거
        list = list.filter(item => item.no !== productNo);

        // 맨 앞에 추가
        list.unshift({ no: productNo, name: productName, image: productImage });

        // 최대 4개
        if (list.length > 4) list = list.slice(0, 4);

        // 저장
        localStorage.setItem(storageKey, JSON.stringify(list));
    }

    // 2. 렌더링
    const list = JSON.parse(localStorage.getItem(storageKey) || '[]');
    recentContainer.innerHTML = ''; // 기존 내용 초기화

    list.forEach(item => {
        const div = document.createElement('div');
        div.className = 'recent-item';
        div.innerHTML = `
            <a href="/product/detail/${item.no}">
                <img src="${item.image}" alt="${item.name}" />
                <p>${item.name}</p>
            </a>
        `;
        recentContainer.appendChild(div);
    });
});
