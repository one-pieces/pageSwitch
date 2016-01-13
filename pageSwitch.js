(function($) {
    // 获取浏览器前缀
    // 实现： 判断某个元素的css样式是否存在transition属性
    // 参数： dom元素
    // 返回值： boolean，有则返回浏览器样式前缀，否则返回false
    var _prefix = function(temp) {
        var aPrefix = ["webkit", "Moz", "o", "ms"],
            pros = "";
        for (var i in aPrefix) {
            pros = aPrefix[i] + "Transition";
            if (temp.style[pros] !== undefined) {
                return "-" + aPrefix[i].toLowerCase() + "-";
            }
        }
        return false;
    }(document.createElement(PageSwitch));
    var PageSwitch = (function() {
        function PageSwitch(element, options) {
            this.settings = $.extend(true, $.fn.PageSwitch.defaults, options || {});
            this.element = element;
            this.init();
        }
        PageSwitch.prototype = {
            // 初始化插件
            // 实现：初始化dom结构，布局，分页及绑定事件
            init: function() {
                var me = this;
                me.selectors = me.settings.selectors;
                me.sections = me.element.find(me.selectors.sections);
                me.section = me.sections.find(me.selectors.section);

                me.direction = me.settings.direction === "vertical" ? true : false;
                me.pagesCount = me.getPagesCount();
                me.index = (me.settings.index>=0 && me.settings.index < me.pagesCount) ? 
                    me.settings.index : 0;
                me.canScroll = true;
                if (!me.direction) {
                    me._initLayout();
                }
                if (me.settings.pagination) {
                    me._initPaging();
                }
                me._initEvent();
            },
            // 获取滑动页面数量
            getPagesCount: function() {
                return this.section.length;
            },
            // 获取滑动的宽度（横屏滑动）或高度（竖屏滑动）
            switchLength: function() {
                return this.direction ? this.element.height() : this.element.width();
            },
            // 向前滑动即上一页面
            prev : function() {
                var me = this;
                if (me.index > 0) {
                    me.index--;
                } else if (me.settings.loop) {
                    me.index = me.pagesCount - 1;
                }
                me._scrollPage();
            },
            // 向后滑动即下一页面
            next : function() {
                var me = this;
                if (me.index < me.pagesCount) {
                    me.index++;
                } else if (me.settings.loop) {
                    me.index = 0;
                }
                me._scrollPage();
            },
            // 主要针对横屏情况进行页面布局
            _initLayout: function() {
                var me = this;
                var width = (me.pagesCount * 100) + "%";
                    cellWidth = (100 / me.pagesCount).toFixed(2) + "%";
                me.sections.width(width);
                me.section.width(cellWidth).css("float", "left");
            },
            // 实现分页的dom结构及css样式
            _initPaging: function() {
                var me = this,
                    pageClass= me.selectors.page.substring(1);
                me.activeClass= me.selectors.active.substring(1);
                var pageHtml = "<ul class="+ pageClass + ">";
                for (var i = 0; i < me.pagesCount; i++) {
                    pageHtml += "<li></li>";
                }
                pageHtml += "<ul>";
                me.element.append(pageHtml);
                var pages = me.element.find(me.selectors.page);
                me.pageItem = pages.find("li");
                me.pageItem.eq(me.index).addClass(me.activeClass);
                if (me.direction) {
                    pages.addClass("vertical");
                } else {
                    pages.addClass("horizontal");
                }
            },
            // 初始化插件事件
            _initEvent : function() {
                var me = this;
                me.element.on("click", me.selectors.pages + " li", function() {
                    me.index = $(this).index();
                    me._scrollPage();
                });

                me.element.on("mousewheel DOMMouseScroll", function(e) {
                    if (me.canScroll) {
                        var delta = e.originalEvent.wheelDelta || -e.originalEvent.detail;
                        if (delta > 0 && (me.index && !me.settings.loop || me.settings.loop)) {
                            me.prev();
                        } else if (delta < 0 && (me.index < (me.pagesCount - 1) && 
                            !me.settings.loop || me.settings.loop)) {
                            me.next();
                        }
                    }
                });

                if (me.settings.keyboard) {
                    $(window).on("keydown", function(e) {
                        var keyCode = e.keyCode;
                        if (keyCode == 37 || keyCode == 38) {
                            me.prev();
                        } else if (keyCode == 39 || keyCode == 40) {
                            me.next();
                        }
                    });
                }
                $(window).resize(function() {
                    var currentLength = me.switchLength(),
                        offset = me.settings.direction ? me.section.eq(me.index).
                            offset().top : me.section.eq(me.index).offset().left;
                    if (Math.abs(offset) > currentLength / 2 && me.index < (me.pagesCount - 1)) {
                        me.index++;
                    }
                    if (me.index) {
                        me._scrollPage();
                    }
                });
                me.sections.on("transitionend webkitTransitionEnd oTransitionEnd otransitionend", function() {
                    me.canScroll = true;
                    if (me.settings.callback && $.type(me.settings.callback) == "function") {
                        me.settings.callback(me.index);
                    }
                });
            },
            // 滑动动画
            _scrollPage: function() {
                var me = this;
                if (!me.section.eq(me.index).length) return;
                var dest =  {
                    left: me.section.eq(me.index)[0].offsetLeft,
                    top: me.section.eq(me.index)[0].offsetTop
                }
                me.canScroll = false;
                if (_prefix) {
                    me.sections.css(_prefix + "transition", "all " + me.settings.duration + "ms " + 
                        me.settings.easing);
                    var translate = me.direction ? "translateY(-" + dest.top + "px)" : "translateX(-" + dest.left + "px)";
                    me.sections.css(_prefix + "transform", translate);
                } else {
                    var animateCss = me.direction ? {top: -dest.top} : {left: -dest.left};
                    me.sections.animate(animateCss, me.settings.duration, function() {
                        me.canScroll = true;
                        if (me.settings.callback && $.type(me.settings.callback) == "function") {
                            me.settings.callback();
                        }
                    });
                }
                if (me.settings.pagination) {
                    me.pageItem.eq(me.index).addClass(me.activeClass).siblings("li").removeClass(me.activeClass);
                }
            }
        };
        return PageSwitch;
    })();
    $.fn.PageSwitch = function(options) {
        return this.each(function() {
            var me = $(this),
                instance = me.data("PageSwitch");
            if (!instance) {
                instance = new PageSwitch(me, options);
                me.data("PageSwitch", instance);
            }
            if ($.type(options) === "string") {
                return instance[options]();
            }
            // $("div").PageSwitch("init");
        })
    }
    $.fn.PageSwitch.defaults = {
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
    }
    $(function() {
        $(["data-page-switch"]).PageSwitch();
    });
})(jQuery);