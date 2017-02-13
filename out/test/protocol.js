"use strict";
const test = require("blue-tape");
const bittorrent_wire_1 = require("../bittorrent-wire");
const TPH = require("torrent-piece-handler");
let id = "-EM0022-PEANUTS4AITH";
test("Not Interested (1)", function (t) {
    t.plan(1);
    let wire = new bittorrent_wire_1.default("e940a7a57294e4c98f62514b32611e38181b6cae", id);
    wire.on("error", (err) => { t.fail(err.toString()); });
    wire.pipe(wire);
    wire.on("close", () => {
        t.false(wire.isActive, "Check the isActive flag");
    });
    wire.sendHandshake();
    wire.sendNotInterested();
});
test("Interested (2)", function (t) {
    t.plan(2);
    let wire = new bittorrent_wire_1.default("e940a7a57294e4c98f62514b32611e38181b6cae", id);
    let wire2 = new bittorrent_wire_1.default("e940a7a57294e4c98f62514b32611e38181b6cae", id);
    wire.on("error", (err) => { t.fail(err.toString()); });
    wire2.on("error", (err) => { t.fail(err.toString()); });
    wire.pipe(wire2).pipe(wire);
    wire.on("interested", () => {
        t.false(wire.choked, "Check the choked flag");
    });
    wire2.on("interested", () => {
        t.false(wire.choked, "Check the choked flag");
    });
    wire.sendHandshake();
    wire2.sendHandshake();
    wire.sendInterested();
});
test("Have (1)", function (t) {
    t.plan(1);
    let wire = new bittorrent_wire_1.default("e940a7a57294e4c98f62514b32611e38181b6cae", id);
    wire.on("error", (err) => { t.fail(err.toString()); });
    wire.pipe(wire);
    wire.on("have", (index) => {
        t.equal(index, 1, "Check the index is correct");
    });
    wire.sendHandshake();
    wire.sendHave(1);
});
test("Have large number (1)", function (t) {
    t.plan(1);
    let wire = new bittorrent_wire_1.default("e940a7a57294e4c98f62514b32611e38181b6cae", id);
    wire.on("error", (err) => { t.fail(err.toString()); });
    wire.pipe(wire);
    wire.on("have", (index) => {
        t.equal(index, 17947, "Check the index is correct");
    });
    wire.sendHandshake();
    wire.sendHave(17947);
});
test("Bitfield (1)", function (t) {
    t.plan(1);
    let buffer = Buffer.from("40", "hex");
    let wire = new bittorrent_wire_1.default("e940a7a57294e4c98f62514b32611e38181b6cae", id);
    wire.on("error", (err) => { t.fail(err.toString()); });
    wire.pipe(wire);
    wire.on("bitfield", (bits) => {
        t.equal(bits.toString("hex"), buffer.toString("hex"), "equality of bits");
    });
    wire.sendHandshake();
    wire.sendInterested();
    wire.sendBitfield(buffer);
});
test("Request (15)", function (t) {
    t.plan(15);
    let interval = 0;
    const files = [{ path: "Downloads/lol1/1.png",
            name: "1.png",
            length: 255622,
            offset: 0 },
        { path: "Downloads/lol2/2.png",
            name: "2.png",
            length: 1115627,
            offset: 255622 }];
    let wire = new bittorrent_wire_1.default("e940a7a57294e4c98f62514b32611e38181b6cae", id);
    wire.on("error", (err) => { t.fail(err.toString()); });
    wire.pipe(wire);
    wire.on("request", () => {
        interval++;
        if (interval === 5) {
            t.equal(wire.inRequests[0].index, 0, "Check the index is correct");
            t.equal(wire.inRequests[0].begin, 16384 * 0, "Check the begin is correct");
            t.equal(wire.inRequests[0].length, 16384, "Check the length is correct");
            t.equal(wire.inRequests[1].index, 0, "Check the index is correct");
            t.equal(wire.inRequests[1].begin, 16384 * 1, "Check the begin is correct");
            t.equal(wire.inRequests[1].length, 16384, "Check the length is correct");
            t.equal(wire.inRequests[2].index, 0, "Check the index is correct");
            t.equal(wire.inRequests[2].begin, 16384 * 2, "Check the begin is correct");
            t.equal(wire.inRequests[2].length, 16384, "Check the length is correct");
            t.equal(wire.inRequests[3].index, 0, "Check the index is correct");
            t.equal(wire.inRequests[3].begin, 16384 * 3, "Check the begin is correct");
            t.equal(wire.inRequests[3].length, 16384, "Check the length is correct");
            t.equal(wire.inRequests[4].index, 0, "Check the index is correct");
            t.equal(wire.inRequests[4].begin, 16384 * 4, "Check the begin is correct");
            t.equal(wire.inRequests[4].length, 16384, "Check the length is correct");
        }
        else {
            return;
        }
    });
    wire.sendHandshake();
    wire.sendInterested();
    let tph = new TPH.default(files, 962416635, 1048576, 918, 872443);
    tph.prepareRequest(0, (buf, count) => {
        wire.sendRequest(buf, count);
    });
});
test("Cancel (3)", function (t) {
    t.plan(3);
    let buffer = Buffer.from("40", "hex");
    let wire = new bittorrent_wire_1.default("e940a7a57294e4c98f62514b32611e38181b6cae", id);
    wire.on("error", (err) => { t.fail(err.toString()); });
    wire.pipe(wire);
    wire.on("cancel", (index, begin, length) => {
        t.equal(index, 0, "equality index");
        t.equal(begin, 16384 * 2, "equality begin");
        t.equal(length, 16384, "equality length");
    });
    wire.sendHandshake();
    wire.sendInterested();
    wire.sendCancel(0, 16384 * 2, 16384);
});
