import fetch from 'node-fetch';

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
  /*let r = await fetch("https://api.sendgrid.com/v3/mail/send", {//process.env.SLACK_WEBHOOK_URL, {
    headers: {
      "Content-Type": "application/json",
	  "Authorization": "Bearer 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"
    },
    method: "POST",
    body: JSON.stringify({
		  personalizations: [{to: [{email: "nbarresi@gmail.com"}]}],
		  from: {email: "invitati@farresi.it"},
		  subject: "Sending with SendGrid is " ,
		  content: [{type: "text/plain", value: "and easy to do anywhere, even with cURL"}]
	  }),
  });
	
	let buffer = await r.text();
    const response = {
        statusCode: r.status,
        body: buffer,
        header: r.headers
    };
	return response;
  */
  
  //const name = event['body']['name'];
  console.log('Name:', event['body']);
  return "";
   /*return fetch("https://api.sendgrid.com/v3/mail/send", {//process.env.SLACK_WEBHOOK_URL, {
    headers: {
      "Content-Type": "application/json",
	  "Authorization": "Bearer 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"
    },
    method: "POST",
    body: JSON.stringify({
		  personalizations: [{to: [{email: "nbarresi@gmail.com"}]}],
		  from: {email: "invitati@farresi.it"},
		  subject: "Sending with SendGrid is " ,
		  content: [{type: "text/plain", value: "and easy to do anywhere, even with cURL"}]
	  }),
  }).then((result) => ({
      statusCode: 200,
      body: result//`Hello, ! Your greeting has been sent to Slack 👋`,//${name}
    }))
	.then(data => {
	  console.log('Success:', data);
	})
	.catch((error) => {
	  console.error('Error:', error);
	});*/
	
	
};