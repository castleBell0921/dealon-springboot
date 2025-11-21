document.addEventListener('DOMContentLoaded', async () => {

	const form = document.querySelector('#form');
	const searchBar = document.querySelector('.searchbar-input');
	const userNo = document.querySelector('#userNo').value;
	const recentKeywordsContainer = document.querySelector('.popular-keywords');

	if (userNo !== 'guest') {
		try {
			const res = await fetch(`/common/recent-search/${userNo}`);
			console.log(res);
			const data = await res.json(); // [{keyword: '검색어1'}, ...]
			console.log(data);
			const keywords = data.map(item => item.KEYWORD || item.keyword);
			localStorage.setItem(`recentSearch_${userNo}`, JSON.stringify(keywords));
		} catch (err) {
			console.error(err);
		}
	}
	
	

	// 초기 화면에 최근 검색어 불러오기
	renderRecentKeywords();

	// 클릭 이벤트 처리
	// 클릭 이벤트: 버튼 클릭
	document.addEventListener('click', (e) => {
		if (e.target.closest('.search-btn')) {
			e.preventDefault();
			handleSearch();
		}

		// 최근검색어 클릭 시
		if (e.target.closest('.popular-keywords span')) {
			const keyword = e.target.textContent;
			searchBar.value = keyword; // form input에 값 넣기
			form.submit();             // 바로 검색
		}
	});

	// Enter 입력 시 form submit 처리
	form.addEventListener('submit', (e) => {
		e.preventDefault(); // submit 잠시 막기
		handleSearch();
	});

	async function handleSearch() {
		const keyword = searchBar.value.trim();
		if (!keyword) return;

		if (userNo == 'guest') {
			const storageKey = `recentSearch_${userNo}`;
			let list = JSON.parse(sessionStorage.getItem(storageKey) || "[]");

			// 중복 제거 후 맨 앞에 추가
			list = list.filter(item => item != keyword);
			list.unshift(keyword);
			if (list.length > 10) list = list.slice(0, 10);

			sessionStorage.setItem(storageKey, JSON.stringify(list));

			// 최근 검색어 화면에 업데이트
			renderRecentKeywords();

			form.submit(); // 저장 후 제출
		} else {
			// 1. localStorage에도 저장 (UX용)
			const storageKey = `recentSearch_${userNo}`;
			let list = JSON.parse(localStorage.getItem(storageKey) || "[]");
			list = list.filter(item => item != keyword);
			list.unshift(keyword);
			if (list.length > 10) list = list.slice(0, 10);
			localStorage.setItem(storageKey, JSON.stringify(list));
			renderRecentKeywords();

			await saveSearchToDB(keyword);

			form.submit(); // DB 저장 요청 후 제출 (submit 막지 않음)
		}
	}

	async function saveSearchToDB(keyword) {
		try {
			await fetch('/common/recent-search', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ keyword: keyword })
			});
		} catch (err) {
			console.error(err);
		}
	}

	function renderRecentKeywords() {
		const storageKey = `recentSearch_${userNo}`;
		const list = JSON.parse(
					(userNo === 'guest' 
						? sessionStorage.getItem(storageKey) 
						: localStorage.getItem(storageKey)) || "[]"
				);

		if (!recentKeywordsContainer) return;

		// 기존 span 제거
		recentKeywordsContainer.innerHTML = '최근검색어: ';

		// 리스트를 span으로 만들어서 추가
		list.forEach(keyword => {
			const span = document.createElement('span');
			span.textContent = keyword;
			recentKeywordsContainer.appendChild(span);
			span.style.marginRight = '5px'; // optional: 간격
		});
	}
});

