let deletedImages = []; // 삭제할 *기존* 이미지 URL 목록

document.addEventListener('DOMContentLoaded', function () {

    const imageUpload = document.getElementById('product-photo-upload');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const imageCounter = document.getElementById('image-counter');

    let imageFiles = new DataTransfer();

    imageUpload.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);

        const currentExistingCount = document.querySelectorAll('.image-preview[data-existing-url]').length;

        if (currentExistingCount + imageFiles.items.length + files.length > 10) {
            alert('이미지는 최대 10개까지 업로드할 수 있습니다.');
            e.target.value = "";
            return;
        }

        files.forEach(file => imageFiles.items.add(file));
        imageUpload.files = imageFiles.files;
        updateImagePreview();
		if (imageFiles.files.length === files.length) { 
		    // 처음 이미지가 추가된 순간
		    analyzeImageAndSetCategory(imageFiles.files[0]);
		}
    });

    function updateImagePreview() {
        // 1. 'new-preview' 클래스를 가진 (JS로 생성된) 프리뷰만 삭제
        imagePreviewContainer.querySelectorAll('.new-preview').forEach(el => el.remove());

        // 2. imageFiles에 있는 *새 파일*들을 프리뷰로 생성
        Array.from(imageFiles.files).forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const previewWrapper = document.createElement('div');
                previewWrapper.className = 'image-preview new-preview';
                previewWrapper.style = 'position: relative; width: 100px; height: 100px;'; // ProductForm.css와 일치

                const img = document.createElement('img');
                img.src = e.target.result;
                img.style = 'width: 100%; height: 100%; object-fit: cover; border-radius: 8px;';

                const removeButton = document.createElement('button');
                removeButton.type = 'button';
                removeButton.className = 'remove-preview'; // ProductForm.css와 일치
                removeButton.innerText = 'X';
                removeButton.style = 'position: absolute; top: 2px; right: 5px; background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 12px;';

                removeButton.onclick = () => {
                    const newFiles = new DataTransfer();
                    const currentFiles = Array.from(imageFiles.files);
                    currentFiles.splice(index, 1); // 현재 인덱스의 파일만 제거
                    currentFiles.forEach(f => newFiles.items.add(f));

                    imageFiles = newFiles;
                    imageUpload.files = imageFiles.files;
                    updateImagePreview(); // 프리뷰 다시 그리기
                };

                previewWrapper.appendChild(img);
                previewWrapper.appendChild(removeButton);
                imagePreviewContainer.appendChild(previewWrapper);
            };
            reader.readAsDataURL(file);
        });

        updateImageCounter();
    }

    function updateImageCounter() {
        const existingCount = document.querySelectorAll('.image-preview[data-existing-url]').length;
        const newCount = imageFiles.files.length;
        imageCounter.innerText = `${existingCount + newCount}/10`;
    }


    document.querySelectorAll('.image-preview[data-existing-url]').forEach(previewElement => {
        const removeBtn = previewElement.querySelector('.remove-preview');
        removeBtn.addEventListener('click', () => {
            const existingUrl = previewElement.dataset.existingUrl;

            if (existingUrl && !deletedImages.includes(existingUrl)) {
                deletedImages.push(existingUrl);
            }
            previewElement.remove(); // DOM에서 제거
            updateImageCounter(); // 카운터 업데이트
        });
    });

    updateImageCounter();

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
                const selectedValue = item.dataset.value || selectedText; // (data-value="${cat.no}" 사용)

                hiddenInput.value = selectedValue;
                displayElement.textContent = selectedText;
                displayElement.style.color = '#333';
				displayElement.classList.remove('ai-recommended'); // 🔥 AI 추천 제거
                modal.style.display = 'none';
            });
        });
    }

    // (모달 실행)
    setupModal('category-select', 'category-modal', 'category-hidden-input', 'category-select');

    // (주소찾기 실행)
    document.getElementById('location-select').addEventListener('click', function() {
        new daum.Postcode({
            oncomplete: function(data) {
                let addr = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
                document.getElementById('location-hidden-input').value = addr;
                document.getElementById('location-select').textContent = addr;
                document.getElementById('location-select').style.color = '#333';
            }
        }).open();
    });

    // --- 4. 폼 제출 로직 (AJAX/Fetch 사용) ---
    document.getElementById('product-form').addEventListener('submit', async function (e) {
        e.preventDefault(); // 기본 폼 제출(새로고침) 방지

        const currentCount = document.querySelectorAll('.image-preview').length;
        if (currentCount === 0) {
            alert('이미지를 하나 이상 등록해주세요.');
            return;
        }

        const formData = new FormData(document.getElementById('product-form'));

        // *새로 추가된* 파일(imageFiles)을 FormData에 추가 ---- 이미지 중복추가로 임시 주석처리
        // Array.from(imageFiles.files).forEach(file => {
        //     formData.append('productImages', file);
        // });

        formData.set('deletedImages', deletedImages.join(','));

        // (디버깅용)
        // for (let [key, value] of formData.entries()) {
        //    console.log(`${key}:`, value);
        // }

        try {
            const response = await fetch('/product/updateNormal', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                alert('상품이 성공적으로 수정되었습니다.');
                window.location.href = response.url; // 성공 시 상세 페이지로 이동
            } else {
                alert('상품 수정에 실패했습니다.');
            }
        } catch (error) {
            console.error('Submit Error:', error);
            alert('상품 수정 중 오류가 발생했습니다.');
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