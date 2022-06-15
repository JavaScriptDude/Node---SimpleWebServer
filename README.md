# Node SimpleWebServer
Bare Bones Node based Web Server For Testing

```
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
```


This tool can be used to create a simple http or https server strawman for tesing purposes. For example, testing firewalls, http proxies, web browsers or other http clients.

Will output basic information to the console including http method, uri, headers, body / data (if json)
