import * as test from "blue-tape";
import Wire      from "../bittorrent-wire";

let id    = "-EM0022-PEANUTS4AITH";

test("Metadata Request (1)", function (t) {
  t.plan(1);

  let wire = new Wire("e940a7a57294e4c98f62514b32611e38181b6cae", id);
  wire.on("error", (err) => { t.fail(err.toString()); });
  wire.pipe(wire);

  t.equal( true, true, "blah blah");

  wire.sendHandshake();
  wire.metaDataRequest();

});
