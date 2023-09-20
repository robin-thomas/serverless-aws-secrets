module.exports.handler = async (event) => ({
  statusCode: 200,
  body: JSON.stringify({
    message: 'Go Serverless v3.0! Your function executed successfully!',
    input: event,
  }),
})
