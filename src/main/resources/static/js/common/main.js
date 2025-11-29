document.addEventListener('DOMContentLoaded', () => {
	document.addEventListener('click', (e) => {
		if(e.target.className=='product-img') {
			productNo = e.target.parentElement.previousElementSibling.value;
			
			location.href=`/product/detail/${productNo}`;
		}
	});
});