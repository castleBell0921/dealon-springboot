document.addEventListener("DOMContentLoaded", function () {
    Chart.register(ChartDataLabels);

    let currentType = 'weekly';
    const pastelColors = ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF', '#E2CBF7', '#FADADD', '#CFCFC4', '#F4C2C2', '#B2CEFE'];
    const stateNameMap = { 'A': '판매중', 'R': '예약중', 'S': '판매완료', 'D': '비활성화' };

    let visitorChartInstance = null;
    let categoryChartInstance = null;
    let stateChartInstance = null;

    // 차트 초기화 시작
    initDashboard();

    // 탭 클릭 이벤트 주간/월간
    document.querySelectorAll('.chart-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            currentType = this.getAttribute('data-type');
            const monthSelect = document.getElementById('filter-month');

            // 월간일 경우 월 선택 숨기기
            if(currentType === 'monthly') {
                monthSelect.style.display = 'none';
            } else {
                monthSelect.style.display = 'inline-block';
            }
            fetchVisitorData();
        });
    });

    // 드롭다운 변경 이벤트
    document.getElementById('filter-year').addEventListener('change', fetchVisitorData);
    document.getElementById('filter-month').addEventListener('change', fetchVisitorData);

    function initDashboard() {
        fetch('/admin/api/dashboard/charts')
            .then(res => res.json())
            .then(data => {
                initDropdowns(data.dateRange);
                renderCategoryChart(data.categoryData);
                renderStateChart(data.stateData);
                renderVisitorChart(data.visitorData, currentType);
            });
    }

    function fetchVisitorData() {
        const year = document.getElementById('filter-year').value;
        const month = document.getElementById('filter-month').value;

        fetch(`/admin/api/dashboard/charts?type=${currentType}&year=${year}&month=${month}`)
            .then(res => res.json())
            .then(data => {
                renderVisitorChart(data.visitorData, currentType);
            });
    }

    // 드롭다운 동적 렌더링 (첫 기록부터 현재까지)
    function initDropdowns(dateRange) {
        const minDateStr = dateRange.MIN_DATE || '2024-01';
        const maxDateStr = dateRange.MAX_DATE || '2025-12';

        const minYear = parseInt(minDateStr.split('-')[0]);
        const maxYear = parseInt(maxDateStr.split('-')[0]);
        const maxMonth = parseInt(maxDateStr.split('-')[1]);

        const yearSelect = document.getElementById('filter-year');
        const monthSelect = document.getElementById('filter-month');

        yearSelect.innerHTML = '';
        for(let y = minYear; y <= maxYear; y++) {
            yearSelect.innerHTML += `<option value="${y}" ${y === maxYear ? 'selected' : ''}>${y}년</option>`;
        }

        monthSelect.innerHTML = '';
        for(let m = 1; m <= 12; m++) {
            const mStr = String(m).padStart(2, '0');
            monthSelect.innerHTML += `<option value="${mStr}" ${m === maxMonth ? 'selected' : ''}>${m}월</option>`;
        }
    }

    // 방문자 차트 (라인 차트 - 비어있는 주/월은 0으로 채움)
    function renderVisitorChart(visitorData, type) {
        let labels = [];
        let dataArray = [];

        if(type === 'weekly') {
            // 딱 4주차까지만 배열 세팅
            labels = ['1주차', '2주차', '3주차', '4주차'];
            dataArray = [0, 0, 0, 0];

            visitorData.forEach(item => {
                let weekIndex = parseInt(item.label) - 1; // 1~5 -> 0~4

                // 5주차(index 4) 이상의 데이터는 4주차(index 3)로 강제 합산
                if(weekIndex >= 3) {
                    weekIndex = 3;
                }

                if(weekIndex >= 0) {
                    // 값을 덮어씌우는게 아니라 더하기(+=)로 합산처리
                    dataArray[weekIndex] += item.value;
                }
            });
        } else {
            labels = Array.from({length: 12}, (_, i) => `${i+1}월`);
            dataArray = new Array(12).fill(0);
            visitorData.forEach(item => {
                const monthIndex = parseInt(item.label) - 1; // 1~12 -> 0~11
                if(monthIndex >= 0 && monthIndex < 12) dataArray[monthIndex] = item.value;
            });
        }

        if(visitorChartInstance) visitorChartInstance.destroy();

        const ctx = document.getElementById('visitorChart').getContext('2d');
        visitorChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: '접속자 수',
                    data: dataArray,
                    borderColor: '#7ba0ff',
                    backgroundColor: 'rgba(123, 160, 255, 0.2)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    datalabels: { display: false } // 라인차트는 숫자 숨김
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    // 카테고리 도넛 차트 (범례 및 퍼센트)
    function renderCategoryChart(dataList) {
        if(categoryChartInstance) categoryChartInstance.destroy();

        const labels = dataList.map(d => d.label);
        const values = dataList.map(d => d.value);
        const total = values.reduce((a, b) => a + b, 0);

        const ctx = document.getElementById('categoryChart').getContext('2d');
        categoryChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: pastelColors.slice(0, labels.length),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    datalabels: {
                        color: '#444',
                        font: { weight: 'bold', size: 11 },
                        formatter: (value) => {
                            if(total === 0) return '';
                            return Math.round((value / total) * 100) + '%'; // %비율 숫자만 표기
                        }
                    }
                }
            }
        });

        // HTML 범례 렌더링
        const legendDiv = document.getElementById('category-legend');
        legendDiv.innerHTML = dataList.map((d, i) => `
            <div style="display:flex; align-items:center; gap:5px;">
                <span style="width:12px; height:12px; background:${pastelColors[i]}; border-radius:50%; display:inline-block;"></span>
                <span>${d.label} (${d.value}개)</span>
            </div>
        `).join('');
    }

    // 상품 상태 도넛 차트 (범례, 퍼센트, 갯수)
    function renderStateChart(dataList) {
        if(stateChartInstance) stateChartInstance.destroy();

        const labels = dataList.map(d => stateNameMap[d.label] || d.label);
        const values = dataList.map(d => d.value);
        const total = values.reduce((a, b) => a + b, 0);
        // 상태 차트용 파스텔 색상 (카테고리와 살짝 다른 구성을 위해 역순 사용)
        const stateColors = [...pastelColors].reverse();

        const ctx = document.getElementById('stateChart').getContext('2d');
        stateChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: stateColors.slice(0, labels.length),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    datalabels: {
                        color: '#444',
                        font: { weight: 'bold', size: 11 },
                        textAlign: 'center',
                        formatter: (value) => {
                            if(total === 0) return '';
                            let percent = Math.round((value / total) * 100) + '%';
                            return percent + '\n' + value; // %비율과 갯수 동시 표기
                        }
                    }
                }
            }
        });

        // HTML 범례 렌더링
        const legendDiv = document.getElementById('state-legend');
        legendDiv.innerHTML = dataList.map((d, i) => `
            <div style="display:flex; align-items:center; gap:5px;">
                <span style="width:12px; height:12px; background:${stateColors[i]}; border-radius:50%; display:inline-block;"></span>
                <span>${stateNameMap[d.label] || d.label}</span>
            </div>
        `).join('');
    }
});