import { rimraf } from "rimraf";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { execSync } from "node:child_process";
import pkg from "./package.json"

process.env.INFRARED_VERSION = pkg.version;

const isDevelopment = process.argv.includes("--dev");

await rimraf("dist");
await mkdir("dist");

// don't compile these files
await copyFile("src/sw.js", "dist/sw.js");
await copyFile("src/ir.config.js", "dist/ir.config.js");

let builder = await Bun.build({
	target: "browser",
	sourcemap: "external",
	minify: !isDevelopment,
	entrypoints: [
		"./src/ir.bundle.js",
		"./src/ir.client.js",
		"./src/ir.handler.js",
		"./src/ir.sw.js",
	],
	define: {
		"process.env.INFRARED_VERSION": JSON.stringify(
			process.env.INFRARED_VERSION
		),
		"process.env.INFRARED_COMMIT_HASH": (() => {
			try {
				let hash = JSON.stringify(
					execSync("git rev-parse --short HEAD", {
						encoding: "utf-8",
					}).replace(/\r?\n|\r/g, "")
				);

				return hash;
			} catch (e) {
				return "unknown";
			}
		})(),
	},
	bundle: true,
	treeShaking: true,
	logLevel: "info",
	outdir: "dist/",
});