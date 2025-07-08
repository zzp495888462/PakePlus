document.addEventListener('DOMContentLoaded', function() {
	// 获取DOM元素
	const hoursElement = document.getElementById('hours');
	const minutesElement = document.getElementById('minutes');
	const secondsElement = document.getElementById('seconds');
	const periodElement = document.getElementById('period');
	const dateElement = document.getElementById('date');

	// 星期和月份的中文显示
	const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
	const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

	// 更新时间显示
	function updateTime() {
		const now = new Date();

		// 获取时分秒
		let hours = now.getHours();
		const minutes = now.getMinutes();
		const seconds = now.getSeconds();

		// 确定上午/下午
		const period = hours >= 12 ? '下午' : '上午';

		// 转换为12小时制
		hours = hours % 12;
		hours = hours ? hours : 12; // 0应该显示为12

		// 格式化数字为两位数
		const formattedHours = hours.toString().padStart(2, '0');
		const formattedMinutes = minutes.toString().padStart(2, '0');
		const formattedSeconds = seconds.toString().padStart(2, '0');

		// 获取日期信息
		const weekday = weekdays[now.getDay()];
		const month = months[now.getMonth()];
		const day = now.getDate();
		const year = now.getFullYear();

		const formattedDate = `${year}年${month}${day}日 ${weekday}`;

		// 更新时间显示并添加动画效果
		updateElementWithAnimation(hoursElement, formattedHours);
		updateElementWithAnimation(minutesElement, formattedMinutes);
		updateElementWithAnimation(secondsElement, formattedSeconds);
		updateElementWithAnimation(periodElement, period);

		// 更新日期
		dateElement.textContent = formattedDate;
	}

	// 更新元素内容并添加动画
	function updateElementWithAnimation(element, newValue) {
		if (element.textContent !== newValue) {
			element.classList.add('changing');
			setTimeout(() => {
				element.textContent = newValue;
				element.classList.remove('changing');
			}, 250);
		}
	}

	// 首次调用更新时间
	updateTime();

	// 每秒更新一次
	setInterval(updateTime, 1000);
});