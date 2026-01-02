document.addEventListener('click', async e => {
  const reviewWriteBtn = e.target.closest('.review-write'); // 수정: closest로 정확히 찾기
  const productLink = e.target.closest('.product-link');
  const reviewNoForm = document.querySelector('#reviewNo');
  if (reviewWriteBtn && productLink) {
    e.stopPropagation();
    e.preventDefault(); 

    const reviewNo = productLink.dataset.reviewNo;
	reviewNoForm.value = reviewNo;
    console.log('리뷰 번호:', reviewNo);

    if (!reviewNo) {
      alert('리뷰 정보를 찾을 수 없습니다.');
      return;
    }

    // targetItem 역할을 대신할 가짜 객체 생성
    const fakeTargetItem = {
      classList: {
        contains: className => className === 'type-transaction-complete'
      }
    };

    // header.js에 정의된 함수 호출 (리뷰 작성 모드로)
    await fetchReviewDetails(reviewNo, fakeTargetItem);

    // 모달 표시
    reviewModal.style.display = 'flex';
	
  }
});
