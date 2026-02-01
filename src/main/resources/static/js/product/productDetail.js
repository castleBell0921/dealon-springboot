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
                    modal.style.display = 'block';
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

// 모달 열기
function reportProduct() {
    const modal = document.getElementById('reportModal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
}

// 모달 닫기
function closeReportModal() {
    const modal = document.getElementById('reportModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // 배경 스크롤 허용
    document.getElementById('reportForm').reset(); // 폼 초기화
}

// 신고 제출 처리
function submitReport(event) {
    event.preventDefault();
    
    const reason = document.querySelector('input[name="reportReason"]:checked').value;
    const detail = document.getElementById('reportDetail').value;

    // AJAX 요청 예시 (백엔드 엔드포인트에 맞춰 수정 필요)
    /*
    fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            productNo: productNo,
            reason: reason,
            detail: detail
        })
    }).then(res => {
        if(res.ok) {
            alert('신고가 성공적으로 접수되었습니다.');
            closeReportModal();
        }
    });
    */

    alert(`신고가 접수되었습니다.\n사유: ${reason}\n내용: ${detail}`);
    closeReportModal();
}

// 모달 바깥 영역 클릭 시 닫기
window.onclick = function(event) {
    const modal = document.getElementById('reportModal');
    if (event.target == modal) {
        closeReportModal();
    }
}