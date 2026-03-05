document.addEventListener('DOMContentLoaded', () => {

	const filterBtns = document.querySelectorAll('.filter-btn');
	const tbody = document.querySelector('.admin-table tbody');
	const pagination = document.querySelector('.pagination');

	let currentPage = 1;
	let currentType = "open"; // open | closed

	// 필터 버튼
	filterBtns.forEach((btn, index) => {

		btn.addEventListener('click', () => {

			filterBtns.forEach(b => b.classList.remove('active'));
			btn.classList.add('active');

			currentPage = 1;

			if(index === 0){
				currentType = "open";
			}else{
				currentType = "closed";
			}

			loadList();

		});

	});

	// 리스트 불러오기
	async function loadList(){

		let url;

		if(currentType === "open"){
			url = `/admin/inquiryList?page=${currentPage}`;
		}else{
			url = `/admin/finishedInquiry?page=${currentPage}`;
		}

		try{

			const response = await fetch(url);

			if(!response.ok){
				throw new Error("데이터 로드 실패");
			}

			const data = await response.json();

			renderList(data.list);
			renderPagination(data.pi);

		}catch(e){
			console.error(e);
		}

	}

	// 테이블 렌더링
	function renderList(list){

		tbody.innerHTML = '';

		list.forEach(item => {

			let statusText;
			let statusClass;

			if(item.status === 'CLOSED'){
				statusText = '문의마감';
				statusClass = 'CLOSED';
			}else if(item.lastAnswerRole === 'USER'){
				statusText = '답변대기';
				statusClass = 'waiting';
			}else{
				statusText = '답변완료';
				statusClass = 'answered';
			}

			const row = `
			<tr>
				<td>${item.inquiryId}</td>
				<td>${item.category}</td>
				<td class="text-left">
					<a href="/admin/helpPage/${item.inquiryId}">
						${item.title}
					</a>
				</td>
				<td>${item.userNo}</td>
				<td>${item.createdAt.substring(0,10)}</td>
				<td>
					<span class="status-badge ${statusClass}">
						${statusText}
					</span>
				</td>
				<td>
					<a href="/admin/helpPage/${item.inquiryId}" 
					   class="btn-sm-reply ${item.status === 'CLOSED' ? 'disabled' : ''}">
					   답변하기
					</a>
				</td>
			</tr>
			`;

			tbody.insertAdjacentHTML('beforeend', row);

		});

	}

	// 페이지네이션 렌더링
	function renderPagination(pi){

		let html = '';

		if(pi.currentPage > 1){
			html += `<a class="prev" data-page="${pi.currentPage-1}">&lt;</a>`;
		}

		for(let i = pi.startPage; i <= pi.endPage; i++){

			if(i === pi.currentPage){
				html += `<span class="active">${i}</span>`;
			}else{
				html += `<a data-page="${i}">${i}</a>`;
			}

		}

		if(pi.currentPage < pi.maxPage){
			html += `<a class="next" data-page="${pi.currentPage+1}">&gt;</a>`;
		}

		pagination.innerHTML = html;

		// 페이지 클릭 이벤트
		document.querySelectorAll('.pagination a').forEach(a => {

			a.addEventListener('click', () => {

				currentPage = a.dataset.page;

				loadList();

			});

		});

	}

});