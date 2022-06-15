// node server.js <PrHoPo>
// - where <PrHoPo> are one of:
//    - <protocol>://<host>:<port>
//    - <host>:<port> (protocol assumed to be http unless port is 443)
//    - :<port> (protocol assumed to be http unless port is 443, listen on all addresses)
//    - <host> (protocol assumed to be http, port is 80)
// Calling from *nix:
// % printf "GET <path> HTTP/1.0\r\n\r\n" | nc <host> <port>
// -or-
// % curl -v -I --insecure <url> 2>&1 | egrep -v '^> |^< |^{|^}|^* T|^* AL|^  0'
// 

const { exception } = require('console');
var http = require('http');
var https = require('https');
var util = require('util');
var table = require('text-table');

function _usage(s, iCode){
    _exit(
`Usage: % node server.js <PrHoPo>
 - where <PrHoPo> is one of:
   - <protocol>://<host>:<port>
   - <host>:<port> (protocol assumed to be http unless port is 443)
   - :<port> (protocol assumed to be http unless port is 443, listen on all addresses)
   - <host> (protocol assumed to be http, port is 80)`,0)
}

function _exit(s, iCode){
    iCode = (iCode==undefined?1:iCode)
    console.log(s)
    process.exit(iCode)
}

function my_web_server(req, res) { 
    let body = [];

    req.on('error', (err) => { console.error(err) })
    req.on('data', (chunk) => { body.push(chunk); })
    req.on('end', () => {
        body = Buffer.concat(body).toString();


 
        console.log('--------------------------------------------------')
        console.log(`Called - HTTP ${req.method} -> ${req.url}`)
        console.log(`headers:\n${dump_headers(req)}`)
        if ('content-type' in req.headers && req.headers['content-type'].toLowerCase() == 'application/json'){
            // Try parsing body as json
            try {
                data = JSON.parse(body)
                console.log(`data:\n${util.inspect(data, true, 4)}\n`)
            } catch(ex) {
                console.log(`json parse failed: ${ex.message}`)
                console.log(`body:\n${body}\n`)
            }

        } else {
            console.log(`body:\n${body}\n`)
        }
        console.log(`END - HTTP ${req.method} -> ${req.url}`)
        console.log('--------------------------------------------------')
        res.write(`url called = ${req.url}`)
        res.end()
    });
}

function dump_headers(req){
    var a = []
    for (const [key, value] of Object.entries(req.headers)) a.push([key, value])
    var t = table(a, {align: ['r', 'l']});
    return t.toString()
}

function main(args) {
    var protocol, host, port


    if (args.length !== 1) _usage()

    s = args[0]
    iF = s.indexOf("://")
    if (iF > -1){
        protocol = s.substring(0, iF)
        s = s.substring(iF+3)
    }

    iF = s.indexOf(":")
    if (iF == 0){
        port = s.substring(iF+1)
    } else if (iF > 0){
        port = s.substring(iF+1)
        host = s.substring(0, iF)
    } else {
        host = s
    }

    if (port == undefined) {
        port = (protocol=='https'?443:80)
    }

    if (!protocol) {
        protocol = (port==443?'https':'http')
    }

    if (protocol == 'http') {
        var server = http.createServer(my_web_server);

    } else if (protocol == 'https') {
        var server = https.createServer(my_web_server);

    } else {
        _exit("Unexpected protocol: ${protocol}", 1)

    }

    if ( host )
        server.listen(port, host);
    else
        server.listen(port);


    console.log(`Node.js ${protocol.toUpperCase()} server at ${(host?host:"all addresses")} on port ${port} running..`)
}

main(process.argv.slice(2));
