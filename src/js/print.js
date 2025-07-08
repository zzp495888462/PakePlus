function selectRow(row) {
	// 获取表格中所有的行
	const rows = document.querySelectorAll('#dataTable tbody tr');

	// 移除所有行的选中状态
	rows.forEach(r => r.classList.remove('selected'));

	// 为当前点击的行添加选中状态
	row.classList.add('selected');
}

function navigateTo(url) {
	// 可以添加额外逻辑，如记录日志、验证等
	window.location.href = url;
}