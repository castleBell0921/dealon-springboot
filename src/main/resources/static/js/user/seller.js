function showTab(tabId, element) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.getElementById('tab-' + tabId).classList.add('active');

    document.querySelectorAll('.tab-item').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
}

function timeForToday(value) {
    const today = new Date();
    const timeValue = new Date(value);

    const betweenTime = Math.floor((today.getTime() - timeValue.getTime()) / 1000 / 60);

    if (betweenTime < 1) return '방금 전';
    if (betweenTime < 60) return `${betweenTime}분 전`;

    const betweenTimeHour = Math.floor(betweenTime / 60);
    if (betweenTimeHour < 24) return `${betweenTimeHour}시간 전`;

    const betweenTimeDay = Math.floor(betweenTime / 60 / 24);
    if (betweenTimeDay < 365) return `${betweenTimeDay}일 전`;

    return `${Math.floor(betweenTimeDay / 365)}년 전`;
}

document.addEventListener("DOMContentLoaded", function() {
    const dateElements = document.querySelectorAll(".time-ago");
    dateElements.forEach(function(element) {
        const dateStr = element.getAttribute("data-date");
        if(dateStr) {
            element.innerText = timeForToday(dateStr);
        }
    });
});

