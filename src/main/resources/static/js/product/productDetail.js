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

    const deleteBtn = document.getElementById("delete-btn");

    if (deleteBtn) {
        deleteBtn.addEventListener("click", function() {
            // productNo는 normalDetail.html에서 선언한 전역변수
            if (confirm("정말로 이 상품을 삭제하시겠습니까?")) {
                location.href = `/product/delete/${productNo}`;
            }
        });
    }

});

function toggleWishlist(productNo) {
    fetch('/product/wishlist/toggle', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'productNo=' + productNo
    })
        .then(response => response.text())
        .then(result => {
            if (result === 'login_required') {
                if(confirm("로그인이 필요한 서비스입니다.\n로그인 페이지로 이동하시겠습니까?")) {
                    location.href = '/user/login';
                }
                return;
            }

            const btn = document.getElementById('wishlist-btn');

            if (result === 'added') {
                btn.classList.add('active'); // 하트 채우기
                alert("찜 목록에 추가되었습니다.");
            } else if (result === 'removed') {
                btn.classList.remove('active'); // 하트 비우기
                alert("찜 목록에 삭제되었습니다.");
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('찜 목록 추가에 실패하였습니다.');
        });
}