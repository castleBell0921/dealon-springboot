document.addEventListener('DOMContentLoaded', () => {

	const searchBtn = document.querySelector('.search-btn');
	const searchBar = document.querySelector('.searchbar-input');
	const form = document.querySelector('#form');
	searchBtn.addEventListener('click', () => {
		form.submit();
	});
});
	