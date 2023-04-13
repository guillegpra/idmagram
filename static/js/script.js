$(document).ready(function () {

    // handle likes
    $(document).on('submit', '#like-form', function (event) {
        event.preventDefault();
        var heartIcon = $(this).find('.like-btn').find('svg');
        var numLikes = $(this).find('.num-likes');

        $.ajax({
            url: '/like',
            data: $(this).serialize(),
            type: 'post',
            dataType: 'JSON',
            success: function (data) {
                console.log(data.message);

                // toggle heart icon
                if (heartIcon.hasClass('bi-heart')) {
                    heartIcon.removeClass('bi-heart');
                    heartIcon.addClass('bi-heart-fill');
                    heartIcon.find('path').attr('d', 'M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z');
                    numLikes.text(parseInt(numLikes.text()) + 1);
                } else {
                    heartIcon.removeClass('bi-heart-fill');
                    heartIcon.addClass('bi-heart');
                    heartIcon.find('path').attr('d', 'm8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z');
                    numLikes.text(parseInt(numLikes.text()) - 1);
                }
            },
            error: function (error) {
                console.log(error);
            }
        });
    });

    // handle comments
    $(document).on('submit', '#comment-form', function (event) {
        event.preventDefault();
        var form = $(this);

        $.ajax({
            url: '/comment',
            data: $(this).serialize(),
            type: 'post',
            dataType: 'JSON',
            success: function (data) {

                // obtain current date in DD/MM/YY HH:mm format
                var date = new Date();
                var formattedDate = ("0" + date.getDate()).slice(-2) + "/"
                    + ("0" + (date.getMonth() + 1)).slice(-2) + "/"
                    + date.getFullYear().toString().substr(-2) + " "
                    + ("0" + date.getHours()).slice(-2) + ":"
                    + ("0" + date.getMinutes()).slice(-2);

                // create div with comment
                var commentDiv = $('<div/>', {
                    class: 'comment'
                }).append(
                    $('<div/>', {
                        class: 'comment-content'
                    }).append(
                        $('<span/>', {
                            class: 'user-comment text-primary',
                            text: '@' + data.username + ': '
                        }),
                        $('<span/>', {
                            text: data.content
                        })
                    ),
                    $('<div/>', {
                        class: 'comment-date small text-muted align-self-center',
                        text: formattedDate
                    })
                );

                form.prev().find('.no-comments').remove(); // remove previous comment if it is the first one

                var comments = form.prev('.comments');
                comments.append(commentDiv); // add comment to div
                comments.scrollTop(comments.prop('scrollHeight')); // scroll down
                form.find('#comment').val(''); // clear input field
            },
            error: function (error) {
                console.log(error);
            }
        });
    });
});
