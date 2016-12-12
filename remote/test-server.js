const http = require('http');
const nodeStatic = require('node-static');
const port = 3000;

const demo = new nodeStatic.Server('../demo');
const server = http.createServer((request, response) => {
    request.addListener('end', () => demo.serve(request, response)).resume();
}).listen(port, () => console.log(`Running server on port ${port}`));

module.exports = server;
