/*
 * Script to discover all tags used in blog posts from /search.json
 * and generate a template for each tag to display posts by tag.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

var opts = {
    hostname: 'localhost',
    port: 4000,
    path: '/search.json',
    agent: false
}

var handleResponse = function(res) {

    if (res.statusCode !== 200) {
        console.log('/search.json not available: http status', res.statusCode);
        process.exitCode = 1;
    } else {
        console.log('localhost:4000/search.json found');
        res.setEncoding('utf-8');

        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk });
        res.on('end', () => {

            let searchIdx = JSON.parse(rawData);
            let tags = [];

            searchIdx
                .map(item => item.tags)
                .reduce((a,b) => a.concat(b))
                .forEach(tag => {
                    fs.writeFile(
                        path.join('by_tag', `${tag}.html`),
                        ['---', 'layout: by-tag', `tagKey: ${tag}`, '---'].join('\n'),
                        (err) => { if ( err ) throw err; }
                    );
                });

            console.log('tags rendered to templates and placed in by_tags folder');

        });
    }

};

http.get(opts, handleResponse)
    .on('socket', (socket) => {
        socket.emit('agentRemove');
    });
