import * as test from "blue-tape";
import * as fs   from "fs";
import Wire      from "../bittorrent-wire";

let parseTorrent   = require("parse-torrent"),
    bencode        = require("bencode"),
    string2compact = require("string2compact");

let id    = "-EM0022-PEANUTS4AITH";


test("Metadata Request (5)", function (t) {
  t.plan(5);

  let torrent      = fs.readFileSync("./screen.torrent"),
      torrentFile  = parseTorrent(torrent),
      infoBuf      = bencode.encode(torrentFile.info),
      infoLength   = infoBuf.length,
      torrentInfo  = torrentFile.info;
  let opts = {
    "metadata_handshake": {
      "ipv4":          new Buffer(0),
      "ipv6":          new Buffer(0),
      "m": {
         ut_metadata:  2,
         ut_pex:       1,
       },
      "metadata_size": 252,
      "p":             1337,
      "reqq":          250,
      "v":             new Buffer(0),
      "yourip":        new Buffer(0),
    }
  };

  let wire = new Wire(torrentFile.infoHash, id);
  let wire2 = new Wire(torrentFile.infoHash, id, opts);
  wire.on("error", (err) => { t.fail(err.toString()); });
  wire2.on("error", (err) => { t.fail(err.toString()); });
  wire.pipe(wire2).pipe(wire);

  wire2.createExtensions(infoLength, torrentFile.info);

  wire2.on("handshake", () => {
    wire2.sendHandshake();
  });
  wire.on("handshake", () => {
    process.nextTick(() => {
      wire.metaDataRequest();
    });
  });
  wire.on("metadata", (torrent) => {
    t.equal(torrent.length, torrentFile.info.length, "info length still match");
    t.equal(JSON.stringify(torrent.info.name), JSON.stringify(torrentFile.info.name), "info name still match");
    t.equal(JSON.stringify(torrent.info.pieces), JSON.stringify(torrentFile.info.pieces), "info pieces still match");
    t.equal(JSON.stringify(torrent.info["piece length"]), JSON.stringify(torrentFile.info["piece length"]), "info piece length still match");
    t.equal(torrent.info.toString(), torrentFile.info.toString(), "exactly the same infos");
  });

  wire.sendHandshake();

});

test("Metadata LARGE Request (5)", function (t) {
  t.plan(5);

  let torrent      = fs.readFileSync("./ntbos.torrent"),
      torrentFile  = parseTorrent(torrent),
      infoBuf      = bencode.encode(torrentFile.info),
      infoLength   = infoBuf.length,
      torrentInfo  = torrentFile.info;

  let opts = {
    "metadata_handshake": {
      "ipv4":          new Buffer(0),
      "ipv6":          new Buffer(0),
      "m": {
         ut_metadata:  2,
         ut_pex:       1,
       },
      "metadata_size": 17549,
      "p":             1337,
      "reqq":          250,
      "v":             new Buffer(0),
      "yourip":        new Buffer(0),
    }
  };

  let wire = new Wire(torrentFile.infoHash, id);
  let wire2 = new Wire(torrentFile.infoHash, id, opts);
  wire.on("error", (err) => { t.fail(err.toString()); });
  wire2.on("error", (err) => { t.fail(err.toString()); });
  wire.pipe(wire2).pipe(wire);

  wire2.createExtensions(infoLength, torrentFile.info);

  wire2.on("handshake", () => {
    wire2.sendHandshake();
  });
  wire.on("handshake", () => {
    process.nextTick(() => {
      wire.metaDataRequest();
    });
  });
  wire.on("metadata", (torrent) => {
    t.equal(torrent.length, torrentFile.info.length, "info length still match");
    t.equal(JSON.stringify(torrent.info.name), JSON.stringify(torrentFile.info.name), "info name still match");
    t.equal(JSON.stringify(torrent.info.pieces), JSON.stringify(torrentFile.info.pieces), "info pieces still match");
    t.equal(JSON.stringify(torrent.info["piece length"]), JSON.stringify(torrentFile.info["piece length"]), "info piece length still match");
    t.equal(torrent.info.toString(), torrentFile.info.toString(), "exactly the same infos");
  });

  wire.sendHandshake();

});

test("Pex message", function (t) {
  t.plan(4);

  let torrent      = fs.readFileSync("./screen.torrent"),
      torrentFile  = parseTorrent(torrent),
      infoBuf      = bencode.encode(torrentFile.info),
      infoLength   = infoBuf.length,
      torrentInfo  = torrentFile.info;
  let opts = {
    "metadata_handshake": {
      "ipv4":          new Buffer(0),
      "ipv6":          new Buffer(0),
      "m": {
         ut_metadata:  2,
         ut_pex:       1,
       },
      "metadata_size": 252,
      "p":             1337,
      "reqq":          250,
      "v":             new Buffer(0),
      "yourip":        new Buffer(0),
    }
  };

  let peers = [
    "10.10.10.5:128",
    "100.56.58.99:28525",
    "65.156.3.75:2000"
  ];

  let droppedPeers = [
    "1.10.10.5:128",
    "111.56.58.99:28525",
    "66.156.3.75:2000"
  ];

  let wire = new Wire(torrentFile.infoHash, id);
  let wire2 = new Wire(torrentFile.infoHash, id, opts);
  wire.on("error", (err) => { t.fail(err.toString()); });
  wire2.on("error", (err) => { t.fail(err.toString()); });
  wire.pipe(wire2).pipe(wire);

  wire2.createExtensions(infoLength, torrentFile.info);

  wire2.on("handshake", () => {
    wire2.sendHandshake();
  });
  wire.on("handshake", () => {
    process.nextTick(() => {
      wire2.sendPexPeers(peers, null, droppedPeers, null);
    });
  });

  wire.on("pex_added", (peers) => {
    t.true( true, "testing pex_added responce");
    t.equal(JSON.stringify(peers), JSON.stringify(["10.10.10.5:128", "100.56.58.99:28525", "65.156.3.75:2000"]), "testing Canonical Peer Priority");
  });

  wire.on("pex_dropped", (peers) => {
    t.true( true, "testing pex_dropped responce");
    t.equal(JSON.stringify(peers), JSON.stringify(["1.10.10.5:128", "111.56.58.99:28525", "66.156.3.75:2000"]), "testing Canonical Peer Priority");
  });

  wire.sendHandshake();

});

test("Pex message with ID", function (t) {
  t.plan(4);

  let torrent      = fs.readFileSync("./screen.torrent"),
      torrentFile  = parseTorrent(torrent),
      infoBuf      = bencode.encode(torrentFile.info),
      infoLength   = infoBuf.length,
      torrentInfo  = torrentFile.info;
  let opts = {
    "metadata_handshake": {
      "ipv4":          new Buffer(0),
      "ipv6":          new Buffer(0),
      "m": {
         ut_metadata:  2,
         ut_pex:       1,
       },
      "metadata_size": 252,
      "p":             1337,
      "reqq":          250,
      "v":             new Buffer(0),
      "yourip":        new Buffer(0),
    }
  };

  let peers = [
    "10.10.10.5:128",
    "100.56.58.99:28525",
    "65.156.3.75:2000"
  ];

  let droppedPeers = [
    "1.10.10.5:128",
    "111.56.58.99:28525",
    "66.156.3.75:2000"
  ];

  let wire = new Wire(torrentFile.infoHash, id);
  let wire2 = new Wire(torrentFile.infoHash, id, opts);
  wire.on("error", (err) => { t.fail(err.toString()); });
  wire2.on("error", (err) => { t.fail(err.toString()); });
  wire.pipe(wire2).pipe(wire);

  wire2.createExtensions(infoLength, torrentFile.info, "71.54.32.122:1337");
  wire.createExtensions(infoLength, torrentFile.info, "71.54.32.122:1337");

  wire2.on("handshake", () => {
    wire2.sendHandshake();
  });
  wire.on("handshake", () => {
    process.nextTick(() => {
      wire2.sendPexPeers(peers, null, droppedPeers, null);
    });
  });

  wire.on("pex_added", (peers) => {
    t.true( true, "testing pex_added responce");
    t.equal(JSON.stringify(peers), JSON.stringify(["65.156.3.75:2000", "100.56.58.99:28525", "10.10.10.5:128"]), "testing Canonical Peer Priority");
  });

  wire.on("pex_dropped", (peers) => {
    t.true( true, "testing pex_dropped responce");
    t.equal(JSON.stringify(peers), JSON.stringify(["66.156.3.75:2000", "111.56.58.99:28525", "1.10.10.5:128"]), "testing Canonical Peer Priority");
  });

  wire.sendHandshake();

});
