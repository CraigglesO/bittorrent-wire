import * as test from "blue-tape";
import Wire      from "../bittorrent-wire";

const UTmetadata = require("ut-extensions").UTmetadata,
      UTpex      = require("ut-extensions").UTpex;

let id    = "-EM0022-PEANUTS4AITH";

test("Handshake", function (t) {
  t.plan(4);

  let wire = new Wire("e940a7a57294e4c98f62514b32611e38181b6cae", id);
  wire.on("error", (err) => { t.fail(err.toString()); });
  wire.pipe(wire);

  wire.on("handshake", function (infoHash, peerId) {
    t.equal(infoHash.length, 20, "check the length of the infohash");
    t.equal(infoHash.toString("hex"), "e940a7a57294e4c98f62514b32611e38181b6cae", "sanity check");
    t.equal(Buffer.from(peerId, "hex").length, 20, "check the length of the peerID");
    t.equal(Buffer.from(peerId, "hex").toString(), "-EM0022-PEANUTS4AITH", "sanity check");
    t.end();
  });

  wire.sendHandshake();
});

test("Handshake with Buffers", function (t) {
  t.plan(4);

  let infoHash = Buffer.from("e940a7a57294e4c98f62514b32611e38181b6cae", "hex");
  let idBuf    = Buffer.from(id);

  let wire = new Wire(infoHash, idBuf);
  wire.on("error", (err) => { t.fail(err.toString()); });
  wire.pipe(wire);

  wire.on("handshake", function (infoHash, peerId) {
    t.equal(infoHash.length, 20, "check the length of the infohash");
    t.equal(infoHash.toString("hex"), "e940a7a57294e4c98f62514b32611e38181b6cae", "sanity check");
    t.equal(Buffer.from(peerId, "hex").length, 20, "check the length of the peerID");
    t.equal(Buffer.from(peerId, "hex").toString(), "-EM0022-PEANUTS4AITH", "sanity check");
    t.end();
  });

  wire.sendHandshake();
});

test("Bad Handshake", function (t) {
  t.plan(1);

  let infoHash  = Buffer.from("e940a7a57294e4c98f62514b32611e38181b6cae", "hex");
  let infoHash2 = Buffer.from("222222227294e4c98f62514b32611e38181b6cae", "hex");
  let idBuf     = Buffer.from(id);

  let wire  = new Wire(infoHash, idBuf);
  let wire2 = new Wire(infoHash2, idBuf);
  wire.on("error", (err) => { t.fail(err.toString()); });
  wire2.on("error", (err) => { t.fail(err.toString()); });
  wire.pipe(wire2);

  wire2.on("close", function (infoHash, peerId) {
    t.ok( true, "bad handshake");
  });

  wire.sendHandshake();
});

test("Extended Handshake without options", function (t) {
  t.plan(6);

  let wire = new Wire("e940a7a57294e4c98f62514b32611e38181b6cae", id);
  let wire2 = new Wire("e940a7a57294e4c98f62514b32611e38181b6cae", id);
  wire.on("error", (err) => { t.fail(err.toString()); });
  wire2.on("error", (err) => { t.fail(err.toString()); });
  wire.pipe(wire2).pipe(wire);

  // TWO IS SEEDER, ONE IS LEECHER
  wire2.on("handshake", function (infoHash, peerId) {
    t.true( wire2.peerHasExt, "has extensions");
    t.false( wire2.peerHasDHT, "does not have DHT");
    wire2.sendHandshake();
  });

  wire.on("handshake", () => {
    setTimeout(() => {
      let ext = wire.ext;
      t.equal(ext.ut_metadata, 2, "ut_metadata code properly initialzed");
      t.equal(ext.ut_pex, 1, "ut_pex code properly initialized");
      t.true(ext["1"] instanceof UTpex, "UT_PEX created");
      t.true(ext["2"] instanceof UTmetadata, "UT_META_DATA created");
    }, 500);
  });

  wire.sendHandshake();
});

test("Extended Handshake with options", function (t) {
  t.plan(6);

  let opts = {
    "metadata_handshake": {
      "ipv4":          new Buffer(0),
      "ipv6":          new Buffer(0),
      "m": {
         ut_metadata:  32,
         ut_pex:       7,
       },
      "metadata_size": 12345,
      "p":             1337,
      "reqq":          250,
      "v":             new Buffer(0),
      "yourip":        new Buffer(0),
    }
  };

  let wire = new Wire("e940a7a57294e4c98f62514b32611e38181b6cae", id);
  let wire2 = new Wire("e940a7a57294e4c98f62514b32611e38181b6cae", id, opts);
  wire.on("error", (err) => { t.fail(err.toString()); });
  wire2.on("error", (err) => { t.fail(err.toString()); });
  wire.pipe(wire2).pipe(wire);

  // TWO IS SEEDER, ONE IS LEECHER
  wire2.on("handshake", function (infoHash, peerId) {
    t.true( wire2.peerHasExt, "has extensions");
    t.false( wire2.peerHasDHT, "does not have DHT");
    wire2.sendHandshake();
  });

  wire.on("handshake", () => {
    setTimeout(() => {
      let ext = wire.ext;
      t.equal(ext.ut_metadata, 32, "ut_metadata code properly initialzed");
      t.equal(ext.ut_pex, 7, "ut_pex code properly initialized");
      t.true(ext["1"] instanceof UTpex, "UT_PEX created");
      t.true(ext["2"] instanceof UTmetadata, "UT_META_DATA created");
    }, 500);
  });

  wire.sendHandshake();
});
