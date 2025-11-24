document.addEventListener('DOMContentLoaded', async () => {
	const recentContainer = document.querySelector('.recent-viewed-items');
	const userNo = document.querySelector('#userNo').value;
	const storageKey = `recentViewedProducts_${userNo}`;

	// ✅ 로그인 유저일 경우: DB에서 최근 본 상품 가져와 localStorage에 반영
	if (userNo !== 'guest') {
		try {
			const res = await fetch(`/common/recent-view/${userNo}`);
			const data = await res.json(); 
			console.log('최근 본 상품(DB):', data);

			// [{ productNo, productName, productImage }, ...]
			const products = data.map(item => ({
				no: item.PRODUCT_NO || item.productNo,
				name: item.PRODUCT_NAME || item.productName,
				image: item.PRODUCT_IMAGE || item.productImage
			}));

			localStorage.setItem(storageKey, JSON.stringify(products));
		} catch (err) {
			console.error('DB에서 최근 본 상품 불러오기 실패:', err);
		}
	}

	// ✅ 현재 페이지가 상품 상세 페이지라면 해당 상품을 저장
	const productNo = document.querySelector('#productNo')?.value;
	const productName = document.querySelector('#productName')?.textContent;
	const productImage = document.querySelector('.slider-image img')?.src;

	if (productNo && productName && productImage) {
		let list;

		if (userNo === 'guest') {
			list = JSON.parse(sessionStorage.getItem(storageKey) || '[]');
			list = list.filter(item => item.no !== productNo);
			list.unshift({ no: productNo, name: productName, image: productImage });
			if (list.length > 4) list = list.slice(0, 4);
			sessionStorage.setItem(storageKey, JSON.stringify(list));
		} else {
			list = JSON.parse(localStorage.getItem(storageKey) || '[]');
			list = list.filter(item => item.no !== productNo);
			list.unshift({ no: productNo, name: productName, image: productImage });
			if (list.length > 4) list = list.slice(0, 4);
			localStorage.setItem(storageKey, JSON.stringify(list));

			// DB에 저장
			await saveViewedProductToDB(productNo, productName, productImage);
		}
	}

	// ✅ 렌더링 함수 실행
	renderRecentProducts();

	// ----------------------
	// 🔧 함수 정의
	// ----------------------
	async function saveViewedProductToDB(no, name, image) {
		try {
			await fetch('/common/recent-view', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					productNo: no,
					productName: name,
					productImage: image
				})
			});
		} catch (err) {
			console.error('DB 저장 실패:', err);
		}
	}

	function renderRecentProducts() {
		if (!recentContainer) return;

		const list = JSON.parse(
			(userNo === 'guest'
				? sessionStorage.getItem(storageKey)
				: localStorage.getItem(storageKey)) || '[]'
		);

		recentContainer.innerHTML = '';

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
	}
});
