document.addEventListener("DOMContentLoaded", function() {
    const btn = document.querySelector('.upProduct');
    const createDate = btn ? btn.dataset.date : null;

    if (btn && createDate) {
        const now = new Date();
        const postDate = new Date(createDate);

        const nextUpDate = new Date(postDate);
        nextUpDate.setDate(postDate.getDate() + 5);

        const smallText = document.getElementById("up-next-date");

        if (now - postDate < 5 * 24 * 60 * 60 * 1000) {
            btn.disabled = true;
            btn.classList.add("sellProduct");

            const yyyy = nextUpDate.getFullYear();
            const mm = String(nextUpDate.getMonth() + 1).padStart(2, "0");
            const dd = String(nextUpDate.getDate()).padStart(2, "0");

            if (smallText) smallText.textContent = `⏳ 다음 끌어올리기 가능: ${yyyy}-${mm}-${dd}`;
        } else {
            if (smallText) smallText.textContent = "끌어올리기가 가능합니다.";
        }
    }

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

        if(prevBtn) {
            prevBtn.addEventListener('click', () => {
                currentIndex = (currentIndex - 1 + totalImages) % totalImages;
                updateSlider();
            });
        }

        if(nextBtn) {
            nextBtn.addEventListener('click', () => {
                currentIndex = (currentIndex + 1) % totalImages;
                updateSlider();
            });
        }
    }

    const deleteBtn = document.getElementById("delete-btn");

    if (deleteBtn) {
        deleteBtn.addEventListener("click", function() {
            if (confirm("정말로 이 상품을 삭제하시겠습니까?")) {
                fetch(`/product/delete/${productNo}`, {
                    method: 'POST'
                }).then((response) => {
                    if (response.redirected) {
                        location.href = response.url;
                        return;
                    }
                    location.href = '/product/list';
                }).catch((error) => {
                    alert('상품 삭제에 실패했습니다.');
                });
            }
        });
    }

    const elements = document.querySelectorAll(".time-ago");

    elements.forEach(el => {
        const dateString = el.getAttribute("data-date");
        const date = new Date(dateString);
        const now = new Date();

        const diffMs = now - date;
        const diffMinutes = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        let result = "";

        if (diffMinutes < 1) {
            result = "방금 전";
        } else if (diffMinutes < 60) {
            result = diffMinutes + "분 전";
        } else if (diffHours < 24) {
            result = diffHours + "시간 전";
        } else {
            result = diffDays + "일 전";
        }

        el.textContent = result;
    });

    const upProduct = document.querySelector('.upProduct');
    if(upProduct) {
        upProduct.addEventListener('click', async()=>{
            if (upProduct.classList.contains("sellProduct")) {
                alert("아직 5일이 지나지 않아 끌어올릴 수 없습니다.");
                return;
            }

            try{
                const response = await fetch('/product/upProduct', {
                    method: 'POST',
                    headers: {
                        "Content-Type" : "application/json"
                    },
                    body: JSON.stringify(productNo)
                });

                if(response.ok){
                    alert('끌어올리기에 성공했습니다!');
                    location.reload();
                } else{
                    alert('끌어올리기에 실패했습니다.');
                }
            }catch(err){
                alert('오류가 발생했습니다.');
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
                    const modal = document.getElementById('loginModal');
                    if(modal) modal.style.display = 'block';
                    else location.href = '/user/login';
                }
                return;
            }

            const btn = document.getElementById('wishlist-btn');

            if (result === 'added') {
                btn.classList.add('active');
                alert("찜 목록에 추가되었습니다.");
            } else if (result === 'removed') {
                btn.classList.remove('active');
                alert("찜 목록에 삭제되었습니다.");
            }
        })
        .catch(error => {
            alert('찜 목록 추가/삭제에 실패하였습니다.');
        });
}