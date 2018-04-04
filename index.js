const request = require('request');
const fs = require('fs');
const md5File = require('md5-file')
const Duration = require('duration')

var download = function(url, dest, cb) {
    var file = fs.createWriteStream(dest);
    var sendReq = request({
		method: "GET",
		uri: url
	});

    // verify response code
    sendReq.on('response', function(response) {
        if (response.statusCode !== 200) {
            return cb('Response status was ' + response.statusCode);
        }
    });

    // check for request errors
    sendReq.on('error', function (err) {
        fs.unlink(dest);
        return cb(err.message);
    });

    sendReq.pipe(file);

    file.on('finish', function() {
        file.close(() => {
			cb(dest);  // close() is async, call cb after close completes.
		});
    });

    file.on('error', function(err) { // Handle errors
        fs.unlink(dest); // Delete the file async. (But we don't check the result)
        return cb(err.message);
    });
};

var completedDownloads = 0;

const downloadList = [
	{url: 'https://github.com/unicode-cldr/cldr-core/archive/31.0.0.zip', filename: 'cldr-core-31.0.0.zip', md5: '539f6c8c7d302aee11c1c3d8ff9ecd59'},
	{url: 'https://github.com/unicode-cldr/cldr-dates-modern/archive/31.0.0.zip', filename: 'cldr-dates-modern-31.0.0.zip', md5: '91e09289d417050a823a9de1abfbaee3' },
	{url: 'https://github.com/unicode-cldr/cldr-cal-buddhist-modern/archive/31.0.0.zip', filename: 'cldr-cal-buddhist-modern-31.0.0.zip', md5: 'd403fa1d43478a86963b795f21359e18'}, 
	{url: 'https://github.com/unicode-cldr/cldr-cal-chinese-modern/archive/31.0.0.zip', filename: 'cldr-cal-chinese-modern-31.0.0.zip', md5: '3a8093afae294ddb29125c0fd81fdfcf'},
	{url: 'https://github.com/unicode-cldr/cldr-cal-coptic-modern/archive/31.0.0.zip', filename: 'cldr-cal-coptic-modern-31.0.0.zip', md5: '8f2c7b513291c6e05f93d99f073d4ebe'},
	{url: 'https://github.com/unicode-cldr/cldr-cal-dangi-modern/archive/31.0.0.zip', filename: 'cldr-cal-dangi-modern-31.0.0.zip', md5: '38fb62f6fdf16b73b174b80372c6b8dd'},
	{url: 'https://github.com/unicode-cldr/cldr-cal-ethiopic-modern/archive/31.0.0.zip', filename: 'cldr-cal-ethiopic-modern-31.0.0.zip', md5: '24d95f024af1ff072ae47ff701521c82'},
	{url: 'https://github.com/unicode-cldr/cldr-cal-hebrew-modern/archive/31.0.0.zip', filename: 'cldr-cal-hebrew-modern-31.0.0.zip', md5: '40e03d6545beb7e46c7ea981db69c81b'},
	{url: 'https://github.com/unicode-cldr/cldr-cal-indian-modern/archive/31.0.0.zip', filename: 'cldr-cal-indian-modern-31.0.0.zip', md5: '47fc7a15c2a8d04b3f2778c22345e6ca'},
	{url: 'https://github.com/unicode-cldr/cldr-cal-islamic-modern/archive/31.0.0.zip', filename: 'cldr-cal-islamic-modern-31.0.0.zip', md5: '701a57178d0924b573f621eae5302c2c'},
	{url: 'https://github.com/unicode-cldr/cldr-cal-roc-modern/archive/31.0.0.zip', filename: 'cldr-cal-roc-modern-31.0.0.zip', md5: '0ba68b025138991403ec7bdcc6f98c87'},
	{url: 'https://github.com/unicode-cldr/cldr-localenames-modern/archive/31.0.0.zip', filename: 'cldr-localenames-modern-31.0.0.zip', md5: 'c4d5b11377631f8d309ab70bf7296a9a'},
	{url: 'https://github.com/unicode-cldr/cldr-misc-modern/archive/31.0.0.zip', filename: 'cldr-misc-modern-31.0.0.zip', md5: '1bf52f7bb6854e296d49765de7967f0d'},
	{url: 'https://github.com/unicode-cldr/cldr-numbers-modern/archive/31.0.0.zip', filename: 'cldr-numbers-modern-31.0.0.zip', md5: 'a896181f49554d115cc9ae45855160f4'},
	{url: 'https://github.com/unicode-cldr/cldr-segments-modern/archive/31.0.0.zip', filename: 'cldr-segments-modern-31.0.0.zip', md5: '4345cda781c526bd7bd16a46f095dae1'},
	{url: 'https://github.com/unicode-cldr/cldr-units-modern/archive/31.0.0.zip', filename: 'cldr-units-modern-31.0.0.zip', md5: 'd8ba8aebda9c8bac15f8dc97804db683'}
];

var completedFunction = function(filePath, startTime, targetMd5) {
	completedDownloads++;
	const endTime = new Date();
	const fileMd5 = md5File.sync(filePath);
	if(fileMd5 === targetMd5) {
		console.info("completed file " + completedDownloads+"/"+downloadList.length + " - " + new Duration(startTime, endTime).toString(), filePath);
		fs.unlink(filePath); // Delete the file async. (But we don't check the result)
	} else {
		console.error("ERROR: INVALID MD5 FOR FILE " + completedDownloads+"/"+downloadList.length + " - " + new Duration(startTime, endTime).toString(), filePath, "targetMd5", targetMd5, "fileMd5", fileMd5);
		fs.unlink(filePath); // Delete the file async. (But we don't check the result)
	}
}


var run = function() {

	for(let fileToBeDownloaded of downloadList) {
		const downloadStartTime = new Date();
		download(
			fileToBeDownloaded.url,
			fileToBeDownloaded.filename,
			(filePath) => {
				completedFunction(filePath, downloadStartTime, fileToBeDownloaded.md5)
			}
		);
	}
}

run();
	