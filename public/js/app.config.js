app.config={

	init:function(){
		this.os = location.href.indexOf('os=mac') > -1 ? 'mac' : 'win';
		this.fetcher = {
			mode:	'imdb',
			sortBy: 'seeds'

		}

		this.api_keys = {

			//tmdb:		["9b939aee0aaafc12a65bf448e4af9543"][(Math.floor(Math.random()*1))],
			tmdb:		'49101d62654e71a2931722642ac07e5e',
			tmdb_url:	'//tinfo.apiumadomain.com/3/',
			tmdb_src:	'//image.tmdb.org/t/p/',

		}
		this.urls = {
			imdb: 'https://cinemaone.net/title/{0}?utm_source=pt&utm_medium=' + this.os + '&utm_campaign=skusat1',

		}
		this.locale = {

			preferredSubs: localStorage.getItem('conf_locale_preferredSubs')

		}


		var storage = {
			ui:{
				coverScale: 	1.1,
				coverWidth:		133,
				coverTiteSize:	12,
				coverYearSize:	12,
				coverToolsSize:	12,
				coverStarsSize:	17,
			}
		}

		for(var i in storage){
			this[i] = {};
			for(var key in storage[i])
				this[i][key] = localStorage.getItem('conf_' + i + '_' + key)  || storage[i][key];
		}
	},

	set:function(values){
		for(var i in values){
			for(var key in values[i]){
				this[i][key] = values[i][key]
				localStorage.setItem('conf_' + i + '_' + key, values[i][key])
			}
		}

	},

	hostApp:{

		isVpnConnected:	false,
		tempPath:		localStorage.getItem('conf_hostApp_tempPath') || '',
		subsFontSize:	localStorage.getItem('conf_hostApp_subsFontSize') || "0",
		cleanOnExit:	localStorage.getItem('conf_hostApp_cleanOnExit') && localStorage.getItem('conf_hostApp_cleanOnExit')!="0",
		// hideGlare:		localStorage.getItem('conf_hostApp_hideGlare') || false,
		hideGlare:		true,
		vpnAlert:		localStorage.getItem('conf_hostApp_vpnAlert1') || "on",
		isVPN:			1,
		vpnInstalled:	function(mode){
			app.config.hostApp.isVpnInstalled = (mode ? 1:0);
			ui.vpn_page.updateDisplay();
		},
		vpn_connect:function(){
			if(torrentsTime.pt.vpn_connect) {
				torrentsTime.pt.vpn_connect();
			}
		},
		vpn_disconnect:function(){
			if(torrentsTime.pt.vpn_disconnect) {
				torrentsTime.pt.vpn_disconnect();
			}
		}

	},

   updateView:function(){

      $('.temp_path.txt').val(app.config.hostApp.tempPath);
      app.config.set({hostApp:{
         tempPath:app.config.hostApp.tempPath
      }
      });
   }


}
