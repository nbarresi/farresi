exports.handler = async function (event, context) {
	// Only allow POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // When the method is POST, the name will no longer be in the event’s
  // queryStringParameters – it’ll be in the event body encoded as a queryString
  //const params = querystring.parse(event.body);
  //const name = params.name || "World";

  // Send greeting to Slack
  return fetch("https://api.sendgrid.com/v3/mail/send", {//process.env.SLACK_WEBHOOK_URL, {
    headers: {
      "content-type": "application/json",
	  "Authorization": "Bearer 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"
    },
    method: "POST",
    body: JSON.stringify({
		  personalizations: [{to: [{email: "nbarresi@gmail.com"}]}],
		  from: {email: "invitati@farresi.it"},
		  subject: "Sending with SendGrid is " ,
		  content: [{type: "text/plain", value: "and easy to do anywhere, even with cURL"}]
	  }),
  })
    .then(() => ({
      statusCode: 200,
      body: `Hello, ${name}! Your greeting has been sent to Slack 👋`,
    }))
    .catch((error) => ({
      statusCode: 422,
      body: `Oops! Something went wrong. ${error}`,
    }));
	
	
}
