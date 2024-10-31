/*global Infrared*/
self.__ir$config = {
	prefix: "/service/",
	encodeUrl: Infrared.codec.xor.encode,
	decodeUrl: Infrared.codec.xor.decode,
	handler: "/ir.handler.js",
	client: "/ir.client.js",
	bundle: "/ir.bundle.js",
	config: "/ir.config.js",
	sw: "/ir.sw.js",
};
