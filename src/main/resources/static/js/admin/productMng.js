document.addEventListener('DOMContentLoaded', () => {

	document.querySelectorAll('.post-card').forEach(card => {
	    card.addEventListener('click', async () => {
			const productNo = card.dataset.productNo;
			try {
		            const res = await fetch(`/admin/getProductDetail?productNo=${productNo}`);
		            const data = await res.json();

		            console.log(data);

		            // 모달 열기
		            document.getElementById('productModal').style.display = 'flex';

		            // 예시: 모달에 값 세팅
		            document.querySelector('.modal-title').innerText = data.name;
		            document.querySelector('.modal-price').innerText = data.price + '원';
		            document.querySelector('.modal-seller').innerText = '판매자: ' + data.sellerNickname;
					document.querySelector('.modal-location').innerText = data.location;
					document.querySelector('.img').src = data.thumbnailUrl;
					document.querySelector('.modal-description').innerText = data.detail;
					document.querySelector('.modal-breadcrumb').innerText = data.categoryName;

		        } catch (err) {
		            console.error('상품 상세 조회 실패', err);
		        }
	    });
	});
	
	// 모달 바깥쪽 클릭 시 닫기
	document.getElementById('productModal').addEventListener('click', (e) => {
	    if (e.target === document.getElementById('productModal')) {
	        document.getElementById('productModal').style.display = 'none';
	    }
	});	
});