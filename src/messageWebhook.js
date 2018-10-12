// var processMessage = require('processMessage');

const FACEBOOK_ACCESS_TOKEN = 'EAAjW5LI3TlsBACdHAvcUoMFj35TdLXOYvrXi6KohrjcXE4J5DSxFDmgzYHFSDFy23ZC0twIyRFqAbGZCOM7gEeVxUPZC9bHnDXCmXMhAOwdQXUZCM6wAq9Yyk7KOD8wC3cGtBAApsGWfM5risZBqQPi8qNZAv8h3QDTS3I5WXLtjfYrn8PO3YT';
const request = require('request');

const sendTextMessage = (event) => {
	const senderId = event.sender.id;
	const message = event.message.text;

	request({
			url: 'https://graph.facebook.com/v2.6/me/messages',
			qs: { access_token: FACEBOOK_ACCESS_TOKEN },
			method: 'POST',
			json: {
			recipient: { id: senderId },
			message: { text },
	 	}
	});
};

// module.exports = (event) => {
// // const senderId = event.sender.id;
// // const message = event.message.text;
// // const apiaiSession = apiAiClient.textRequest(message, {sessionId: ‘crowdbotics_bot’});
// // apiaiSession.on(‘response’, (response) => {
// // const result = response.result.fulfillment.speech;
// sendTextMessage(senderId, message);
// // });
// // apiaiSession.on(‘error’, error => console.log(error));
// // apiaiSession.end();
// };

module.exports = (req, res) => {
	if (req.body.object === 'page') {
		req.body.entry.forEach(entry => {
			entry.messaging.forEach(event => {
				if (event.message && event.message.text) {
					sendTextMessage(event);
				}
			});
		});
		res.status(200).end();
	}
};