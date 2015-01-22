$(document).ready(function() {
    var widgetRefreshTimeouts = {};

    var spinnerParams = {length: 3, radius: 2, width: 1};

    var ajaxWidgetRefresh = function (widget, component) {
        var node = $('[data-widget="' + widget + '"][data-component="' + component + '"]');
        if (widget == 'widgets') {
            $.ajax('/widgets', {
                success: function (data) {
                    node.html(data);
                    $('[data-widget="widgets"] > form').hide();
                }
            });
        } else {
            $.ajax('/widget/' + encodeURIComponent(widget) + '/' + encodeURIComponent(component), {
                statusCode: {
                    200: function (data) {
                        node.removeClass('status-bad').removeClass('status-error').addClass('status-good');
                    },
                    400: function (data) {
                        node.removeClass('status-good').removeClass('status-error').addClass('status-bad');
                    },
                    500: function (data) {
                        node.removeClass('status-good').removeClass('status-bad').addClass('status-error');
                    }
                }
            }).always(function (data) {
                if (!widgetRefreshTimeouts[widget]) {
                    widgetRefreshTimeouts[widget] = {};
                }
                if (widgetRefreshTimeouts[widget][component]) {
                    clearTimeout(widgetRefreshTimeouts[widget][component]);
                }
                widgetRefreshTimeouts[widget][component] = setTimeout(function () {
                    ajaxWidgetRefresh(widget, component)
                }, 10000);
                node.find('.load-error').remove();
                node.find('.spinner').remove();
            }).error(function (data, status, thrownError) {
                if (status == 'error' && thrownError != 'Bad Request' && thrownError != 'Internal Server Error') {
                    if (node.find('.load-error').length == 0) {
                        node.append('<div class="load-error">Failed to refresh widget!</div>');
                        node.append(new Spinner(spinnerParams).spin().el);
                    }
                }
            });
        }
        ;
    };

    function saveWidgets() {
        var postData = {};
        $('.widget').not('[data-widget="widgets"]').each(function(index) {
            var widget = $(this).attr('data-widget');
            var component = $(this).attr('data-component');

            if (!postData[widget]) {
                postData[widget] = {};
            }
            postData[widget][component] = index;
        });
        $.post('/widgets', { widgets: postData });
    }

    $(document).on('click', '[data-widget="widgets"] > div:first', function () {
        $('[data-widget="widgets"] > form').toggle();
    });

    $('.widget').each(function () {
        var node = $(this);
        var widget = node.attr('data-widget');
        var component = node.attr('data-component');

        node.append(new Spinner(spinnerParams).spin().el);

        ajaxWidgetRefresh(widget, component);
    });


    $(document).on('click', '[data-widget="widgets"] input:checkbox', function () {
        var matches = $(this).prop('name').match('widgets\\[(.*)\\]\\[(.*)\\]');
        var widget = matches[1];
        var component = matches[2];
        if ($(this).prop('checked')) {
            var newWidget = $('<div class="widget" data-widget="' + widget + '" data-component="' + component + '">' + $(this).attr('data-text') + ': ' + $(this).parent().text() + '</div>');
            $('section[role="main"]').append(newWidget);
            newWidget.append(new Spinner(spinnerParams).spin().el);
            ajaxWidgetRefresh(widget, component);
        } else {
            if (widgetRefreshTimeouts[widget] && widgetRefreshTimeouts[widget][component]) {
                clearTimeout(widgetRefreshTimeouts[widget][component]);
                delete(widgetRefreshTimeouts[widget][component]);
            }
            $('[data-widget="' + widget + '"][data-component="' + component + '"]').remove();
        }
        saveWidgets();
    });

    $('section[role="main"]').sortable({
        items: '.widget:not(:first)',
        stop: saveWidgets
    });
});
