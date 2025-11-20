document.addEventListener('DOMContentLoaded', () => {

	const form = document.querySelector('#form');
	const searchBar = document.querySelector('.searchbar-input');
	const userNo = document.querySelector('#userNo');
	const recentKeywordsContainer = document.querySelector('.popular-keywords');

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

	function handleSearch() {
		const keyword = searchBar.value.trim();
		if (!keyword) return;

		const storageKey = `recentSearch_${userNo.value}`;
		let list = JSON.parse(localStorage.getItem(storageKey) || "[]");

		// 중복 제거 후 맨 앞에 추가
		list = list.filter(item => item !== keyword);
		list.unshift(keyword);
		if (list.length > 10) list = list.slice(0, 10);

		// localStorage 저장
		localStorage.setItem(storageKey, JSON.stringify(list));

		// 최근 검색어 화면에 업데이트
		renderRecentKeywords();

		form.submit(); // 저장 후 제출
	}

	function renderRecentKeywords() {
		const storageKey = `recentSearch_${userNo.value}`;
		const list = JSON.parse(localStorage.getItem(storageKey) || "[]");

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
