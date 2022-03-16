// netlify/functions/send_mail/send_mail.mjs
exports.handler = async function(event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  console.log("Name:", event["body"]);
  return "";
};
//# sourceMappingURL=send_mail.js.map
