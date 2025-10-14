document.addEventListener('DOMContentLoaded', function () {
    // --- 이미지 업로드 관련 로직 ---
    const imageUpload = document.getElementById('product-photo-upload');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const imageCounter = document.getElementById('image-counter');
    let imageFiles = new DataTransfer(); // 서버에 전송할 파일 목록을 관리

    imageUpload.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);

        if (imageFiles.items.length + files.length > 10) {
            alert('이미지는 최대 10개까지 업로드할 수 있습니다.');
            return;
        }

        files.forEach(file => imageFiles.items.add(file));
        imageUpload.files = imageFiles.files; // input의 file list 업데이트
        updateImagePreview();
    });

    function updateImagePreview() {
        imagePreviewContainer.innerHTML = ''; // 미리보기 컨테이너 초기화
        Array.from(imageFiles.files).forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const previewWrapper = document.createElement('div');
                previewWrapper.style = 'position: relative; width: 150px; height: 150px;';

                const img = document.createElement('img');
                img.src = e.target.result;
                img.alt = 'preview';
                img.style = 'width: 100%; height: 100%; object-fit: cover; border-radius: 8px;';

                const removeButton = document.createElement('button');
                removeButton.type = 'button';
                removeButton.innerText = 'X';
                removeButton.style = 'position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 12px;';

                removeButton.onclick = () => {
                    const newFiles = new DataTransfer();
                    const currentFiles = Array.from(imageFiles.files);
                    currentFiles.splice(index, 1); // 해당 인덱스의 파일 제거
                    currentFiles.forEach(f => newFiles.items.add(f));

                    imageFiles = newFiles;
                    imageUpload.files = imageFiles.files; // input의 file list 업데이트
                    updateImagePreview(); // 미리보기 다시 렌더링
                };

                previewWrapper.appendChild(img);
                previewWrapper.appendChild(removeButton);
                imagePreviewContainer.appendChild(previewWrapper);
            };
            reader.readAsDataURL(file);
        });
        imageCounter.innerText = `${imageFiles.items.length}/10`;
    }

    // --- 모달 관련 로직 ---
    function setupModal(triggerId, modalId, hiddenInputId, displayElementId) {
        const trigger = document.getElementById(triggerId);
        const modal = document.getElementById(modalId);
        const closeBtn = modal.querySelector('.modal-close-btn');
        const hiddenInput = document.getElementById(hiddenInputId);
        const displayElement = document.getElementById(displayElementId);
        const listItems = modal.querySelectorAll('.modal-list li');

        // 모달 열기
        trigger.addEventListener('click', () => {
            modal.style.display = 'flex';
        });

        // 모달 닫기 (X 버튼)
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        // 모달 닫기 (오버레이 클릭)
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        // 항목 선택
        listItems.forEach(item => {
            item.addEventListener('click', () => {
                const selectedValue = item.textContent;
                hiddenInput.value = selectedValue; // 숨겨진 input에 값 설정
                displayElement.textContent = selectedValue; // 화면에 선택된 값 표시
                displayElement.style.color = '#333'; // 텍스트 색상 변경
                modal.style.display = 'none'; // 모달 닫기
            });
        });
    }

    // 카테고리 모달 설정
    setupModal('category-select', 'category-modal', 'category-hidden-input', 'category-select');

    // 거래 희망 장소 모달 설정
    setupModal('location-select', 'location-modal', 'location-hidden-input', 'location-select');


    // --- 폼 제출 로직 ---
    document.getElementById('product-form').addEventListener('submit', function (e) {
        // 클라이언트 측 유효성 검사 등 필요한 로직 추가 가능
        console.log('상품 등록 폼 제출');
    });
});