# v3.2.10

- This version of Infrared fixes an NPM versioning error.

# v3.2.9

- This version of Infrared fixes an oversight in the css rewriter.

# v3.2.8

- This version of Infrared updates the base64 codec to be more stable.
- This version of Infrared updates the websocket wrapper to make it more stable.
- This version of Infrared updates the css rewriter, fixing some known bugs and issues.
- This version of Infrared upgrades [bare-mux](https://www.npmjs.com/package/@mercuryworkshop/bare-mux). This update has various bug fixes involving requests.

# v3.2.7

- This version of Infrared updates the XOR and Base64 codecs to be more efficient and fast by removing unneccesary code.
- This version of Infrared upgrades [bare-mux](https://www.npmjs.com/package/@mercuryworkshop/bare-mux). This update allows remote transports to be set (transports that run in the window).

# v3.2.6

- This version of Infrared fixes an issue with the `Content-Type` header not being rewritten properly.
- This version of Infrared injects HTML at the top of the head/body to avoid race conditions.

# v3.2.5

- This version of Infrared adds HTML injection through the config.
- This version of Infrared upgrades [bare-mux](https://www.npmjs.com/package/@mercuryworkshop/bare-mux). This update allows transferrables to be sent while setting the transport.

# v3.2.4

- This version of Infrared fixes an issue with headers not being rewritten properly.

# v3.2.3

- This version of Infrared improves performance and reduced bundle size by removing `css-tree`, `esotope-hammerhead`, and `mime-db`.
- This version of Infrared upgrades [bare-mux](https://www.npmjs.com/package/@mercuryworkshop/bare-mux). This fixes issues with support in safari.

# v3.2.2

- This version of Infrared fixes a bug where scripts were not being rewritten properly.

# v3.2.1

- This version of Infrared fixes a bug where network requests were not being correctly processed in worker contexts.

# v3.2.0

- This version of Infrared upgrades [bare-mux](https://www.npmjs.com/package/@mercuryworkshop/bare-mux). This moves all of the bare client logic to a shared worker.

# v3.1.5

- This version of Infrared upgrades [bare-mux](https://www.npmjs.com/package/@mercuryworkshop/bare-mux). This allows the websocket to be properly closed by windows.

# v3.1.4

- This version of Infrared fixes an NPM versioning error.

# v3.1.3

- This version of Infrared upgrades [bare-mux](https://www.npmjs.com/package/@mercuryworkshop/bare-mux). This solves an issue with the types and exports being incorrect.

# v3.1.2

- This version of Infrared cleans up some service worker code to make it faster, and also simplifies the service worker by adding `ir.route()` which allows the service worker to easily detect if the worker should route this request.

```js
importScripts("ir.bundle.js");
importScripts("ir.config.js");
importScripts(__ir$config.sw || "ir.sw.js");

const ir = new IRServiceWorker();

self.addEventListener("fetch", (event) => {
	event.respondWith(
		(async () => {
			if (ir.route(event)) {
				return await ir.fetch(event);
			}
			return await fetch(event.request);
		})()
	);
});
```

# v3.1.1

- This version of Infrared upgrades [bare-mux](https://www.npmjs.com/package/@mercuryworkshop/bare-mux). This solves an issue with the bare clients not being found.

# v3.1.0

- This version of Infrared upgrades [bare-mux](https://www.npmjs.com/package/@mercuryworkshop/bare-mux). This solves an issue with websockets not reporting the ready state correctly, causing incompatibilities on websites.

# v3.0.2

- This version of Infrared fixes an NPM versioning error.

# v3.0.1

- This version of Infrared upgrades [bare-mux](https://www.npmjs.com/package/@mercuryworkshop/bare-mux). This solves an issue with websockets not being opened properly.
- This version of Infrared allows error messages to be iframed on cross origin isolated pages.

# v3.0.0

- This version of Infrared has support for using [bare-mux](https://github.com/MercuryWorkshop/bare-mux) transports, allowing for use for other implementations like [EpoxyTransport](https://github.com/MercuryWorkshop/EpoxyTransport), [CurlTransport](https://github.com/MercuryWorkshop/CurlTransport), and the existing implementation [Bare-Client](https://github.com/MercuryWorkshop/Bare-as-module3).

# v2.0.0

- This version of Infrared has support for Bare server v3
- Support for older Bare servers was dropped.

# v1.0.10

- This version of Infrared fixes an NPM versioning error.

# v1.0.8

- This version of Infrared improves error messages.

# v1.0.7

- This version of Infrared correctly sets the `cache` option when making a request.

# v1.0.6

- This version of Infrared upgrades [@tomphttp/bare-client](https://www.npmjs.com/package/@tomphttp/bare-client). As a result, refreshing can fix errors with the Bare metadata being fetched.

# v1.0.5

- This version of Infrared fixes a minor bug with `blob:` URLs.

# v1.0.4

- This version of Infrared introduces support for passing a list of Bare servers in the `ir.config.js` file. This allows users to specify multiple servers that the service worker can choose from, improving reliability and failover.
- Minor bug fixes (caught with ESLint) and improvements.
- The [@tomphttp/bare-client](https://www.npmjs.com/package/@tomphttp/bare-client) package has been implemented, allowing users to use Infrared with Bare server V2 and older versions of the Bare server.
- In previous versions, the `ir.client.js` script was bundled with `ir.bundle.js`. In this version, `ir.client.js` is separate and needs to be included separately in any workflows that use it.

# v1.0.3

- In previous versions, the `irPath` export was the default export from the Infrared module. In this version, `irPath` is no longer the default export and needs to be imported explicitly.
- Here is an example of how to import the library:

```js
import { irPath } from "@titaniumnetwork-dev/ultraviolet";
```

# v1.0.2

- This version of Infrared is built using CommonJS, which means it can be used with CommonJS-based module systems such as Node.js.
- This version also includes a stock `sw.js` script that users can use as a starting point for their service worker.

# v1.0.1

- In the `sw.js` script, users must now import `ir.bundle.js` and `ir.config.js` in that order. This is because `ir.config.js` relies on `ir.bundle.js`, and the paths to these files cannot be hard-coded in the `sw.js` script.
- Minor bug fixes and improvements.
- Users must still use the `ir.config.js` file to specify the paths to all the Infrared scripts, including `ir.bundle.js` and `ir.config.js`.
- Here an example of the changes you might make to your `sw.js` script in this Infrared version:

```diff
+ importScripts('./ir/ir.bundle.js');
+ importScripts('./ir/ir.config.js');
importScripts('./ir/ir.sw.js');

const sw = new IRServiceWorker();

self.addEventListener('fetch', (event) => event.respondWith(sw.fetch(event)));
```

# v1.0.0

- This is the first official release of the Infrared library.
- The `ir.bundle.js` script is built using Webpack, allowing users to easily bundle their own scripts and dependencies with Infrared.
- This project is still under active development, and future releases will include new features and improvements.
