document.addEventListener("DOMContentLoaded", function () {

    // 1920 초과시 화면크기 스케일링
    function scaleApp() {
        const baseWidth = 1945;
        const windowWidth = window.innerWidth;
        const scaler = document.getElementById('app-scaler');

        if (!scaler) return;

        const scale = windowWidth / baseWidth;

        scaler.style.transform = `scale(${scale})`;
        scaler.style.height = `${window.innerHeight / scale}px`;
        scaler.style.width = `${baseWidth}px`;
    }

    window.addEventListener('resize', scaleApp);
    scaleApp();


    // stats.html 카운트업 애니메이션
    const counters = document.querySelectorAll('.count-up');

    if (counters.length > 0) {
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');

            let duration = 2000;
            if (target === 0) duration = 0;
            else if (target <= 10) duration = 600;   // 10 이하면 0.6초
            else if (target <= 100) duration = 1200; // 100 이하면 1.2초
            else if (target <= 500) duration = 1500; // 500 이하면 1.5초

            const start = 0;
            const startTime = performance.now();

            function updateCount(currentTime) {
                if (duration === 0) {
                    counter.innerText = target.toLocaleString();
                    return;
                }

                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const ease = 1 - Math.pow(1 - progress, 4); // easeOutQuart

                counter.innerText = Math.round(start + (target * ease)).toLocaleString();

                if (progress < 1) {
                    requestAnimationFrame(updateCount);
                } else {
                    counter.innerText = target.toLocaleString();
                }
            }

            if (target > 0) {
                requestAnimationFrame(updateCount);
            } else {
                counter.innerText = "0";
            }
        });
    }
	
	// 메뉴바 active
	    const currentPath = window.location.pathname;
	    const menuItems = document.querySelectorAll('.menu-item');

	    menuItems.forEach(item => {
	        const link = item.querySelector('a').getAttribute('href');

	        // 현재 경로가 링크 주소와 일치하면 active 클래스 추가
	        if (currentPath === link) {
	            item.classList.add('active');
	        } else {
	            item.classList.remove('active');
	        }
	    });
});