document.addEventListener("DOMContentLoaded", () => {
    const avatar = document.getElementById("avatarPreview");
    const fileInput = document.getElementById("avatarInput");

    // 아바타 클릭하면 input[type=file] 클릭
    avatar.addEventListener("click", () => {
        fileInput.click();
    });

    // 파일 선택 시 미리보기 적용
    fileInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                avatar.src = e.target.result; // 미리보기 반영
            };
            reader.readAsDataURL(file);
        }
    });
});

