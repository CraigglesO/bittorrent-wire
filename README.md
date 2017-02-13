# bittorrent-wire [![travis][travis-image]][travis-url] [![npm][npm-image]][npm-url] [![downloads][downloads-image]][downloads-url]

[travis-image]: https://travis-ci.org/CraigglesO/bittorrent-wire.svg?branch=master
[travis-url]: https://travis-ci.org/CraigglesO/bittorrent-wire
[npm-image]: https://img.shields.io/npm/v/bittorrent-wire.svg
[npm-url]: https://npmjs.org/package/bittorrent-wire
[downloads-image]: https://img.shields.io/npm/dm/bittorrent-wire.svg
[downloads-url]: https://npmjs.org/package/bittorrent-wire

### A stream ready wire for the Bittorrent Protocol

One of the fastest, lightest, and smartest bittorrent wires yet.

#### Streams
* [THE STREAM HANDBOOK](https://github.com/substack/stream-handbook)
* [Duplex Streams](https://nodejs.org/api/stream.html#stream_duplex_and_transform_streams)

![Alt text](http://github.com/CraigglesO/bittorrent-wire)
<img src="http://github.com/CraigglesO/bittorrent-wire">


#### Extension Protocol
* Extension      [BEP_0010](http://www.bittorrent.org/beps/bep_0010.html)
  * UT_PEX       [BEP_0011](http://www.bittorrent.org/beps/bep_0011.html)
  * UT_METADATA  [BEP_0009](http://www.bittorrent.org/beps/bep_0009.html)

| module | tests | version | description |
|---|---|---|---|
| [ut-extensions][ut-extensions] | [![][ut-extensions-ti]][ut-extensions-tu] | [![][ut-extensions-ni]][ut-extensions-nu] | Extensions for The Bittorent Protocol

[ut-extensions]:    https://github.com/CraigglesO/ut-extensions
[ut-extensions-ti]: https://travis-ci.org/CraigglesO/ut-extensions.svg?branch=master
[ut-extensions-tu]: https://travis-ci.org/CraigglesO/ut-extensions
[ut-extensions-ni]: https://img.shields.io/npm/v/ut-extensions.svg
[ut-extensions-nu]: https://npmjs.org/package/ut-extensions


## Install

``` javascript
npm install bittorrent-wire
```

## Usage

**Basic**
``` javascript
import Wire from "bittorrent-wire"

let wire = new Wire("INFO_HASH_GOES_HERE", "PEER_ID_GOES_HERE");

wire.pipe(wire);
```

**Online**
``` javascript
import * as net from 'net';
import Wire     from "bittorrent-wire"

let socket = net.connect(1337, 'localhost');

socket.once('connect', () => {
  let wire = new Wire("INFO_HASH_GOES_HERE", "PEER_ID_GOES_HERE");
  socket.pipe(wire).pipe(socket);

  wire.on("handshake", (infoHash, peerID) => {
    // ...
  });
});

```

## ISC License (Open Source Initiative)

ISC License (ISC)
Copyright 2017 <CraigglesO>
Copyright (c) 2004-2010 by Internet Systems Consortium, Inc. ("ISC")
Copyright (c) 1995-2003 by Internet Software Consortium


Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
