const http = require('http');
const nodeStatic = require('node-static');
const port = 3001;

let framework = process.env.framework || 'jquery';

const demo = new nodeStatic.Server(`../demos/${framework}`);
const server = http.createServer((request, response) => {
    request.addListener('end', () => demo.serve(request, response)).resume();
}).listen(port, () => console.log(`Running ${framework} demo on port ${port}`));

module.exports = server;
