var indexMain = (function($) {

    var Dom = {
        oBtnMenu: $('#J-userMenu'),
        $overlay: $('#overlay'),
        oMenu: $('#member-info'),
        $btnLoadMore: $('.btn-loadmore'),
        oBtnShowLogin: $('#J-showLoginBox'),
        oBtnShowReg: $('#J-showRegBox'),
        oLoginDialog: $('#login_dialog'),
        oRegDialog: $('#regist_dialog'),
        oBtnClose: $('.btn-close-dialog'),
        oArticleTagsBox: $('#atc-tags'),
        oHeadSearchBtn: $('#j-site-searchBtn'), // head搜索按钮
        oSiteSearchTxt: $('.site-search-txt'), // site search value
        oSiteSearchWrap: $('#site-search-wrap'),
        currenPage: 1,
        oBtnLogout: $('[data-links="logout"]'),
        oBtnToMIssue: $('[data-links="m_issue"]'),
        oArticleItem: $('.item-list .item'),
        oArtModiflBtn: $('.item-list [data-btn="modifly"]'),
        oArtDelBtn: $('.item-list [data-btn="remove"]'),
    };

    var util = {
        getQueryString: function(name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) return unescape(r[2]);
            return '';
        },
        cookie: function(cname, value, exdays) {
            if (typeof value == 'undefined') {
                var name = cname + "=";
                var ca = document.cookie.split(';');
                for (var i = 0; i < ca.length; i++) {
                    var c = ca[i];
                    while (c.charAt(0) == ' ') c = c.substring(1);
                    if (c.indexOf(name) != -1) return c.substring(name.length, c.length);
                }
                return '';
            } else if (value == null) {
                return this.cookie(cname, '', -1);
            } else {
                var exdays = arguments[2] || 2;
                var d = new Date();
                d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
                var expires = "expires=" + d.toUTCString();
                var path = location.pathname.substr(0, location.pathname.lastIndexOf('/')) || '/';
                document.cookie = cname + "=" + value + "; " + expires + ";path=" + path;
                return value;
            }
        },
    };

    function EventHanlder() {
        
        // 加载下一页
        Dom.$btnLoadMore.on('click', function() {
            var kw = Dom.oSiteSearchTxt.val() || util.getQueryString('kw');
            $.ajax({
                type: 'post',
                url: '/list?page=' + (Number(Dom.currenPage) + 1) + '&kw=' + kw,
                success: function(msg) {
                    if (msg.code !== 200) return;
                    var data = msg.data,
                        html = '',
                        pageNum = msg.pageNum;
                    Dom.currenPage = msg.page;
                    $.each(data, function(i, v) {
                        html += '<li class="item">' +
                            '<div class="item-inner">';
                        if (v.articleLink) {
                            html += '<a href="' + v.articleLink + '" target="_blank" class="item-link">';
                        } else {
                            html += '<a href="/articles/' + v['_id'] + '" class="item-link">';
                        }
                        html += '<h3>' + v.articleTitle + '</h3>' +
                            '<div class="meto-row"><span class="tags bule">' + v.articleTag + '</span><span>' + v.articleAuthor + '</span><span>' + v.articlePvn + '</span></div>' +
                            '</a>' +
                            '</div>' +
                            '</li>';
                    })
                    $("#item-list-box").append(html);
                    if (pageNum == Dom.currenPage) {
                        Dom.$btnLoadMore.hide();
                    }
                },
                error: function(err) {
                    console.log(err)
                }
            })
        });

        // show menu-info
        Dom.oBtnMenu.on('click', function() {
            Dom.oMenu.addClass('active');
            Dom.$overlay.css('display', 'block');
        });
        // hide menu-info
        Dom.$overlay.on('click', function() {
            $(this).css('display', 'none');
            Dom.oMenu.removeClass('active');
        });

        // 显示隐藏 dialog
        Dom.oBtnShowLogin.on('click', function() {
            Dom.oMenu.removeClass('active');
            Dom.$overlay.css('display', 'none');
            Dom.oLoginDialog.show();
        });
        Dom.oBtnShowReg.on('click', function() {
            Dom.oMenu.removeClass('active');
            Dom.$overlay.css('display', 'none');
            Dom.oRegDialog.show();
        });
        Dom.oBtnClose.on('click', function() {
            $(this).parents('.dialog_container').hide();
        });

        // issue page select tags
        Dom.oArticleTagsBox.on('click','a', function() {
            var tag = $(this).data('tags');
            $(this).addClass('on').siblings().removeClass('on');
            $('#atc-tag-name').val(tag);
        })

        // 切换site search area
        Dom.oHeadSearchBtn.on('click', function() {
            Dom.oSiteSearchWrap.toggleClass('active');
        });

        // encodeURIComponent 搜素内容
        Dom.oSiteSearchTxt.on('blur', function() {
            var enCodeVal = encodeURIComponent($(this).val());
            $(this).val(enCodeVal)
        });
        
        Dom.oBtnLogout.on('click', function() {
            // localStorage['token'] = '';
            localStorage['user'] = '';
            // util.cookie('token', null);
            location.href = '/logout';
        });

    }

    // swipe 
    function swipeHanlder() {
        var x, y, X, Y, swipeX, swipeY;
        var expansion = null;
        if(!$('.item-list').find('.opera-btn').length) return;
        Dom.oArticleItem.on('touchstart', function(event) {
            x = event.originalEvent.changedTouches[0].pageX;
            y = event.originalEvent.changedTouches[0].pageY;
            swipeX = true;
            swipeY = true ;
            if(expansion){   //判断是否展开，如果展开则收起
                expansion.removeClass('swipeleft');
            }        
        });
        Dom.oArticleItem.on('touchmove', function(event) {
            X = event.originalEvent.changedTouches[0].pageX;
            Y = event.originalEvent.changedTouches[0].pageY;        
            // 左右滑动
            if(swipeX && Math.abs(X - x) - Math.abs(Y - y) > 0){
                // 阻止事件冒泡
                event.stopPropagation();
                if(X - x > 10){   //右滑
                    event.preventDefault();
                    $(this).removeClass('swipeleft'); //右滑收起
                }
                if(x - X > 10){   //左滑
                    event.preventDefault();
                    $(this).addClass('swipeleft');   //左滑展开
                    expansion = $(this);
                }
                swipeY = false;
            }
            // 上下滑动
            if(swipeY && Math.abs(X - x) - Math.abs(Y - y) < 0) {
                swipeX = false;
            }        
        });
        
        
        Dom.oArtDelBtn.on('click', function() {  // 删除article
            var _id = $(this).siblings('.item-inner').attr('data-id');
            var _this = $(this);
            var isRm = confirm('确定删除吗？');
            if(!isRm) return;
            $.ajax({
                method: 'post',
                url: '/rmAricle',
                headers: {
                    'authorization': localStorage['user']
                },
                data: {
                    articleId: _id
                },
                dataType: 'json',
                success: function(data) {
                    if (data.response.code == 200) {
                        _this.parent().remove();
                    } else {
                        alert('出错了，请刷新!')
                    }
                }
            });
        });
    }
    

    function Main() {
        EventHanlder();
        swipeHanlder();
    }

    Main();

    // login submit
    function submitHandler(form) {
        var username = form.username.value.trim();
        var pwd = form.pwd.value.trim();
        if (!username || !pwd) {
            $("#login_dialog .dialog_foot p").text('请输入账号密码！');
            return false;
        }
        // var formParam = $(form).serialize();
        $.ajax({
            method: 'post',
            url: '/login',
            data: {
                username: username,
                pwd: pwd
            },
            dataType: 'json',
            success: function(data) {
                
                if (data.response.code == 200) {
                    $("#login_dialog .dialog_foot p").text(data.response.msg);
                    // localStorage.setItem('token',data.response.token);
                    localStorage['user'] = data.response.user;
                    // util.cookie('token', data.response.token, 10);
                    location.reload();
                } else {
                    $("#login_dialog .dialog_foot p").text(data.response.msg);
                }
            }
        })
    }

    // regist submit
    function registHandler(form) {
        var username = form.username.value.trim();
        var pwd = form.pwd.value.trim();
        if (!username || !pwd) {
            $("#regist_dialog .dialog_foot p").text('请输入账号密码！');
            return false;
        }
        // var formParam = $(form).serialize();
        $.ajax({
            method: 'post',
            url: '/regist',
            data: {
                username: username,
                pwd: pwd
            },
            dataType: 'json',
            success: function(data) {
                if (data.response.code == 200) {
                    $("#regist_dialog .dialog_foot p").text('注册成功!');
                    // setTimeout(function() { location.href="/login" }, 1000);
                } else {
                    $("#regist_dialog .dialog_foot p").text(data.response.msg);
                }
            },
            error: function(err) {
                console.log(err.responseText)
            }
        })
    }

    // 文章发布 submit
    function issueHandler(form, articleType, articleId) {
        var articleType = articleType || 'edit';
        var articleId = articleId;
        var articleTitle = form.title.value.trim();
        var articleContent = form.content.value.trim();
        var articleTag = form.tag.value.trim();
        
        if (!articleTitle || !articleContent || !articleTag) {
            $("#edit-form .tips").text('请选择或输入的内容齐全！');
            return false;
        }
        // var formParam = $(form).serialize();
        $.ajax({
            method: 'post',
            url: '/edit',
            data: {
                // token: localStorage['token'],
                articleTitle: articleTitle,
                articleContent: articleContent,
                articleTag: articleTag,
                articleType: articleType,
                articleId: articleId
            },
            dataType: 'json',
            success: function(data) {
                if (data.response.code == 200) {
                    var resMsg = articleType == 'modifly' ? '修改成功！' : '发布成功！';
                    $("#edit-form .tips").text(resMsg);
                    setTimeout(function() { location.href = '/' }, 1000);
                } else {
                    $("#edit-form .tips").text(data.response.msg);
                }
            },
            error: function(err) {
                console.log(err.responseText)
            }
        })
    }

    return {
        submitHandler: submitHandler,
        registHandler: registHandler,
        issueHandler: issueHandler
    }
})(jQuery);