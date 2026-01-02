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


    // stats.html
    const counters = document.querySelectorAll('.count-up');

    if (counters.length > 0) {
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const duration = 2000;
            const start = 0;
            const startTime = performance.now();

            function updateCount(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const ease = 1 - Math.pow(1 - progress, 4); // easeOutQuart

                counter.innerText = Math.floor(start + (target * ease)).toLocaleString();

                if (progress < 1) {
                    requestAnimationFrame(updateCount);
                } else {
                    counter.innerText = target.toLocaleString();
                }
            }
            requestAnimationFrame(updateCount);
        });
    }
});