import * as path from "path";
import * as child_process from "child_process";
import * as util from "util";
const execPromise = util.promisify(child_process.exec);

import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// const TARGET_SCRIPT_NAME = "generateShrinkwrap";
const TARGET_SCRIPT_NAME = "prepublishOnly";
const PACKAGES_DIR = path.resolve(__dirname, "..", "packages");

async function runScriptInPackage(pkgName, pkgPath) {
    const command = `npm run ${TARGET_SCRIPT_NAME}`;
    console.log(`[${pkgName}] command: ${command}`);

    try {
        const { stdout, stderr } = await execPromise(command, { cwd: pkgPath });
        return { pkgName, status: "SUCCESS", stdout: stdout.toString().trim(), stderr: stderr.trim() };

    } catch (error) {
        const output = error.stdout.toString() || error.stderr.toString() || error.message;
        return { pkgName, status: "FAILED", error: `${error}`, stdout: `${error.stdout.toString()}`, stderr: `${error.stderr.toString()}` };
    }
}

async function runAllScriptsInParallel() {
    console.log("======================= start =====================", new Date().toLocaleTimeString());
    const packageDirs = [
        "test-cli-commons",
        "test-cli-export",
        "test-cli-extra",
        "test-cli-init"
    ];

    const executionPromises = packageDirs.map(pkgName => {
        const pkgPath = path.join(PACKAGES_DIR, pkgName);
        return runScriptInPackage(pkgName, pkgPath);
    });

    const results = await Promise.all(executionPromises);

    console.log("======================= results =======================");
    results.forEach(result => {
        switch (result.status) {
            case "SUCCESS":
                console.log(`[${result.pkgName}] ✅ success`);
                console.log(`* stdout:`, result.stdout);
                break;
            case "FAILED":
                console.error(`[${result.pkgName}] ❌ faild:`);
                // console.error("- err:", result.error);
                if (result.stdout) console.error("- stdout:", result.stdout.toString().replaceAll("\n", "\n_ "));
                if (result.stderr) console.error("- stderr:", result.stderr.toString().replaceAll("\n", "\n_ "));
                break;
        }
    });

    console.log("======================= End =======================", new Date().toLocaleTimeString());
}

runAllScriptsInParallel();
