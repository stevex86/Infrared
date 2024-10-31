/*global IRServiceWorker,__ir$config*/
/*
 * Stock service worker script.
 * Users can provide their own sw.js if they need to extend the functionality of the service worker.
 * Ideally, this will be registered under the scope in ir.config.js so it will not need to be modified.
 * However, if a user changes the location of ir.bundle.js/ir.config.js or sw.js is not relative to them, they will need to modify this script locally.
 */
importScripts("ir.bundle.js");
importScripts("ir.config.js");
importScripts(__ir$config.sw || "ir.sw.js");

const ir = new IRServiceWorker();

async function handleRequest(event) {
	if (ir.route(event)) {
		return await ir.fetch(event);
	}

	return await fetch(event.request);
}

self.addEventListener("fetch", (event) => {
	event.respondWith(handleRequest(event));
});
