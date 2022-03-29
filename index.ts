import minimist from "minimist";
import { parse } from "./parse";

interface Yargs {
  /** directory to scan */
  d: string;
  /** threshold to take streaming history by listening time in ms */
  t: number;
}
try {
  const params: Yargs = minimist(process.argv.slice(2)) as unknown as Yargs;
  if (typeof params.d === "string" && typeof params.t === "number") {
    parse({ directory: params.d, threshold: params.t });
  } else {
    throw new Error("could not parse args");
  }
} catch (err) {
  console.log(err);
  console.log(
    "example -d=./spotify-directory -s=true -t=1200000\n -d directory\n -t threshold of streaming listening time in milliseconds"
  );
}
