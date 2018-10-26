module.exports = (req, res) => {
	var tmp = req._url.query;
	tmp = tmp.split('&');
	const hubChallenge = tmp[1].split('=')[1];
	const hubMode = tmp[0].split('=')[1];
	const verifyTokenMatches = (tmp[2].split('=')[1] === 'I_am_too_tired_to_work_any_longer');
	// console.log(req)
	console.log(hubMode && verifyTokenMatches)

	if (hubMode && verifyTokenMatches) {
		// res.status(200).send(hubChallenge
		// console.log(parseInt(hubChallenge));
		// res.send(parseInt(hubChallenge));

		res.send(200, parseInt(hubChallenge));


	    // res.status(200).json({
	      // 'error': false,
	      // 'message': hubChallenge,
	      // 'data': data
	    // });




	} else {
		// console.log(req.query['hub.challenge']);
		res.status(403);
	}
};

// hub.mode=subscribe&hub.challenge=171344716&hub.verify_token=I_am_too_tired_to_work_any_longer
// hub.mode=subscribe&hub.challenge=598277699&hub.verify_token=I_am_too_tired_to_work_any_longer


// module.exports = (req, res) => {
// 	var tmp = req._url.query;
// 	tmp = tmp.split('&');
// 	const hubChallenge = req.query['hub.challenge'];
// 	const hubMode = req.query['hub.mode'];
// 	const verifyTokenMatches = (req.query['hub.verify_token'] === 'I_am_too_tired_to_work_any_longer');
// 	// console.log(req)
// 	console.log(req._url.query)

// 	if (hubMode && verifyTokenMatches) {
// 		res.status(200).send(hubChallenge);
// 	} else {
// 		// console.log(req.query['hub.challenge']);
// 		res.status(403).end();
// 	}
// };