document.addEventListener('DOMContentLoaded', async () => {
	const recentContainer = document.querySelector('.recent-viewed-items');
	const userNo = document.querySelector('#userNo')?.value || 'guest';
	const storageKey = `recentViewedProducts_${userNo}`;

	// 디버그: 컨테이너 존재 확인
	if (!recentContainer) {
		console.warn('recent-viewed-items 컨테이너를 찾을 수 없습니다. 선택자를 확인하세요.');
		// 그래도 계속 실행하되 렌더는 생략
	}

	// 1) 로그인 유저일 경우: DB에서 최근 본 상품 가져와 localStorage에 반영하고 렌더
	if (userNo != 'guest') {
		try {
			const res = await fetch('/common/recent-view');
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const data = await res.json();
			console.log('최근 본 상품(DB):', data);

			// [{ productNo, productName, productImage }, ...]
			const products = Array.isArray(data) ? data.map(item => ({
				no: item.PRODUCT_NO || item.productNo,
				name: item.PRODUCT_NAME || item.productName,
				image: item.PRODUCT_IMAGE || item.productImage
			})) : [];

			localStorage.setItem(storageKey, JSON.stringify(products));

			// DB에서 가져온 직후 렌더 호출 (중요)
			renderRecentProducts();
		} catch (err) {
			console.error('DB에서 최근 본 상품 불러오기 실패:', err);
			// 실패해도 로컬/세션에 남아있는 값으로 렌더 시도
			renderRecentProducts();
		}
	} else {
		// 게스트인 경우에도 초기 렌더(세션스토리지 확인)
		renderRecentProducts();
	}

	// 2) 현재 페이지가 상품 상세 페이지라면 해당 상품을 저장
	const productNo = document.querySelector('#productNo')?.value;
	const productName = document.querySelector('#productName')?.textContent?.trim();
	const productImage = document.querySelector('.slider-image img')?.src;

	if (productNo && productName && productImage) {
		let list;

		if (userNo === 'guest') {
			list = safeParse(sessionStorage.getItem(storageKey));
			list = list.filter(item => item.no != productNo);
			list.unshift({ no: productNo, name: productName, image: productImage });
			if (list.length > 4) list = list.slice(0, 4);
			sessionStorage.setItem(storageKey, JSON.stringify(list));
		} else {
			list = safeParse(localStorage.getItem(storageKey));
			list = list.filter(item => item.no != productNo);
			list.unshift({ no: productNo, name: productName, image: productImage });
			if (list.length > 4) list = list.slice(0, 4);
			localStorage.setItem(storageKey, JSON.stringify(list));

			// DB에 저장 (비동기)
			await saveViewedProductToDB(productNo, productName, productImage);
		}

		// 저장 후 즉시 렌더링 (새로 본 상품을 맨 위로)
		renderRecentProducts();
	}

	// ----------------------
	// 🔧 함수 정의
	// ----------------------
	async function saveViewedProductToDB(no, name, image) {
		try {
			const res = await fetch('/common/recent-view', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					productNo: no,
					productName: name,
					productImage: image
				})
			});
			if (!res.ok) console.warn('DB 저장 응답 실패', res.status);
		} catch (err) {
			console.error('DB 저장 실패:', err);
		}
	}

	function renderRecentProducts() {
		// 컨테이너가 없는 경우 아무것도 하지 않음
		if (!recentContainer) return;

		const raw = (userNo === 'guest' ? sessionStorage.getItem(storageKey) : localStorage.getItem(storageKey)) || '[]';
		const list = safeParse(raw);

		// 디버그: 렌더링하려는 리스트 출력
		console.log('렌더링할 최근본 목록:', list);

		recentContainer.innerHTML = '';

		if (!Array.isArray(list) || list.length === 0) {
			// 필요하면 빈 상태 UI 추가
			recentContainer.innerHTML = '<p class="empty">최근 본 상품이 없습니다.</p>';
			return;
		}

		list.forEach(item => {
			const div = document.createElement('div');
			div.className = 'recent-item';
			div.innerHTML = `
				<a href="/product/detail/${item.no}">
					<img src="${item.image}" alt="${escapeHtml(item.name)}" />
					<p>${escapeHtml(item.name)}</p>
				</a>
			`;
			recentContainer.appendChild(div);
		});
	}

	// 안전 파싱: JSON.parse 실패 시 빈 배열 반환
	function safeParse(raw) {
		try {
			if (!raw) return [];
			const parsed = JSON.parse(raw);
			return Array.isArray(parsed) ? parsed : [];
		} catch (e) {
			console.warn('JSON 파싱 실패, 빈 배열 반환', e);
			return [];
		}
	}

	// 간단한 XSS 방지용 이스케이프
	function escapeHtml(str) {
		if (typeof str != 'string') return '';
		return str.replace(/[&<>"]/g, ch => {
			switch (ch) {
				case '&': return '&amp;';
				case '<': return '&lt;';
				case '>': return '&gt;';
				case '"': return '&quot;';
				default: return ch;
			}
		});
	}
});
