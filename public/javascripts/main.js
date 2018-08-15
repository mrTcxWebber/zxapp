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
        currenPage: 1
    };

    function EventHanlder() {
        // 加载下一页
        Dom.$btnLoadMore.on('click', function() {
            $.ajax({
                type: 'post',
                url: '/list?page=' + (Number(Dom.currenPage) + 1),
                success: function(msg) {
                    if (msg.code !== 200) return;
                    var data = msg.data,
                        html = '',
                        pageNum = msg.pageNum;
                    Dom.currenPage = msg.page;
                    $.each(data, function(i, v) {
                        html += '<li class="item">' +
                            '<div class="item-inner">' +
                            '<a href="' + v.articleLink + '" target="_blank" class="item-link">' +
                            '<h3>' + v.articleTitle + '</h3>' +
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
        Dom.oArticleTagsBox.on('a', 'click', function() {
            var tag = $(this).data('tags');
            $(this).addClass('on').siblings().removeClass('on');
            $('#atc-tag-name').val(tag);
            console.log(80)
            console.log($('#atc-tag-name').val())
        })
    }

    function Main() {
        EventHanlder();
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
                    location.reload();
                } else {
                    $("#login_dialog .dialog_foot p").text(data.response.msg);
                }
            }
        })
    }

    // login submit
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
                    setTimeout(function() { location.reload(); }, 1000);
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
    function issueHandler(form) {
        var articleTitle = form.title.value.trim();
        var articleContent = form.content.value.trim();
        var articleTag = form.tag.value.trim();
        if (!articleTitle || !articleContent) {
            $("#edit-form .tips").text('请输入正确内容！');
            return false;
        }
        // var formParam = $(form).serialize();
        $.ajax({
            method: 'post',
            url: '/edit',
            data: {
                articleTitle: articleTitle,
                articleContent: articleContent,
                articleTag: articleTag
            },
            dataType: 'json',
            success: function(data) {
                if (data.response.code == 200) {
                    $("#edit-form .tips").text('发布成功!');
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