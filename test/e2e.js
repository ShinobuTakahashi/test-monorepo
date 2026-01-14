import { tmpdir } from "os";
import { join } from "path";
import { mkdtemp } from "fs/promises";
import { exec as _exec, spawn as _spawn } from "child_process";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const shell = require("shelljs");
const tmpDir = tmpdir();
const targetDir = await mkdtemp(`${join(tmpDir, "test-akashic-cli_")}`);


process.on("exit", () => {
	console.log("delete test-directory");
	shell.cd(`${tmpDir}`);
	shell.rm("-rf", `${targetDir}`);
});

try {
	console.log("--- e2e Start test");

	console.log("--- e2e Completed!");
	process.exitCode = 0;
} catch (e) {
	console.error(e);
	if (e.output) {
		console.error(e.output.toString());
	}
	console.error("Failed!");
	process.exitCode = 1;
}
