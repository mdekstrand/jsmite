import { initialize } from "../lib/logging.js";

export async function mochaGlobalSetup() {
  initialize({verbosity: 1});
}
