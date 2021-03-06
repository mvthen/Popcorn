var user = "";
var pw = "";
var rt_apikey = "6czc3ebkafxvwceb68dhqnz2";
var mongo_api_key = "hPnzcGaD0tgcmoL6KwVPXoNLMXc8d71l";
var nyt_api_key = "e0dc9ba28e7e7c252c51e01eaf637899:6:61350197";
var omdb_api_key = "e4cb03fb";
 
var favorite_movies = {};
var entries = {};
 
$(document).ready(function() {
 
    $.ajax({
        url: "https://api.mongolab.com/api/1/databases/nytimes_movie/collections/hits?apiKey=" + mongo_api_key,
        type: "GET",
        contentType: "application/json",
        success: function(results) {
            console.log(results)
            for (var key = 0; key < results.length; key++) {
                var movie_title = results[key]["title"];
                var movie_id = results[key]["_id"]["$oid"];
                entries[movie_title] = {
                    db_id: movie_id,
                    movie_id: results[key]['id']
                }
            }
            console.log(entries)
        },
        error: function(data, textStatus, errorThrown) {}
    });
 
    // rotton tomatoes
    // username: uxperts
    // password: uicoms4170
    // 6czc3ebkafxvwceb68dhqnz2
    $('.reload').click(function() {
        $(".results").hide();
        location.reload();
 
    });
 
    // populates bookmarks modal
    $('.bookmarks').click(function() {
        
        $('#bmmb').empty();
        $.ajax({
            url: "https://api.mongolab.com/api/1/databases/nytimes_movie/collections/hits?apiKey=" + mongo_api_key,
            type: "GET",
            contentType: "application/json",
            success: function(data) {
                if (data.length === 0) {
                    $("#bmmb").append(String.format("<div><h1>{0}</h1></div>", "You haven't bookmarked any movies yet!"));
                }
                for (var key in data) {
                    var item = data[key];
                    $("#bmmb").append(data[key]["html"]);
                }
            },
            error: function(xhr, status, err) {}
        });
    });
 
    $(".wrap").show();
    $(".results").hide();
    $("#bookmarked").hide();
 
    String.format = function() {
        // The string containing the format items (e.g. "{0}")
        // will and always has to be the first argument.
        var theString = arguments[0];
        // start with the second argument (i = 1)
        for (var i = 1; i < arguments.length; i++) {
            // "gm" = RegEx options for Global search (more than one instance)
            // and for Multiline search
            var regEx = new RegExp("\\{" + (i - 1) + "\\}", "gm");
            theString = theString.replace(regEx, arguments[i]);
        }
        return theString;
    }
    
    // Carousel call to rottentomatoes
    $.ajax({
        'url': 'http://api.rottentomatoes.com/api/public/v1.0/lists/movies/in_theaters.json?apikey=' + rt_apikey,
        'type': 'GET',
        'dataType': 'jsonp',
        success: function(data, textStats, XMLHttpRequest) {
            var array = [];
            for (var i = 0; i < 15; i++) {
                var title = data["movies"][i]["title"].replace(' ', '+');
                array.push(title);
            }
            carousel_search(array);
        },
        error: function(data, textStatus, errorThrown) {
            console.log("error");
        }
    });
 
    function carousel_search(array) {
        for (var i = 0; i < 15; i++) {
            var query_data = array[i];
            omdb_search(query_data, i)
 
        }
    }
 
    $("#results").hide();
 
    $("#registerBtn").click(function(event) {
        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;
        if (addUser(username, password)) {
            $('#registerModal').modal('hide');
        } else {
            $("#register_valid").append("<p id='#username_used'> Username already in use. </p>");
        }
    });
 
    $('a#button-checkbox').click(function() {
        $(this).toggleClass("down");
    });
 
    $("#usernameReg").keydown(function() {
        $("#register_valid").empty();
    });
 
    $("#username").keydown(function() {
        $("#login_valid").empty();
    });
 
    $("#password").keydown(function() {
        $("#login_valid").empty();
    });
 
    $("#owl-demo").owlCarousel({
 
        autoPlay: 2000, //Set AutoPlay to 3 seconds
        items: 5,
        itemsDesktop: [1199, 3],
        itemsDesktopSmall: [979, 3],
    });
    
    // Takes form elements to query
    $("#submitBtn").click(function() {
        var query_text = document.getElementById('query').value;
        var min_date = document.getElementById('mindate').value;
        var reviewer_name = document.getElementById('reviewer_name').value;
 
        var critic_pick = $('#critic-switch').prop('checked');
        if (critic_pick == true) {
            critic_pick = 'Y'
        } else {
            critic_pick = 'N'
        }
 
        var top_thousand = $('#thous-switch').prop('checked');
        if (top_thousand == true) {
            top_thousand = 'Y'
        } else {
            top_thousand = 'N'
        }
 
        var query_info = {}
        query_text = query_text.replace(' ', '+');
        query_info["query"] = query_text;
 
        query_info["min_date"] = min_date;
 
        reviewer_name = reviewer_name.replace(' ', '-');
        reviewer_name = reviewer_name.replace('.', '');
        query_info["reviewer_name"] = reviewer_name;
 
        query_info['critic_pick'] = critic_pick
        query_info['top_thousand'] = top_thousand
 
        search_filter(query_info);
    });
 
    $('.form_date').datetimepicker({
        format: "yyyy-mm-dd",
        weekStart: 1,
        todayBtn: 1,
        autoclose: 1,
        todayHighlight: 1,
        startView: 2,
        minView: 2,
        forceParse: 0,
    });
 
    // find posters for carousel
    function omdb_search(query_data, i) {
        $.ajax({
            'url': 'http://www.omdbapi.com/?t=' + query_data + '&y=&plot=full&r=json',
            'type': 'GET',
            'dataType': 'jsonp',
            'search_filter': 'search_filter',
            success: function(data, textStats, XMLHttpRequest) {
                var poster = data["Poster"];
                var title = data["Title"];
                // console.log(poster);
                var picture = String.format("<a href=''><img src='{0} alt='Owl Image'></a>", poster);
                $("#owl" + (i + 1)).append(picture);
 
                var query_info = {}
                query_info["query"] = title.replace(' ', '+');
                $("#owl" + (i + 1)).find('a').attr('href', 'javascript:search_filter(' + JSON.stringify(query_info) + ');');
            },
            error: function(data, textStatus, errorThrown) {
                console.log('error');
            }
        });
    }
 
    function reviewer_details(reviewer) {
        var message =
            $.ajax({
                'url': "http://api.nytimes.com/svc/movies/v2/critics/" + reviewer + ".json?api-key=" + nyt_api_key,
                'type': 'GET',
                'dataType': "jsonp",
                success: function(data, textStats, XMLHttpRequest) {
                    console.log(data);
                },
                error: function(data, textStatus, errorThrown) {
                    console.log("error");
                }
            });
    }
 
});
 
 // search filters
function search_filter(query) {
 
    $(".results").show();
    $(".wrap").hide();
 
    var search_url = '';
    var resultstring = '';
 
    //construct query url
    if (query['query']) {
        search_url += 'query=' + query['query'];
        resultstring += query['query'].replace('+', ' ');
    }
 
    if (query['critic_pick'] == 'Y') {
        if (search_url.length != 0) {
            search_url += '&critics-pick=Y';
            resultstring += '; Critic Pick';
        } else {
            search_url += 'critics-pick=Y';
            resultstring += 'Critic Pick';
        }
    }
 
    if (query['top_thousand'] == 'Y') {
        if (search_url.length != 0) {
            search_url += '&thousand-best=Y';
            resultstring += '; Top Thousand';
        } else {
            search_url += 'thousand-best=Y';
            resultstring += 'Top Thousand';
        }
    }
 
    if (query['reviewer_name']) {
        if (search_url.length != 0) {
            search_url += '&reviewer=' + query['reviewer_name'];
            resultstring += '; Reviewer: ' + query['reviewer_name'].replace('-', ' ');
        } else {
            search_url += 'reviewer=' + query['reviewer_name'];
            resultstring += 'Reviewer: ' + query['reviewer_name'].replace('-', ' ');
        }
    }
    if (query['min_date']) {
        if (search_url != 0) {
            search_url += '&opening_date=' + query['min_date'];
            resultstring += '; Opening Date: ' + query['min_date'];
        } else {
            search_url += 'opening_date=' + query['min_date'];
            resultstring += 'Opening Date: ' + query['min_date'];
        }
    }
 
 
    
    var title = "<div class='col-lg-12'><h2 class='page-header' style='color:#3498db;'>Loading...</h2></div>";
    $("#posters").html(title);
 
    var message =
        $.ajax({
            'url': "http://api.nytimes.com/svc/movies/v2/reviews/search.jsonp?" + search_url + "&api-key=" + nyt_api_key,
 
            'type': 'GET',
            'dataType': "jsonp",
            success: function(data, textStats, XMLHttpRequest) {
                $("#posters").empty();
                $("#load").hide();
 
                if (resultstring == "") {
                    var title = "<div class='col-lg-12'><h2 class='page-header' style='color:#3498db;'>Top Movies </h2></div>";
                } else {
                    var title = String.format("<div class='col-lg-12'><h2 class='page-header' style='color:#3498db;'>Your results for: {0}</h2></div>", resultstring);
                }
 
                var search_data = data;
 
                if (search_data['results'].length == 0) {
                    $("#posters").append("<div class='col-lg-12'><h2 class='page-header' style='color:#3498db;'>Sorry, no results were found</h2></div>");
                }
 
                for (var i = 0; i < search_data['results'].length; i++) {
                    //will print first 10 search results
                    var query_data = search_data['results'][i];
                    var movie_title = data['results'][i]['link']['suggested_link_text'];
                    movie_title = movie_title.replace('Read the New York Times Review of', '');
                    query_data["movie_title"] = search_data['results'][i]['display_title'];
 
                    var movie_id = data['results'][i]['nyt_movie_id'];
 
                    var opening_date = data['results'][i]['opening_date'];
                    query_data["opening_date"] = opening_date;
 
                    var mpaa_rating = data['results'][i]['mpaa_rating'];
                    query_data["mpaa_rating"] = mpaa_rating;
                    var article_link = data['results'][i]['link']['url'];
                    query_data["article_link"] = article_link;
                    var article_title = data['results'][i]['link']['suggested_link_text'];
                    query_data["article_title"] = article_title;
 
                    $($('#modal-movie-template').html()).appendTo('#movie-container');
                    var last_movie = $('#movie-container .modal').last();
                    last_movie.attr('id', 'modal-movie-' + movie_id);
 
                    $("#posters").html(title);
 
                        $.ajax({
                            'url': 'http://www.omdbapi.com/?t=' + encodeURIComponent(query_data["movie_title"]) + '&y=&plot=short&r=json',
                            'type': 'GET',
                            'dataType': 'jsonp',
                            'movie_id': movie_id,
                            'query_data': query_data,
                            success: function(data, textStats, XMLHttpRequest) {

                                var poster = data["Poster"];
                                var title = data["Title"];
                                if (poster !== "N/A" && poster !== undefined) {
 
                                    $('#modal-movie-' + this.movie_id + ' .modal-header .movie-rating').rateit({
                                        max: 1,
                                        step: 1
                                    });
                                    
                                    var movie_id = this.movie_id;
                                    $('#modal-movie-' + movie_id + ' .modal-header .movie-rating').bind('rated', function(event, value) {
                                        // Toggle rating

                                        // checks for duplicates in db
                                        if (title in entries) {
                                            $('#modal-movie-' + movie_id + ' .modal-header .movie-rating').rateit('reset');
                                            event.preventDefault();
 
                                            $.ajax({
                                                url: "https://api.mongolab.com/api/1/databases/nytimes_movie/collections/hits/" + entries[title]['db_id'] + "?apiKey=" + mongo_api_key,
                                                type: "DELETE",
                                                dataType: "application/json",
                                                async: true,
                                                timeout: 300000,
                                                success: function(data) {
                                                    console.log("deleted");
                                                },
                                                error: function(xhr, status, err) {}
                                            });
                                            delete entries[title];

                                        } else {

                                            $('#modal-movie-' + movie_id + ' .modal-header .movie-rating').rateit('value', 1);
                                            event.preventDefault();

                                            var bookmark = {};                                            
                                            bookmark["title"] = title;                                            
                                            bookmark["poster"] = poster;
                                            bookmark["movie_id"] = movie_id;
                                                                                
                                            var img = String.format("<img class='img-responsive' src='{0}' style=\"{1}\"><div class='text'><div class='middle'>{2}</div></div>", poster, "width:230px;height:351px;", data["Title"]);                                                                        
                                            var total = String.format("<div class='col-lg-3 col-md-4 col-xs-6 thumb'><a class='thumbnail' data-toggle='modal href='#modal-movie-bm-" + movie_id + "'>{0}</a></div>", img);
                                                                               
                                            bookmark["html"] = total;
                                            $.ajax({
                                                url: "https://api.mongolab.com/api/1/databases/nytimes_movie/collections/hits?apiKey=" + mongo_api_key,
                                                data: JSON.stringify(bookmark),
                                                type: "POST",
                                                contentType: "application/json",
                                                success: function(data, textStats, XMLHttpRequest) {
                                                    entries[title] = {
                                                        db_id: data['_id']['$oid'],
                                                        movie_id: data['movie_id']
                                                    }
                                                },
                                                error: function(data, textStatus, errorThrown) { console.log("error")}
                                            });
                                        }
                                    });
 
                                    // populate modal
                                    $('#modal-movie-' + this.movie_id + ' .modal-header .modal-title').text(title);
                                    if (this.query_data["mpaa_rating"]) {
                                        $('#modal-movie-' + this.movie_id + ' .modal-header .mpaa-rating').text("(" + this.query_data["mpaa_rating"] + ")");
                                    }
                                    $('#modal-movie-' + this.movie_id + ' .modal-body img').attr('src', poster);
                                    if (this.query_data["opening_date"]) {
                                        $('#modal-movie-' + this.movie_id + ' .modal-body .opening-date').text("Opening date: " + moment(this.query_data["opening_date"], 'YYYY-MM-DD').format('MMM. Do, YYYY'));
                                    }
                                    $('#modal-movie-' + this.movie_id + ' .modal-body .plot').text("Plot: " + data["Plot"]);
                                    $('#modal-movie-' + this.movie_id + ' .modal-body .actors').text("Actors: " + data["Actors"]);
 
                                    $('#modal-movie-' + this.movie_id + ' .movie-review h5').text("Review by " + this.query_data['byline']);
                                    $('#modal-movie-' + this.movie_id + ' .movie-review a.full-review').attr("href", this.query_data['link']['url']).attr("target", "\"_blank\"");
                                    $('#modal-movie-' + this.movie_id + ' .movie-review a.readers-review').attr("href", this.query_data['related_urls'][3]['url']).attr("target", "\"_blank\"").attr("target", "\"_blank\"");
                                    $('#modal-movie-' + this.movie_id + ' .movie-review a.watch-trailer').attr("href", this.query_data['related_urls'][4]['url']).attr("target", "\"_blank\"").attr("target", "\"_blank\"");
                                    if (this.query_data['summary_short']) {
                                        $('#modal-movie-' + this.movie_id + ' .movie-review p').html(this.query_data['summary_short']);
                                    } else if (this.query_data['capsule_review']) {
                                        $('#modal-movie-' + this.movie_id + ' .movie-review p').html(this.query_data['capsule_review']);
                                    } else {
                                        $('#modal-movie-' + this.movie_id + ' .movie-review').hide();
                                    }
 
                                    $('[data-toggle="tooltip"]').tooltip();
 
                                    var img = String.format("<img class='img-responsive' src='{0}'><div class='text'><div class='middle'>{1}</div></div>", poster, data["Title"]);
 
                                    var total = String.format("<div class='col-lg-3 col-md-4 col-xs-6 thumb'><a class='thumbnail' data-toggle='modal' \
                                    href='#modal-movie-" + this.movie_id + "'>{0}</a></div>", img);
                                    $("#posters").append(total);
 
                                    if (title in entries) {
                                            $('#modal-movie-' + this.movie_id + ' .modal-header .movie-rating').rateit('value', 1);
                                    }
 
                                } else {}
                            },
                            error: function(data, textStatus, errorThrown) {
                                console.log("error");
                            }
                        });
                }
            },
            error: function(data, textStatus, errorThrown) {
                console.log("error");
            }
        });
}
 
function replaceAll(find, replace, str) {
    return str.replace(new RegExp(find, 'g'), replace);
}