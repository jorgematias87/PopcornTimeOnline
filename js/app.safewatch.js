app = app || {};
app.sw = {
    isInstalled: false,
    actualPort: 0,
    config: {
        params: {
            publisherId: 3,
            mode: 'watch',
            vpn: '',
            defaultVpn: '',
            SubID: ''

        },
        downloadLink: 'dl/SafeWatch.exe',
        schemaPrefix: 'safewatch',
        url: "http://127.0.0.1:[port]",
        ports: [
            50000,
            50010,
            50020,
            50030,
            50040,
            50050
        ]
    },
    checkInstall: function (cb) {
        app.sw.isInstalled = false;

        function sendPingPongRequest(url, port) {
            var address = url.replace('[port]', port);
            return new Promise(function (resolve, reject) {
                $.ajax({
                    url: address,
                    type: "GET",
                    success: function (data) {
                        resolve({message: data, additionalData: {"port": port}})
                    },
                    error: function (status) {
                        reject({
                            message: 'Request failed.  Returned status of ' + status,
                            additionalData: {"port": port}
                        });
                    }
                });
            });
        }

        var results = app.sw.config.ports.length;
        for (var i = 0; i < app.sw.config.ports.length; i++)
            sendPingPongRequest(app.sw.config.url + "/ping", app.sw.config.ports[i])
                .then(function (data) {
                    results--;
                    if (!app.sw.isInstalled) {
                        app.sw.isInstalled = true;
                        app.sw.actualPort = data.additionalData.port;
                        if (typeof cb === 'function') {
                            cb(app.sw.actualPort);
                        }
                    }
                }, function (data) {
                    results--;
                    if (results === 0 && !app.sw.isInstalled) {
                        if (typeof cb === 'function') {
                            cb(0);
                        }
                    }
                });
    },
    download: function () {
        utils.sendGA('sw', 'sw_download_clicked');
        var $iframe = $('<iframe>')
            .attr('src', app.sw.config.downloadLink)
            .attr('style', 'display:none')
            .appendTo('body');
        ui.torrentsTime.downloadHandler();
        setTimeout(function () {
            $iframe.remove();
        }, 1000)
        var interval = setInterval(function () {
            console.log('test interval download check', app.sw.isInstalled);
            if (app.sw.isInstalled) {
                utils.sendGA('sw', 'sw_installed');
                clearInterval(interval);
                $('#_tt_arrowimg').remove();
                $('#downloadTorrentsTime').hide(); //TODO not the best place;
                app.sw.send(app.currentSession);
            } else {
                app.sw.checkInstall();
            }
        }, 200);
        return false;
    },
    buildCustomLink: function (session) {

        var params = [], parametersString = "";
        if ((session.torrent.url || session.torrent.magnet) && ((session.torrent.url !== "") || (session.torrent.magnet !== ""))) {
            var url = session.torrent.magnet === "" ? session.torrent.url : session.torrent.magnet;
            params.push("url=" + encodeURIComponent(url));
        }
        if (this.config.params.publisherId && this.config.params.publisherId !== "") {
            params.push("pid=" + encodeURIComponent(this.config.params.publisherId));
        }
        if (session.title && session.title !== "") {
            params.push("tlt=" + encodeURIComponent(session.title));
        }
        if (session.torrent.size && session.torrent.size !== "") {
            //TODO can we take somewhere ? search in torrent session: ui.home.catalog[session.id]
            params.push("size=" + encodeURIComponent(session.torrent.size));
        }
        if (session.image && session.image !== "") {
            params.push("pic=" + encodeURIComponent(session.image));
        }
        /*
         //TODO what format must be to send to the SW ?
         if (session.sub && session.sub !== "") {
         params.push("sub=" + encodeURIComponent(session.sub));
         }
         if (session.subtitles_locale && session.subtitles_locale !== "") {
         params.push("subLang=" + encodeURIComponent(session.subtitles_locale));
         }
         */
        if (session.id && session.id !== "") {
            params.push("mid=" + encodeURIComponent(session.id));
        }
        if (session.torrent.file && session.torrent.file !== "") {
            params.push("fnm=" + encodeURIComponent(session.torrent.file));
        }

        var mode = 'watch';
        if (this.config.params.mode && this.config.params.mode !== "") {
            mode = this.config.params.mode;
        }
        params.push("mod=" + encodeURIComponent(mode));
        if (this.config.params.vpn && this.config.params.vpn !== "") {
            params.push("vpn=" + encodeURIComponent(this.config.params.vpn));
        }
        if (this.config.params.defaultVpn && this.config.params.defaultVpn !== "") {
            params.push("defaultVpn=" + encodeURIComponent(this.config.params.defaultVpn));
        }
        if (this.config.params.SubID && this.config.params.SubID !== "") {
            params.push("SubID=" + encodeURIComponent(this.config.params.SubID));
        }
        if (params.length > 0) {
            parametersString = params.join("&");
        }
        return (this.config.schemaPrefix + '://?' + encodeURIComponent(XXTEA.encryptToBase64(parametersString, "swschema")));
    },
    openLink: function (customLink) {
        var link = app.sw.config.url.replace('[port]', "" + app.sw.actualPort) + "/open";
        return new Promise(function (resolve, reject) {
            $.ajax({
                type: "POST",
                url: link,
                data: customLink,
                success: function () {
                    //TODO do we need to something here ?
                    utils.sendGA('sw', 'sw_link_opened');
                    resolve();
                },
                error: function (xhr, status, error) {
                    utils.sendGA('sw', 'sw_link_open_error', '{0},{1},{2}'.format(status, error, xhr.responseText));
                    reject('{0},{1},{2}'.format(status, error, xhr.responseText));
                }
            })
        });

    },
    send: function (session) {
        var customLink = app.sw.buildCustomLink(session);
        app.sw.openLink(customLink).catch(function () {
            app.sw.checkInstall(function (port) {
                if ( port > 0){
                    app.sw.openLink(customLink);
                }
                else
                {
                    $('#downloadTorrentsTime').show();
                    hostApp.downloadInitialized = true;
                }
            });
        });
    }
};