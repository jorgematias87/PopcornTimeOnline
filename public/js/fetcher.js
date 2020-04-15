var fetcher = {

	scrappers:{

		imdb:{

			tv_idx:			0,
			movies_idx:		0,
			subtitles_idx:	0,

			movies:		['t4p_movies','yts','t4p_movies','yts'],
			tv:			['t4p_tv'],
			subtitles:	['ysubs']
		},

		anime:{

			tv_idx:			0,
			movies_idx:		0,
			subtitles_idx:	0,

			movies:['anime_movies'],
			tv:['anime_tv'],
			subtitles:[]
		},

		cartoons:{

			tv_idx:			0,
			movies_idx:		0,
			subtitles_idx:	0,

			movies:[],
			tv:[],
			subtitles:[]
		}

	},

	fetch:{
		items: function(section, genre, keywords, callback){

			var
			mode			= app.config.fetcher.mode,
			idx 			= fetcher.scrappers[mode][section + '_idx'],
			scrapper_name 	= fetcher.scrappers[mode][section][idx];



         console.info(mode,idx,scrapper_name,keywords);
         if(keywords != ""  && scrapper_name == "yts") {
            //after try to search in yts - we will drop _idx to zero.
            callback("search, don't need call yts", []);
            fetcher.scrappers[mode][section + '_idx'] = 0;
            return;
         }
			if(typeof(scrapper_name)=='string'){

				var scrapper = fetcher.scrappers[scrapper_name];

				if(typeof(scrapper)=='function'){
					scrapper(genre, keywords, null, function(movies){

						if(!movies){
							fetcher.scrappers[mode][section + '_idx']++;
							fetcher.fetch.items(section, genre,keywords, callback);
						}
						else{
							fetcher.scrappers[mode][section + '_idx']=0;
							callback(false, movies)

						}

					})
				}
				else{
					logger.log('error_no_scrapper_function_' + scrapper_name)
					fetcher.scrappers[mode][section + '_idx']++;
					fetcher.fetch.items(section, genre,keywords, callback);
				}
			}
			else{
				fetcher.scrappers[mode][section + '_idx']=0;
				callback('end_of_scrappers_movies');
			}

		},

		tv_show:function(id, callback){

			var urls = {
				imdb: '//api.apiumadomain.com/show?imdb=',
				anime: '//api-anime.apidomain.info/show?imdb='
			};


			$.get(urls[app.config.fetcher.mode] + id, function(json){
				if(json || (typeof data.MovieList !== 'undefined' && data.MovieList.length != 0)){
					callback(0, json);
				}
				else {
               $.get(urls[app.config.fetcher.mode] + id + '&nc=1', function(json){
                  if(json){
                     callback(0, json);
                  } else {
                     callback('error_t4p_tv_not_responding');
                  }
               },'json');
            }


			},'json')
            .fail(function() {
               $.get(urls[app.config.fetcher.mode] + id+ '&nc=1', function(json){
                  if(json){
                     callback(0, json);
                  } else {
                     callback('error_t4p_tv_not_responding');
                  }
               },'json');
            });

		},


		subtitles:function(movie_id, callback){

			var
			mode			= app.config.fetcher.mode,
			idx 			= fetcher.scrappers[mode]['subtitles_idx'],
			scrapper_name 	= fetcher.scrappers[mode].subtitles[idx];


			if(typeof(scrapper_name)=='string'){

				var scrapper = fetcher.scrappers[scrapper_name];

				if(typeof(scrapper)=='function'){
					scrapper(movie_id, function(subtitles){

						if(!subtitles || !subtitles.length){
							fetcher.scrappers[mode].subtitles_idx++;
							fetcher.fetch.subtitles(movie_id);
						}
						else
							callback(subtitles);
					})
				}
				else{
					logger.log('error_no_scrapper_function_' + scrapper_name)
					fetcher.scrappers[mode].subtitles_idx++;
					fetcher.fetch.subtitles(movie_id);
				}
			}
			else{
				fetcher.scrappers.subtitles_idx=0;
			}
		}
	}
}
