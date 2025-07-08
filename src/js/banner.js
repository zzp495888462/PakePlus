// 轮播图实现
document.addEventListener('DOMContentLoaded', function() {
	// 获取DOM元素
	const carousel = document.getElementById('carousel');
	const slides = document.getElementById('slides');
	const slideItems = document.querySelectorAll('.carousel-slide');
	const prevBtn = document.getElementById('prevBtn');
	const nextBtn = document.getElementById('nextBtn');
	const indicatorsContainer = document.getElementById('indicators');

	// 轮播图配置
	let currentIndex = 0;
	const slideCount = slideItems.length;
	let autoplayInterval;
	const autoplayDuration = 4000; // 自动播放间隔（毫秒）

	// 创建指示器
	function createIndicators() {
		for (let i = 0; i < slideCount; i++) {
			const indicator = document.createElement('div');
			indicator.className = 'carousel-indicator';
			indicator.setAttribute('data-index', i);
			indicator.addEventListener('click', function() {
				goToSlide(i);
			});
			indicatorsContainer.appendChild(indicator);
		}
		updateIndicators();
	}

	// 更新指示器状态
	function updateIndicators() {
		const indicators = document.querySelectorAll('.carousel-indicator');
		indicators.forEach((indicator, index) => {
			if (index === currentIndex) {
				indicator.classList.add('active');
			} else {
				indicator.classList.remove('active');
			}
		});
	}

	// 切换到指定幻灯片
	function goToSlide(index) {
		// 边界检查
		if (index < 0) index = slideCount - 1;
		if (index >= slideCount) index = 0;

		// 更新当前索引
		currentIndex = index;

		// 移动轮播图
		const offset = -currentIndex * 100;
		slides.style.transform = `translateX(${offset}%)`;

		// 更新指示器
		updateIndicators();

		// 重置自动播放计时器
		resetAutoplay();
	}

	// 前往上一张幻灯片
	function goToPrevSlide() {
		goToSlide(currentIndex - 1);
	}

	// 前往下一张幻灯片
	function goToNextSlide() {
		goToSlide(currentIndex + 1);
	}

	// 开始自动播放
	function startAutoplay() {
		autoplayInterval = setInterval(goToNextSlide, autoplayDuration);
	}

	// 停止自动播放
	function stopAutoplay() {
		clearInterval(autoplayInterval);
	}

	// 重置自动播放
	function resetAutoplay() {
		stopAutoplay();
		startAutoplay();
	}

	// 初始化轮播图
	function initCarousel() {
		// 创建指示器
		createIndicators();

		// 添加按钮事件监听
		prevBtn.addEventListener('click', goToPrevSlide);
		nextBtn.addEventListener('click', goToNextSlide);

		// 添加鼠标悬停事件
		carousel.addEventListener('mouseenter', stopAutoplay);
		carousel.addEventListener('mouseleave', startAutoplay);

		// 开始自动播放
		startAutoplay();
	}

	// 初始化
	initCarousel();
});