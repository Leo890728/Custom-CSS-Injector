// 编辑器載入器 - 避免 CSP 限制
(function() {
    window.CM = {
        loaded: true,
        SimpleEditor: true
    };

    console.log('编辑器已準備就緒');

    // 觸發載入完成事件
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.dispatchEvent(new Event('codemirror-loaded'));
        });
    } else {
        window.dispatchEvent(new Event('codemirror-loaded'));
    }
})();
