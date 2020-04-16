fetcher.scrappers.ysubs = function(movie_id, callback){

    $.get(`${api.url}/subtitles/${movie_id}`)
    .done(subs => {
        if(subs){
            var subs_list = [];
            for(var i in subs){

                var
                lang_code = i,
                lang_name = locale.langs[lang_code] ? locale.langs[lang_code]  : i.capitalize()
                most_rated = [];

                if(subs[i] instanceof Array){
                    for(var x=0;x<subs[i].length;x++)
                        if(!most_rated[1] || subs[i][x].rating>most_rated[1]){

                            most_rated = [[

                                subs[i][x].url,
                                lang_code,
                                lang_name.capitalize()

                            ], subs[i][x].rating];
                        }

                    subs_list.push(most_rated[0]);
                }

            }

            callback(subs_list);
        }
        else
            callback(false);
    })
    .fail(e => {
        callback(false);
		logger.log('error_scrap_ysubs_' + movie_id)
    });
}