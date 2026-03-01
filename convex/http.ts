import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { chat } from "./aiProxy";

const http = httpRouter();
auth.addHttpRoutes(http);

// iOS AI proxy — routes client requests through Convex to keep API key server-side
http.route({
	path: "/api/ai/chat",
	method: "POST",
	handler: chat,
});

export default http;
