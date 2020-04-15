let fs = require("fs")
let path = require("path");
let express = require('express');
let WebTorrent = require('webtorrent')

let router = express.Router();

//
//	1.	When the server starts create a WebTorrent client
//
let client = new WebTorrent();

//
//	2.	The object that holds the client stats to be displayed in the front end
//	using an API call every n amount of time using jQuery.
//
let stats = {
	progress: 0,
	downloadSpeed: 0,
	ratio: 0
}

//
//	3.	The variable that holds the error message from the client. Farly crude but
//		I don't expect to much happening hear aside the potential to add the same
//		Magnet Hash twice.
//
let error_message = "";

//
//	4.	Listen for any potential client error and update the above variable so
//		the front end can display it in the browser.
//
client.on('error', function(err) {

	error_message = err.message;

});

//
//	5.	Emitted by the client whenever data is downloaded. Useful for reporting the
//		current torrent status of the client.
//
client.on('download', function(bytes) {

	//
	//	1.	Update the object with fresh data
	//
	stats = {
		progress: Math.round(client.progress * 100 * 100) / 100,
		downloadSpeed: client.downloadSpeed,
		ratio: client.ratio
	}

});


//
//	The API call to start streaming the selected file to the video tag.
//
//	magnet 		-> 	Magnet Hash
//	file_name 	-> 	the selected file name that is within the Magnet Hash
//
//	return 		<-	A chunk of the video file as buffer (binary data)
//
router.get('/stream/:magnet', function(req, res, next) {
	let magnet = req.params.magnet;

	client.add(magnet, function (torrent) {
		let range = req.headers.range;
		const file = torrent.files.find(function (file) {
			return file.name.endsWith('.mp4')
		})
		
		if(!range) {
			range = 'bytes=0-';
		}

		let positions = range.replace(/bytes=/, "").split("-");
		let start = parseInt(positions[0], 10);
		let file_size = file.length;
		let end = positions[1] ? parseInt(positions[1], 10) : file_size - 1;
		let chunksize = (end - start) + 1;
		let head = {
			"Content-Range": "bytes " + start + "-" + end + "/" + file_size,
			"Accept-Ranges": "bytes",
			"Content-Length": chunksize,
			"Content-Type": "video/mp4"
		}
		res.writeHead(206, head);
		let stream_position = {
			start: start,
			end: end
		}
		let stream = file.createReadStream(stream_position)
		stream.pipe(res);
		stream.on("error", function(err) {
			return next(err);
		});
	});
});

//
//	The API call that gets all the Magnet Hashes that the client is actually
//	having.
//
//	return 		<-	An array with all the Magnet Hashes
//
router.get('/list', function(req, res, next) {

	//
	//	1.	Loop over all the Magnet Hashes
	//
	let torrent = client.torrents.reduce(function(array, data) {

		array.push({
			hash: data.infoHash
		});

		return array;

	}, []);

	//
	//	->	Return the Magnet Hashes
	//
	res.status(200);
	res.json(torrent);

});

//
//	The API call that sends back the stats of the client
//
//	return 		<-	A object with the client stats
//
router.get('/stats', function(req, res, next) {

	res.status(200);
	res.json(stats);

});

//
//	The API call that gets errors that occurred with the client
//
//	return 		<-	A a string with the error
//
router.get('/errors', function(req, res, next) {

	res.status(200);
	res.json(error_message);

});

//
//	The API call to delete a Magnet Hash from the client.
//
//	magnet 		-> 	Magnet Hash
//
//	return 		<-	Just the status of the request
//
router.get('/delete/:magnet', function(req, res, next) {

	//
	//	1.	Extract the magnet Hash and save it in a meaningful variable.
	//
	let magnet = req.params.magnet;

	//
	//	2.	Remove the Magnet Hash from the client.
	//
	client.remove(magnet, function() {

		res.status(200);
		res.end();

	});

});

module.exports = router;
