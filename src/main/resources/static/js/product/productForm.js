document.addEventListener('DOMContentLoaded', function () {
    // --- 이미지 업로드 순서 보장 로직 ---
    const imageUpload = document.getElementById('product-photo-upload');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const imageCounter = document.getElementById('image-counter');

    // FileList를 관리하기 위한 DataTransfer 객체 생성 (순서 보장 핵심)
    let imageFiles = new DataTransfer();

    imageUpload.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
	
        if (imageFiles.items.length + files.length > 10) {
            alert('이미지는 최대 10개까지 업로드할 수 있습니다.');
            e.target.value = ""; // 현재 선택된 파일 초기화
            return;
        }
		
        // 새로 선택된 파일들을 DataTransfer 객체에 순서대로 추가
        files.forEach(file => imageFiles.items.add(file));

        // input의 파일 목록을 업데이트된 DataTransfer의 파일 목록으로 교체
        imageUpload.files = imageFiles.files;

        updateImagePreview();
		
		// 🔥 첫 번째 이미지로 AI 카테고리 분석 (한 번만)
		if (imageFiles.files.length === files.length) { 
		    // 처음 이미지가 추가된 순간
		    analyzeImageAndSetCategory(imageFiles.files[0]);
		}
    });

    function updateImagePreview() {
        imagePreviewContainer.innerHTML = '';

        Array.from(imageFiles.files).forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const previewWrapper = document.createElement('div');
                previewWrapper.style = 'position: relative; width: 150px; height: 150px;';

                const img = document.createElement('img');
                img.src = e.target.result;
                img.style = 'width: 100%; height: 100%; object-fit: cover; border-radius: 8px;';

                const removeButton = document.createElement('button');
                removeButton.type = 'button';
                removeButton.innerText = 'X';
                removeButton.style = 'position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 12px;';

                removeButton.onclick = () => {
                    const newFiles = new DataTransfer();
                    const currentFiles = Array.from(imageFiles.files);
                    currentFiles.splice(index, 1);
                    currentFiles.forEach(f => newFiles.items.add(f));

                    imageFiles = newFiles;
                    imageUpload.files = imageFiles.files;
                    updateImagePreview();
                };

                previewWrapper.appendChild(img);
                previewWrapper.appendChild(removeButton);
                imagePreviewContainer.appendChild(previewWrapper);
            };
            reader.readAsDataURL(file);
        });
        imageCounter.innerText = `${imageFiles.files.length}/10`;
    }

    // --- 모달 로직 (카테고리 번호 저장) ---
    function setupModal(triggerId, modalId, hiddenInputId, displayElementId) {
        const trigger = document.getElementById(triggerId);
        const modal = document.getElementById(modalId);
        const closeBtn = modal.querySelector('.modal-close-btn');
        const hiddenInput = document.getElementById(hiddenInputId);
        const displayElement = document.getElementById(displayElementId);
        const listItems = modal.querySelectorAll('.modal-list li');

        trigger.addEventListener('click', () => { modal.style.display = 'flex'; });
        closeBtn.addEventListener('click', () => { modal.style.display = 'none'; });
        modal.addEventListener('click', (e) => {
            if (e.target === modal) { modal.style.display = 'none'; }
        });

        listItems.forEach(item => {
            item.addEventListener('click', () => {
                const selectedText = item.textContent;
                const selectedValue = item.dataset.value || selectedText;

                hiddenInput.value = selectedValue;
                displayElement.textContent = selectedText;
                displayElement.style.color = '#333';
				displayElement.classList.remove('ai-recommended'); // 🔥 AI 추천 제거
                modal.style.display = 'none';
            });
        });
    }

    // 카테고리 모달은 그대로 사용
    setupModal('category-select', 'category-modal', 'category-hidden-input', 'category-select');

    // 기존 location-modal 관련 setupModal 호출 부분을 아래 코드로 대체 -- 다음 우편번호 검색
    document.getElementById('location-select').addEventListener('click', function() {
        new daum.Postcode({
            oncomplete: function(data) {
                // 팝업에서 검색결과 항목을 클릭했을때 실행할 코드를 작성하는 부분.
                let addr = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
                document.getElementById('location-hidden-input').value = addr;
                document.getElementById('location-select').textContent = addr;
                document.getElementById('location-select').style.color = '#333';
            }
        }).open();
    });

    // --- 폼 제출 유효성 검사 ---
    document.getElementById('product-form').addEventListener('submit', function (e) {
        if (imageFiles.files.length === 0) {
            alert('이미지를 하나 이상 등록해주세요.');
            e.preventDefault();
        }
    });
});

function applyAiCategory(categoryNo, categoryName) {
    const categorySelect = document.getElementById("category-select");
    const hiddenInput = document.getElementById("category-hidden-input");

    categorySelect.textContent = `${categoryName} (AI 추천)`;
    categorySelect.classList.add("ai-recommended");

    hiddenInput.value = categoryNo;
}

async function analyzeImageAndSetCategory(file) {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch("/product/ai/category", {
        method: "POST",
        body: formData
    });

    const data = await res.json();

    if (data.categoryNo && data.categoryName) {
        applyAiCategory(data.categoryNo, data.categoryName);
    }
}
