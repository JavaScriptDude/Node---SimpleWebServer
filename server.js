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
// Home: https://github.com/JavaScriptDude/Node-SimpleWebServer

const { exception } = require('console');
const http = require('http');
const https = require('https');
const util = require('util');
const table = require('text-table');
const dayjs = require('dayjs');

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

    setTimeout(_do_work, 1)

    function _do_work(){

        req.on('error', (err) => { console.error(err) })
        req.on('data', (chunk) => { body.push(chunk); })
        req.on('end', () => {
            body = Buffer.concat(body).toString();

            var is_json=false, json_ok=false, json_err=null
    
            console.log('--------------------------------------------------')
            console.log(`${dayjs().format('YYmmDD-HHMMss.SSS')} - ${req.method} -> ${req.url}`)
            console.log(`HEADERS:\n${dump_headers(req)}`)
            if ('content-type' in req.headers && req.headers['content-type'].toLowerCase() == 'application/json'){
                // Try parsing body as json
                try {
                    data = JSON.parse(body)
                    console.log(`DATA:\n  ${util.inspect(data, true, 4).replace('\n', '\n  ')}`)
                    is_json = true
                    json_ok = true
                } catch(ex) {
                    json_err = ex.message
                    console.log(`JSON parse failed: ${json_err}`)
                    console.log(`BODY:\n  ${body.replace('\n', '\n  ')}`)
                }

            } else {
                if (body.trim() == '')
                    console.log(`BODY: (none)`)
                else
                    console.log(`BODY:\n  ${body.replace('\n', '\n  ')}`)
            }
            console.log(`${dayjs().format('YYmmDD-HHMMss.SSS')} - END - ${req.method} -> ${req.url}`)
            console.log('--------------------------------------------------\n')
            try {
                if (is_json){
                    res.setHeader('Content-Type', 'application/json');
                    if (json_ok){
                        res.write(`{"success": true}`)
                    } else {
                        res.write(`{"success": false, "reason": ${json_err}}`)
                    }
                } else{
                    res.write(`url called = ${req.url}`)
                }
            }catch(ex){
                console.error("Failed while writing response", ex)
            } finally {
                res.end()
            }
        });
    }
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
