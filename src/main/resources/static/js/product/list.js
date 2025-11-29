document.addEventListener("DOMContentLoaded", function () {
    
    // 시간 00전 표시
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

    // 주소 자르기
    
    const items = document.querySelectorAll(".location");

    items.forEach(el => {
        const location = el.getAttribute("data-location");
        const parts = location.split(" ");

        let endIndex = -1;

        parts.forEach((part, idx) => {
            if (part.endsWith("시") || part.endsWith("군") || part.endsWith("구")) {
                endIndex = idx;
            }
        });

        // 시/군/구가 하나라도 있었다면 그까지 join
        const result = endIndex >= 0
            ? parts.slice(0, endIndex + 1).join(" ")
            : location;

        el.textContent = result;
    });
});

