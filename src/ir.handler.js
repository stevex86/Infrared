/**
 * @type {import('../ir').InfraredCtor}
 */
const Infrared = self.Infrared;

/**
 * @type {import('../ir').IRClientCtor}
 */
const IRClient = self.IRClient;

/**
 * @type {import('../ir').IRConfig}
 */
const __ir$config = self.__ir$config;

/**
 * @type {string}
 */
const __ir$cookies = self.__ir$cookies;

if (typeof __ir$cookies !== "string")
	throw new TypeError("Unable to load global IR data");

if (!self.__ir) __irHook(self);

self.__irHook = __irHook;

/**
 *
 * @param {typeof globalThis} window
 * @returns
 */
function __irHook(window) {
	if ("__ir" in window && window.__ir instanceof Infrared) return false;

	if (window.document && !!window.window) {
		window.document
			.querySelectorAll("script[__ir-script]")
			.forEach((node) => node.remove());
	}

	const worker = !window.window;
	const master = "__ir";
	const methodPrefix = "__ir$";
	const __ir = new Infrared(__ir$config);

	/*if (typeof config.construct === 'function') {
        config.construct(__ir, worker ? 'worker' : 'window');
    }*/
	let bareClient;
	if (!worker) {
		// websockets
		bareClient = new Infrared.BareClient();
	} else {
		bareClient = new Infrared.BareClient(
			new Promise((resolve) => {
				addEventListener("message", ({ data }) => {
					if (typeof data !== "object") return;
					if ("__ir$type" in data && data.__ir$type === "baremuxinit") {
						resolve(data.port);
					}
				});
			})
		);
	}

	const client = new IRClient(window, bareClient, worker);
	const {
		HTMLMediaElement,
		HTMLScriptElement,
		HTMLAudioElement,
		HTMLVideoElement,
		HTMLInputElement,
		HTMLEmbedElement,
		HTMLTrackElement,
		HTMLAnchorElement,
		HTMLIFrameElement,
		HTMLAreaElement,
		HTMLLinkElement,
		HTMLBaseElement,
		HTMLFormElement,
		HTMLImageElement,
		HTMLSourceElement,
	} = window;

	client.nativeMethods.defineProperty(window, "__ir", {
		value: __ir,
		enumerable: false,
	});

	__ir.meta.origin = location.origin;
	__ir.location = client.location.emulate(
		(href) => {
			if (href === "about:srcdoc") return new URL(href);
			if (href.startsWith("blob:")) href = href.slice("blob:".length);
			return new URL(__ir.sourceUrl(href));
		},
		(href) => {
			return __ir.rewriteUrl(href);
		}
	);

	let cookieStr = __ir$cookies;

	__ir.meta.url = __ir.location;
	__ir.domain = __ir.meta.url.host;
	__ir.blobUrls = new window.Map();
	__ir.referrer = "";
	__ir.cookies = [];
	__ir.localStorageObj = {};
	__ir.sessionStorageObj = {};

	if (__ir.location.href === "about:srcdoc") {
		__ir.meta = window.parent.__ir.meta;
	}

	if (window.EventTarget) {
		__ir.addEventListener = window.EventTarget.prototype.addEventListener;
		__ir.removeListener = window.EventTarget.prototype.removeListener;
		__ir.dispatchEvent = window.EventTarget.prototype.dispatchEvent;
	}

	// Storage wrappers
	client.nativeMethods.defineProperty(
		client.storage.storeProto,
		"__ir$storageObj",
		{
			get() {
				if (this === client.storage.sessionStorage)
					return __ir.sessionStorageObj;
				if (this === client.storage.localStorage) return __ir.localStorageObj;
			},
			enumerable: false,
		}
	);

	if (window.localStorage) {
		for (const key in window.localStorage) {
			if (key.startsWith(methodPrefix + __ir.location.origin + "@")) {
				__ir.localStorageObj[
					key.slice((methodPrefix + __ir.location.origin + "@").length)
				] = window.localStorage.getItem(key);
			}
		}

		__ir.lsWrap = client.storage.emulate(
			client.storage.localStorage,
			__ir.localStorageObj
		);
	}

	if (window.sessionStorage) {
		for (const key in window.sessionStorage) {
			if (key.startsWith(methodPrefix + __ir.location.origin + "@")) {
				__ir.sessionStorageObj[
					key.slice((methodPrefix + __ir.location.origin + "@").length)
				] = window.sessionStorage.getItem(key);
			}
		}

		__ir.ssWrap = client.storage.emulate(
			client.storage.sessionStorage,
			__ir.sessionStorageObj
		);
	}

	let rawBase = window.document
		? client.node.baseURI.get.call(window.document)
		: window.location.href;
	let base = __ir.sourceUrl(rawBase);

	client.nativeMethods.defineProperty(__ir.meta, "base", {
		get() {
			if (!window.document) return __ir.meta.url.href;

			if (client.node.baseURI.get.call(window.document) !== rawBase) {
				rawBase = client.node.baseURI.get.call(window.document);
				base = __ir.sourceUrl(rawBase);
			}

			return base;
		},
	});

	__ir.methods = {
		setSource: methodPrefix + "setSource",
		source: methodPrefix + "source",
		location: methodPrefix + "location",
		function: methodPrefix + "function",
		string: methodPrefix + "string",
		eval: methodPrefix + "eval",
		parent: methodPrefix + "parent",
		top: methodPrefix + "top",
	};

	__ir.filterKeys = [
		master,
		__ir.methods.setSource,
		__ir.methods.source,
		__ir.methods.location,
		__ir.methods.function,
		__ir.methods.string,
		__ir.methods.eval,
		__ir.methods.parent,
		__ir.methods.top,
		methodPrefix + "protocol",
		methodPrefix + "storageObj",
		methodPrefix + "url",
		methodPrefix + "modifiedStyle",
		methodPrefix + "config",
		methodPrefix + "dispatched",
		"Infrared",
		"__irHook",
	];

	client.on("wrap", (target, wrapped) => {
		client.nativeMethods.defineProperty(
			wrapped,
			"name",
			client.nativeMethods.getOwnPropertyDescriptor(target, "name")
		);
		client.nativeMethods.defineProperty(
			wrapped,
			"length",
			client.nativeMethods.getOwnPropertyDescriptor(target, "length")
		);

		client.nativeMethods.defineProperty(wrapped, __ir.methods.string, {
			enumerable: false,
			value: client.nativeMethods.fnToString.call(target),
		});

		client.nativeMethods.defineProperty(wrapped, __ir.methods.function, {
			enumerable: false,
			value: target,
		});
	});

	client.fetch.on("request", (event) => {
		event.data.input = __ir.rewriteUrl(event.data.input);
	});

	client.fetch.on("requestUrl", (event) => {
		event.data.value = __ir.sourceUrl(event.data.value);
	});

	client.fetch.on("responseUrl", (event) => {
		event.data.value = __ir.sourceUrl(event.data.value);
	});

	// XMLHttpRequest
	client.xhr.on("open", (event) => {
		event.data.input = __ir.rewriteUrl(event.data.input);
	});

	client.xhr.on("responseUrl", (event) => {
		event.data.value = __ir.sourceUrl(event.data.value);
	});

	// Workers
	client.workers.on("worker", (event) => {
		event.data.url = __ir.rewriteUrl(event.data.url);
	});

	client.workers.on("addModule", (event) => {
		event.data.url = __ir.rewriteUrl(event.data.url);
	});

	client.workers.on("importScripts", (event) => {
		for (const i in event.data.scripts) {
			event.data.scripts[i] = __ir.rewriteUrl(event.data.scripts[i]);
		}
	});

	client.workers.on("postMessage", (event) => {
		let to = event.data.origin;

		event.data.origin = "*";
		event.data.message = {
			__data: event.data.message,
			__origin: __ir.meta.url.origin,
			__to: to,
		};
	});

	// Navigator
	client.navigator.on("sendBeacon", (event) => {
		event.data.url = __ir.rewriteUrl(event.data.url);
	});

	// Cookies
	client.document.on("getCookie", (event) => {
		event.data.value = cookieStr;
	});

	client.document.on("setCookie", (event) => {
		__ir.cookie.db().then((db) => {
			__ir.cookie.setCookies(event.data.value, db, __ir.meta);

			__ir.cookie.getCookies(db).then((cookies) => {
				cookieStr = __ir.cookie.serialize(cookies, __ir.meta, true);
			});
		});

		const cookie = __ir.cookie.setCookie(event.data.value)[0];

		if (!cookie.path) cookie.path = "/";
		if (!cookie.domain) cookie.domain = __ir.meta.url.hostname;

		if (__ir.cookie.validateCookie(cookie, __ir.meta, true)) {
			if (cookieStr.length) cookieStr += "; ";
			cookieStr += `${cookie.name}=${cookie.value}`;
		}

		event.respondWith(event.data.value);
	});

	// HTML
	client.element.on("setInnerHTML", (event) => {
		switch (event.that.tagName) {
			case "SCRIPT":
				event.data.value = __ir.js.rewrite(event.data.value);
				break;
			case "STYLE":
				event.data.value = __ir.rewriteCSS(event.data.value);
				break;
			default:
				event.data.value = __ir.rewriteHtml(event.data.value);
		}
	});

	client.element.on("getInnerHTML", (event) => {
		switch (event.that.tagName) {
			case "SCRIPT":
				event.data.value = __ir.js.source(event.data.value);
				break;
			default:
				event.data.value = __ir.sourceHtml(event.data.value);
		}
	});

	client.element.on("setOuterHTML", (event) => {
		event.data.value = __ir.rewriteHtml(event.data.value, {
			document: event.that.tagName === "HTML",
		});
	});

	client.element.on("getOuterHTML", (event) => {
		switch (event.that.tagName) {
			case "HEAD":
				event.data.value = __ir
					.sourceHtml(
						event.data.value.replace(
							/<head(.*)>(.*)<\/head>/s,
							"<op-head$1>$2</op-head>"
						)
					)
					.replace(/<op-head(.*)>(.*)<\/op-head>/s, "<head$1>$2</head>");
				break;
			case "BODY":
				event.data.value = __ir
					.sourceHtml(
						event.data.value.replace(
							/<body(.*)>(.*)<\/body>/s,
							"<op-body$1>$2</op-body>"
						)
					)
					.replace(/<op-body(.*)>(.*)<\/op-body>/s, "<body$1>$2</body>");
				break;
			default:
				event.data.value = __ir.sourceHtml(event.data.value, {
					document: event.that.tagName === "HTML",
				});
				break;
		}

		//event.data.value = __ir.sourceHtml(event.data.value, { document: event.that.tagName === 'HTML' });
	});

	client.document.on("write", (event) => {
		if (!event.data.html.length) return false;
		event.data.html = [__ir.rewriteHtml(event.data.html.join(""))];
	});

	client.document.on("writeln", (event) => {
		if (!event.data.html.length) return false;
		event.data.html = [__ir.rewriteHtml(event.data.html.join(""))];
	});

	client.element.on("insertAdjacentHTML", (event) => {
		event.data.html = __ir.rewriteHtml(event.data.html);
	});

	// EventSource

	client.eventSource.on("construct", (event) => {
		event.data.url = __ir.rewriteUrl(event.data.url);
	});

	client.eventSource.on("url", (event) => {
		event.data.url = __ir.rewriteUrl(event.data.url);
	});

	// IDB
	client.idb.on("idbFactoryOpen", (event) => {
		// Don't modify the Infrared cookie database
		if (event.data.name === "__op") return;
		event.data.name = `${__ir.meta.url.origin}@${event.data.name}`;
	});

	client.idb.on("idbFactoryName", (event) => {
		event.data.value = event.data.value.slice(
			__ir.meta.url.origin.length + 1 /*the @*/
		);
	});

	// History
	client.history.on("replaceState", (event) => {
		if (event.data.url)
			event.data.url = __ir.rewriteUrl(
				event.data.url,
				"__ir" in event.that ? event.that.__ir.meta : __ir.meta
			);
	});
	client.history.on("pushState", (event) => {
		if (event.data.url)
			event.data.url = __ir.rewriteUrl(
				event.data.url,
				"__ir" in event.that ? event.that.__ir.meta : __ir.meta
			);
	});

	// Element get set attribute methods
	client.element.on("getAttribute", (event) => {
		if (
			client.element.hasAttribute.call(
				event.that,
				__ir.attributePrefix + "-attr-" + event.data.name
			)
		) {
			event.respondWith(
				event.target.call(
					event.that,
					__ir.attributePrefix + "-attr-" + event.data.name
				)
			);
		}
	});

	// Message
	client.message.on("postMessage", (event) => {
		let to = event.data.origin;
		let call = __ir.call;

		if (event.that) {
			call = event.that.__ir$source.call;
		}

		event.data.origin = "*";
		event.data.message = {
			__data: event.data.message,
			__origin: (event.that || event.target).__ir$source.location.origin,
			__to: to,
		};

		event.respondWith(
			worker
				? call(
						event.target,
						[event.data.message, event.data.transfer],
						event.that
					)
				: call(
						event.target,
						[event.data.message, event.data.origin, event.data.transfer],
						event.that
					)
		);
	});

	client.message.on("data", (event) => {
		const { value: data } = event.data;
		if (typeof data === "object" && "__data" in data && "__origin" in data) {
			event.respondWith(data.__data);
		}
	});

	client.message.on("origin", (event) => {
		const data = client.message.messageData.get.call(event.that);
		if (typeof data === "object" && data.__data && data.__origin) {
			event.respondWith(data.__origin);
		}
	});

	client.overrideDescriptor(window, "origin", {
		get: () => {
			return __ir.location.origin;
		},
	});

	client.node.on("baseURI", (event) => {
		if (event.data.value.startsWith(window.location.origin))
			event.data.value = __ir.sourceUrl(event.data.value);
	});

	client.element.on("setAttribute", (event) => {
		if (
			event.that instanceof HTMLMediaElement &&
			event.data.name === "src" &&
			event.data.value.startsWith("blob:")
		) {
			event.target.call(
				event.that,
				__ir.attributePrefix + "-attr-" + event.data.name,
				event.data.value
			);
			event.data.value = __ir.blobUrls.get(event.data.value);
			return;
		}

		if (__ir.attrs.isUrl(event.data.name)) {
			event.target.call(
				event.that,
				__ir.attributePrefix + "-attr-" + event.data.name,
				event.data.value
			);
			event.data.value = __ir.rewriteUrl(event.data.value);
		}

		if (__ir.attrs.isStyle(event.data.name)) {
			event.target.call(
				event.that,
				__ir.attributePrefix + "-attr-" + event.data.name,
				event.data.value
			);
			event.data.value = __ir.rewriteCSS(event.data.value, {
				context: "declarationList",
			});
		}

		if (__ir.attrs.isHtml(event.data.name)) {
			event.target.call(
				event.that,
				__ir.attributePrefix + "-attr-" + event.data.name,
				event.data.value
			);
			event.data.value = __ir.rewriteHtml(event.data.value, {
				...__ir.meta,
				document: true,
				injectHead: __ir.createHtmlInject(
					__ir.handlerScript,
					__ir.bundleScript,
					__ir.clientScript,
					__ir.configScript,
					cookieStr,
					window.location.href
				),
			});
		}

		if (__ir.attrs.isSrcset(event.data.name)) {
			event.target.call(
				event.that,
				__ir.attributePrefix + "-attr-" + event.data.name,
				event.data.value
			);
			event.data.value = __ir.html.wrapSrcset(event.data.value.toString());
		}

		if (__ir.attrs.isForbidden(event.data.name)) {
			event.data.name = __ir.attributePrefix + "-attr-" + event.data.name;
		}
	});

	client.element.on("audio", (event) => {
		event.data.url = __ir.rewriteUrl(event.data.url);
	});

	// Element Property Attributes
	client.element.hookProperty(
		[HTMLAnchorElement, HTMLAreaElement, HTMLLinkElement, HTMLBaseElement],
		"href",
		{
			get: (target, that) => {
				return __ir.sourceUrl(target.call(that));
			},
			set: (target, that, [val]) => {
				client.element.setAttribute.call(
					that,
					__ir.attributePrefix + "-attr-href",
					val
				);
				target.call(that, __ir.rewriteUrl(val));
			},
		}
	);

	client.element.hookProperty(
		[
			HTMLScriptElement,
			HTMLAudioElement,
			HTMLVideoElement,
			HTMLMediaElement,
			HTMLImageElement,
			HTMLInputElement,
			HTMLEmbedElement,
			HTMLIFrameElement,
			HTMLTrackElement,
			HTMLSourceElement,
		],
		"src",
		{
			get: (target, that) => {
				return __ir.sourceUrl(target.call(that));
			},
			set: (target, that, [val]) => {
				if (
					new String(val).toString().trim().startsWith("blob:") &&
					that instanceof HTMLMediaElement
				) {
					client.element.setAttribute.call(
						that,
						__ir.attributePrefix + "-attr-src",
						val
					);
					return target.call(that, __ir.blobUrls.get(val) || val);
				}

				client.element.setAttribute.call(
					that,
					__ir.attributePrefix + "-attr-src",
					val
				);
				target.call(that, __ir.rewriteUrl(val));
			},
		}
	);

	client.element.hookProperty([HTMLFormElement], "action", {
		get: (target, that) => {
			return __ir.sourceUrl(target.call(that));
		},
		set: (target, that, [val]) => {
			client.element.setAttribute.call(
				that,
				__ir.attributePrefix + "-attr-action",
				val
			);
			target.call(that, __ir.rewriteUrl(val));
		},
	});

	client.element.hookProperty([HTMLImageElement], "srcset", {
		get: (target, that) => {
			return (
				client.element.getAttribute.call(
					that,
					__ir.attributePrefix + "-attr-srcset"
				) || target.call(that)
			);
		},
		set: (target, that, [val]) => {
			client.element.setAttribute.call(
				that,
				__ir.attributePrefix + "-attr-srcset",
				val
			);
			target.call(that, __ir.html.wrapSrcset(val.toString()));
		},
	});

	client.element.hookProperty(HTMLScriptElement, "integrity", {
		get: (target, that) => {
			return client.element.getAttribute.call(
				that,
				__ir.attributePrefix + "-attr-integrity"
			);
		},
		set: (target, that, [val]) => {
			client.element.setAttribute.call(
				that,
				__ir.attributePrefix + "-attr-integrity",
				val
			);
		},
	});

	client.element.hookProperty(HTMLIFrameElement, "sandbox", {
		get: (target, that) => {
			return (
				client.element.getAttribute.call(
					that,
					__ir.attributePrefix + "-attr-sandbox"
				) || target.call(that)
			);
		},
		set: (target, that, [val]) => {
			client.element.setAttribute.call(
				that,
				__ir.attributePrefix + "-attr-sandbox",
				val
			);
		},
	});

	// HTMLIFrameElement may not be defined (workers)
	const contentWindowGet =
		HTMLIFrameElement &&
		Object.getOwnPropertyDescriptor(
			HTMLIFrameElement.prototype,
			"contentWindow"
		).get;

	function irInject(that) {
		const win = contentWindowGet.call(that);

		if (!win.__ir)
			try {
				__irHook(win);
			} catch (e) {
				console.error("catastrophic failure");
				console.error(e);
			}
	}

	client.element.hookProperty(HTMLIFrameElement, "contentWindow", {
		get: (target, that) => {
			irInject(that);
			return target.call(that);
		},
	});

	client.element.hookProperty(HTMLIFrameElement, "contentDocument", {
		get: (target, that) => {
			irInject(that);
			return target.call(that);
		},
	});

	client.element.hookProperty(HTMLIFrameElement, "srcdoc", {
		get: (target, that) => {
			return (
				client.element.getAttribute.call(
					that,
					__ir.attributePrefix + "-attr-srcdoc"
				) || target.call(that)
			);
		},
		set: (target, that, [val]) => {
			target.call(
				that,
				__ir.rewriteHtml(val, {
					document: true,
					injectHead: __ir.createHtmlInject(
						__ir.handlerScript,
						__ir.bundleScript,
						__ir.clientScript,
						__ir.configScript,
						cookieStr,
						window.location.href
					),
				})
			);
		},
	});

	client.node.on("getTextContent", (event) => {
		if (event.that.tagName === "SCRIPT") {
			event.data.value = __ir.js.source(event.data.value);
		}
	});

	client.node.on("setTextContent", (event) => {
		if (event.that.tagName === "SCRIPT") {
			event.data.value = __ir.js.rewrite(event.data.value);
		}
	});

	// Until proper rewriting is implemented for service workers.
	// Not sure atm how to implement it with the already built in service worker
	if ("serviceWorker" in window.navigator) {
		delete window.Navigator.prototype.serviceWorker;
	}

	// Document
	client.document.on("getDomain", (event) => {
		event.data.value = __ir.domain;
	});
	client.document.on("setDomain", (event) => {
		if (
			!event.data.value
				.toString()
				.endsWith(__ir.meta.url.hostname.split(".").slice(-2).join("."))
		)
			return event.respondWith("");
		event.respondWith((__ir.domain = event.data.value));
	});

	client.document.on("url", (event) => {
		event.data.value = __ir.location.href;
	});

	client.document.on("documentURI", (event) => {
		event.data.value = __ir.location.href;
	});

	client.document.on("referrer", (event) => {
		event.data.value = __ir.referrer || __ir.sourceUrl(event.data.value);
	});

	client.document.on("parseFromString", (event) => {
		if (event.data.type !== "text/html") return false;
		event.data.string = __ir.rewriteHtml(event.data.string, {
			...__ir.meta,
			document: true,
		});
	});

	// Attribute (node.attributes)
	client.attribute.on("getValue", (event) => {
		if (
			client.element.hasAttribute.call(
				event.that.ownerElement,
				__ir.attributePrefix + "-attr-" + event.data.name
			)
		) {
			event.data.value = client.element.getAttribute.call(
				event.that.ownerElement,
				__ir.attributePrefix + "-attr-" + event.data.name
			);
		}
	});

	client.attribute.on("setValue", (event) => {
		if (__ir.attrs.isUrl(event.data.name)) {
			client.element.setAttribute.call(
				event.that.ownerElement,
				__ir.attributePrefix + "-attr-" + event.data.name,
				event.data.value
			);
			event.data.value = __ir.rewriteUrl(event.data.value);
		}

		if (__ir.attrs.isStyle(event.data.name)) {
			client.element.setAttribute.call(
				event.that.ownerElement,
				__ir.attributePrefix + "-attr-" + event.data.name,
				event.data.value
			);
			event.data.value = __ir.rewriteCSS(event.data.value, {
				context: "declarationList",
			});
		}

		if (__ir.attrs.isHtml(event.data.name)) {
			client.element.setAttribute.call(
				event.that.ownerElement,
				__ir.attributePrefix + "-attr-" + event.data.name,
				event.data.value
			);
			event.data.value = __ir.rewriteHtml(event.data.value, {
				...__ir.meta,
				document: true,
				injectHead: __ir.createHtmlInject(
					__ir.handlerScript,
					__ir.bundleScript,
					__ir.clientScript,
					__ir.configScript,
					cookieStr,
					window.location.href
				),
			});
		}

		if (__ir.attrs.isSrcset(event.data.name)) {
			client.element.setAttribute.call(
				event.that.ownerElement,
				__ir.attributePrefix + "-attr-" + event.data.name,
				event.data.value
			);
			event.data.value = __ir.html.wrapSrcset(event.data.value.toString());
		}
	});

	// URL
	client.url.on("createObjectURL", (event) => {
		let url = event.target.call(event.that, event.data.object);
		if (url.startsWith("blob:" + location.origin)) {
			let newUrl =
				"blob:" +
				(__ir.meta.url.href !== "about:blank"
					? __ir.meta.url.origin
					: window.parent.__ir.meta.url.origin) +
				url.slice("blob:".length + location.origin.length);
			__ir.blobUrls.set(newUrl, url);
			event.respondWith(newUrl);
		} else {
			event.respondWith(url);
		}
	});

	client.url.on("revokeObjectURL", (event) => {
		if (__ir.blobUrls.has(event.data.url)) {
			const old = event.data.url;
			event.data.url = __ir.blobUrls.get(event.data.url);
			__ir.blobUrls.delete(old);
		}
	});

	client.storage.on("get", (event) => {
		event.data.name =
			methodPrefix + __ir.meta.url.origin + "@" + event.data.name;
	});

	client.storage.on("set", (event) => {
		if (event.that.__ir$storageObj) {
			event.that.__ir$storageObj[event.data.name] = event.data.value;
		}
		event.data.name =
			methodPrefix + __ir.meta.url.origin + "@" + event.data.name;
	});

	client.storage.on("delete", (event) => {
		if (event.that.__ir$storageObj) {
			delete event.that.__ir$storageObj[event.data.name];
		}
		event.data.name =
			methodPrefix + __ir.meta.url.origin + "@" + event.data.name;
	});

	client.storage.on("getItem", (event) => {
		event.data.name =
			methodPrefix + __ir.meta.url.origin + "@" + event.data.name;
	});

	client.storage.on("setItem", (event) => {
		if (event.that.__ir$storageObj) {
			event.that.__ir$storageObj[event.data.name] = event.data.value;
		}
		event.data.name =
			methodPrefix + __ir.meta.url.origin + "@" + event.data.name;
	});

	client.storage.on("removeItem", (event) => {
		if (event.that.__ir$storageObj) {
			delete event.that.__ir$storageObj[event.data.name];
		}
		event.data.name =
			methodPrefix + __ir.meta.url.origin + "@" + event.data.name;
	});

	client.storage.on("clear", (event) => {
		if (event.that.__ir$storageObj) {
			for (const key of client.nativeMethods.keys.call(
				null,
				event.that.__ir$storageObj
			)) {
				delete event.that.__ir$storageObj[key];
				client.storage.removeItem.call(
					event.that,
					methodPrefix + __ir.meta.url.origin + "@" + key
				);
				event.respondWith();
			}
		}
	});

	client.storage.on("length", (event) => {
		if (event.that.__ir$storageObj) {
			event.respondWith(
				client.nativeMethods.keys.call(null, event.that.__ir$storageObj).length
			);
		}
	});

	client.storage.on("key", (event) => {
		if (event.that.__ir$storageObj) {
			event.respondWith(
				client.nativeMethods.keys.call(null, event.that.__ir$storageObj)[
					event.data.index
				] || null
			);
		}
	});

	client.function.on("function", (event) => {
		event.data.script = __ir.rewriteJS(event.data.script);
	});

	client.function.on("toString", (event) => {
		if (__ir.methods.string in event.that)
			event.respondWith(event.that[__ir.methods.string]);
	});

	client.object.on("getOwnPropertyNames", (event) => {
		event.data.names = event.data.names.filter(
			(element) => !__ir.filterKeys.includes(element)
		);
	});

	client.object.on("getOwnPropertyDescriptors", (event) => {
		for (const forbidden of __ir.filterKeys) {
			delete event.data.descriptors[forbidden];
		}
	});

	client.style.on("setProperty", (event) => {
		if (client.style.dashedUrlProps.includes(event.data.property)) {
			event.data.value = __ir.rewriteCSS(event.data.value, {
				context: "value",
				...__ir.meta,
			});
		}
	});

	client.style.on("getPropertyValue", (event) => {
		if (client.style.dashedUrlProps.includes(event.data.property)) {
			event.respondWith(
				__ir.sourceCSS(event.target.call(event.that, event.data.property), {
					context: "value",
					...__ir.meta,
				})
			);
		}
	});

	if ("CSS2Properties" in window) {
		for (const key of client.style.urlProps) {
			client.overrideDescriptor(window.CSS2Properties.prototype, key, {
				get: (target, that) => {
					return __ir.sourceCSS(target.call(that), {
						context: "value",
						...__ir.meta,
					});
				},
				set: (target, that, val) => {
					target.call(
						that,
						__ir.rewriteCSS(val, {
							context: "value",
							...__ir.meta,
						})
					);
				},
			});
		}
	} else if ("HTMLElement" in window) {
		client.overrideDescriptor(window.HTMLElement.prototype, "style", {
			get: (target, that) => {
				const value = target.call(that);
				if (!value[methodPrefix + "modifiedStyle"]) {
					for (const key of client.style.urlProps) {
						client.nativeMethods.defineProperty(value, key, {
							enumerable: true,
							configurable: true,
							get() {
								const value =
									client.style.getPropertyValue.call(this, key) || "";
								return __ir.sourceCSS(value, {
									context: "value",
									...__ir.meta,
								});
							},
							set(val) {
								client.style.setProperty.call(
									this,
									client.style.propToDashed[key] || key,
									__ir.rewriteCSS(val, {
										context: "value",
										...__ir.meta,
									})
								);
							},
						});
						client.nativeMethods.defineProperty(
							value,
							methodPrefix + "modifiedStyle",
							{
								enumerable: false,
								value: true,
							}
						);
					}
				}
				return value;
			},
		});
	}

	client.style.on("setCssText", (event) => {
		event.data.value = __ir.rewriteCSS(event.data.value, {
			context: "declarationList",
			...__ir.meta,
		});
	});

	client.style.on("getCssText", (event) => {
		event.data.value = __ir.sourceCSS(event.data.value, {
			context: "declarationList",
			...__ir.meta,
		});
	});

	// Proper hash emulation.
	__ir.addEventListener.call(window, "hashchange", (event) => {
		if (event.__ir$dispatched) return false;
		event.stopImmediatePropagation();
		const hash = window.location.hash;
		client.history.replaceState.call(window.history, "", "", event.oldURL);
		__ir.location.hash = hash;
	});

	client.location.on("hashchange", (oldUrl, newUrl, ctx) => {
		if (ctx.HashChangeEvent && client.history.replaceState) {
			client.history.replaceState.call(
				window.history,
				"",
				"",
				__ir.rewriteUrl(newUrl)
			);

			const event = new ctx.HashChangeEvent("hashchange", {
				newURL: newUrl,
				oldURL: oldUrl,
			});

			client.nativeMethods.defineProperty(event, methodPrefix + "dispatched", {
				value: true,
				enumerable: false,
			});

			__ir.dispatchEvent.call(window, event);
		}
	});

	// Hooking functions & descriptors
	client.fetch.overrideRequest();
	client.fetch.overrideUrl();
	client.xhr.overrideOpen();
	client.xhr.overrideResponseUrl();
	client.element.overrideHtml();
	client.element.overrideAttribute();
	client.element.overrideInsertAdjacentHTML();
	client.element.overrideAudio();
	// client.element.overrideQuerySelector();
	client.node.overrideBaseURI();
	client.node.overrideTextContent();
	client.attribute.overrideNameValue();
	client.document.overrideDomain();
	client.document.overrideURL();
	client.document.overrideDocumentURI();
	client.document.overrideWrite();
	client.document.overrideReferrer();
	client.document.overrideParseFromString();
	client.storage.overrideMethods();
	client.storage.overrideLength();
	//client.document.overrideQuerySelector();
	client.object.overrideGetPropertyNames();
	client.object.overrideGetOwnPropertyDescriptors();
	client.idb.overrideName();
	client.idb.overrideOpen();
	client.history.overridePushState();
	client.history.overrideReplaceState();
	client.eventSource.overrideConstruct();
	client.eventSource.overrideUrl();
	client.websocket.overrideWebSocket(bareClient);
	client.url.overrideObjectURL();
	client.document.overrideCookie();
	client.message.overridePostMessage();
	client.message.overrideMessageOrigin();
	client.message.overrideMessageData();
	client.workers.overrideWorker();
	client.workers.overrideAddModule();
	client.workers.overrideImportScripts();
	client.workers.overridePostMessage();
	client.style.overrideSetGetProperty();
	client.style.overrideCssText();
	client.navigator.overrideSendBeacon();
	client.function.overrideFunction();
	client.function.overrideToString();
	client.location.overrideWorkerLocation((href) => {
		return new URL(__ir.sourceUrl(href));
	});

	client.overrideDescriptor(window, "localStorage", {
		get: (target, that) => {
			return (that || window).__ir.lsWrap;
		},
	});
	client.overrideDescriptor(window, "sessionStorage", {
		get: (target, that) => {
			return (that || window).__ir.ssWrap;
		},
	});

	client.override(window, "open", (target, that, args) => {
		if (!args.length) return target.apply(that, args);
		let [url] = args;

		url = __ir.rewriteUrl(url);

		return target.call(that, url);
	});

	__ir.$wrap = function (name) {
		if (name === "location") return __ir.methods.location;
		if (name === "eval") return __ir.methods.eval;
		return name;
	};

	__ir.$get = function (that) {
		if (that === window.location) return __ir.location;
		if (that === window.eval) return __ir.eval;
		if (that === window.parent) {
			return window.__ir$parent;
		}
		if (that === window.top) {
			return window.__ir$top;
		}
		return that;
	};

	__ir.eval = client.wrap(window, "eval", (target, that, args) => {
		if (!args.length || typeof args[0] !== "string")
			return target.apply(that, args);
		let [script] = args;

		script = __ir.rewriteJS(script);
		return target.call(that, script);
	});

	__ir.call = function (target, args, that) {
		return that ? target.apply(that, args) : target(...args);
	};

	__ir.call$ = function (obj, prop, args = []) {
		return obj[prop].apply(obj, args);
	};

	client.nativeMethods.defineProperty(window.Object.prototype, master, {
		get: () => {
			return __ir;
		},
		enumerable: false,
	});

	client.nativeMethods.defineProperty(
		window.Object.prototype,
		__ir.methods.setSource,
		{
			value: function (source) {
				if (!client.nativeMethods.isExtensible(this)) return this;

				client.nativeMethods.defineProperty(this, __ir.methods.source, {
					value: source,
					writable: true,
					enumerable: false,
				});

				return this;
			},
			enumerable: false,
		}
	);

	client.nativeMethods.defineProperty(
		window.Object.prototype,
		__ir.methods.source,
		{
			value: __ir,
			writable: true,
			enumerable: false,
		}
	);

	client.nativeMethods.defineProperty(
		window.Object.prototype,
		__ir.methods.location,
		{
			configurable: true,
			get() {
				return this === window.document || this === window
					? __ir.location
					: this.location;
			},
			set(val) {
				if (this === window.document || this === window) {
					__ir.location.href = val;
				} else {
					this.location = val;
				}
			},
		}
	);

	client.nativeMethods.defineProperty(
		window.Object.prototype,
		__ir.methods.parent,
		{
			configurable: true,
			get() {
				const val = this.parent;

				if (this === window) {
					try {
						return "__ir" in val ? val : this;
					} catch (e) {
						return this;
					}
				}
				return val;
			},
			set(val) {
				this.parent = val;
			},
		}
	);

	client.nativeMethods.defineProperty(
		window.Object.prototype,
		__ir.methods.top,
		{
			configurable: true,
			get() {
				const val = this.top;

				if (this === window) {
					if (val === this.parent) return this[__ir.methods.parent];
					try {
						if (!("__ir" in val)) {
							let current = this;

							while (current.parent !== val) {
								current = current.parent;
							}

							return "__ir" in current ? current : this;
						} else {
							return val;
						}
					} catch (e) {
						return this;
					}
				}
				return val;
			},
			set(val) {
				this.top = val;
			},
		}
	);

	client.nativeMethods.defineProperty(
		window.Object.prototype,
		__ir.methods.eval,
		{
			configurable: true,
			get() {
				return this === window ? __ir.eval : this.eval;
			},
			set(val) {
				this.eval = val;
			},
		}
	);
}
