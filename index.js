const http = require('http');
http.createServer((req,res) => {
  res.writeHead(200);
  res.end('Bot 24jam Nyala Mas!');
}).listen(process.env.PORT || 3000, () => {
  console.log('Server web nyala di port', process.env.PORT || 3000);
});
