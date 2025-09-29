document.addEventListener("DOMContentLoaded", function() {
    const slider = document.querySelector('.slider-images');
    if (slider && slider.children.length > 1) {
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        const counter = document.querySelector('.current-image-index');
        const totalImages = slider.children.length;
        let currentIndex = 0;

        function updateSlider() {
            slider.style.transform = `translateX(-${currentIndex * 100}%)`;
            if(counter) counter.textContent = currentIndex + 1;
        }

        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + totalImages) % totalImages;
            updateSlider();
        });

        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % totalImages;
            updateSlider();
        });
    }
});