const express = require('express');
const router = express.Router();
const ySubs = require('yifysubtitles-api');

router.get('/:movieId', function(req, res, next) {
    let movieId = req.params.movieId;
    
    ySubs
    .search({imdbid: movieId, limit:'best'})
    .then(response => {
        res.status(200);
	    res.json(response);
    })
    .catch(err => {
        console.log(err);
        next(err);
    })
});

module.exports = router;