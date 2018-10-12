module.exports = (req, res) => {
	const hubChallenge = req.query['hub.challenge'];
	const hubMode = req.query['hub.mode'];
	const verifyTokenMatches = (req.query['hub.verify_token'] === 'I_am_too_tired_to_work_any_longer');
	if (hubMode && verifyTokenMatches) {
		res.status(200).send(hubChallenge);
	} else {
		res.status(403).end();
	}
};