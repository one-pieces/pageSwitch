A plugin for switching pages.

How to use
$("#yourDiv").PageSwitch({
    // defaults
    selectors : {
        sections: ".sections",
        section: ".section",
        page: ".pages",
        active: ".active"
    },
    index: 0, // 页面开始的索引
    easing: "ease", // 动画效果
    duration: 700, // 动画执行时间
    loop: false, // 是否循环切换
    pagination: true, // 是否进行分页
    keyboard: true, // 是否触发键盘事件
    direction: "vertical", // 滑动方向vertical, horizontal
    callback: "" // 翻页后回调函数
});