document.addEventListener('DOMContentLoaded', () => {

	document.addEventListener('click', (e) => {
		if(e.target.className=='product-img') {
			const hiddenInput = e.target.parentElement.previousElementSibling;
			if (hiddenInput) {
				const productNo = hiddenInput.value;
				location.href=`/product/detail/${productNo}`;
			}
		}
	});

	// 드래그 스크롤시 이미지 선택 방지
	const sliders = document.querySelectorAll('.draggable-list');

	sliders.forEach(slider => {

		// 스크롤바 로직
		const scrollbarThumb = slider.parentElement.querySelector('.scrollbar-thumb');
		const updateScrollbar = () => {
			if (!scrollbarThumb) return;
			const containerWidth = slider.clientWidth; // 현재 보이는 컨테이너 너비
			const scrollWidth = slider.scrollWidth; // 스크롤 가능한 전체 컨테이너 너비

			if (scrollWidth <= containerWidth) {
				scrollbarThumb.style.width = '100%';
				scrollbarThumb.style.left = '0%';
				return;
			}
			// (보이는 너비 / 전체넓이 ) * 100 = 내용이 많으면 스크롤바 짧아지고 적으면 길어짐
			const thumbWidthPercent = (containerWidth / scrollWidth) * 100;

			const maxScrollLeft = scrollWidth - containerWidth;
			const currentScroll = slider.scrollLeft;
			const scrollRatio = currentScroll / maxScrollLeft;
			const thumbLeftPercent = scrollRatio * (100 - thumbWidthPercent);

			scrollbarThumb.style.width = `${thumbWidthPercent}%`;
			scrollbarThumb.style.left = `${thumbLeftPercent}%`;
		};

		slider.addEventListener('scroll', updateScrollbar);
		window.addEventListener('resize', updateScrollbar);
		new ResizeObserver(updateScrollbar).observe(slider);
		updateScrollbar();
		
		
		// 드래그 로직
		let isDown = false;
		let startX;
		let scrollLeft;
		let isDragging = false;
		
		// 마우스 누름
		slider.addEventListener('mousedown', (e) => {
			isDown = true;
			isDragging = false; // 드래그 시작 초기화
			slider.classList.add('active');
			startX = e.pageX - slider.offsetLeft;
			scrollLeft = slider.scrollLeft;
		});

		// 마우스 떠남
		slider.addEventListener('mouseleave', () => {
			isDown = false;
			slider.classList.remove('active');
		});

		// 마우스 뗌
		slider.addEventListener('mouseup', (e) => {
			isDown = false;
			slider.classList.remove('active');
			setTimeout(() => {
				isDragging = false;
			}, 100);
		});

		// 마우스 움직임
		slider.addEventListener('mousemove', (e) => {
			if (!isDown) return;
			e.preventDefault(); // 텍스트 선택 등 브라우저 기본 동작 막기

			const x = e.pageX - slider.offsetLeft;
			const walk = (x - startX) * 1; // 스크롤 속도
			slider.scrollLeft = scrollLeft - walk;

			// 5픽셀 이상 움직였을 때만 '드래그'로 판단
			if (Math.abs(walk) > 5) {
				isDragging = true;
			}
		});

		// 드래그시 이미지 클릭 방지
		const links = slider.querySelectorAll('a');
		links.forEach(link => {
			link.addEventListener('click', (e) => {
				if (isDragging) {
					e.preventDefault();
					e.stopPropagation(); // 상위로 전파 방지
				}
			});

			link.ondragstart = () => false;
		});
	});
});