import { httpAction } from "./_generated/server";

declare const process: { env: Record<string, string | undefined> };

/**
 * HTTP proxy for AI requests from the iOS app.
 * Keeps the Anthropic API key server-side instead of embedded in the binary.
 *
 * Auth: Bearer token = IOS_API_SECRET env var (shared secret).
 * This is a stepping stone — will migrate to proper Convex auth when iOS integrates it.
 */

function validateApiSecret(request: Request): void {
	const authHeader = request.headers.get("Authorization");
	const expectedSecret = process.env.IOS_API_SECRET;

	if (!expectedSecret) {
		throw new Error("IOS_API_SECRET not configured");
	}

	if (
		!authHeader ||
		!authHeader.startsWith("Bearer ") ||
		authHeader.slice(7) !== expectedSecret
	) {
		throw new Error("Unauthorized");
	}
}

export const chat = httpAction(async (_ctx, request) => {
	try {
		validateApiSecret(request);
	} catch {
		return new Response(JSON.stringify({ error: "Unauthorized" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	const body = await request.json();

	// Validate required fields
	if (!body.messages || !Array.isArray(body.messages)) {
		return new Response(
			JSON.stringify({ error: "messages array required" }),
			{
				status: 400,
				headers: { "Content-Type": "application/json" },
			},
		);
	}

	// Enforce token limits — never let client request more than 2000
	const maxTokens = Math.min(body.max_tokens || 1500, 2000);

	const anthropicKey = process.env.ANTHROPIC_API_KEY;
	if (!anthropicKey) {
		return new Response(
			JSON.stringify({ error: "AI service not configured" }),
			{
				status: 503,
				headers: { "Content-Type": "application/json" },
			},
		);
	}

	const isStreaming = body.stream === true;

	const anthropicResponse = await fetch(
		"https://api.anthropic.com/v1/messages",
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-api-key": anthropicKey,
				"anthropic-version": "2023-06-01",
			},
			body: JSON.stringify({
				model: body.model || "claude-sonnet-4-20250514",
				max_tokens: maxTokens,
				system: body.system || "",
				messages: body.messages,
				stream: isStreaming,
			}),
		},
	);

	if (!anthropicResponse.ok) {
		const status = anthropicResponse.status;
		console.error(`Anthropic API error: ${status}`);
		return new Response(
			JSON.stringify({ error: "AI service error", details: status }),
			{
				status: 502,
				headers: { "Content-Type": "application/json" },
			},
		);
	}

	if (isStreaming) {
		// Forward the SSE stream directly to the client
		return new Response(anthropicResponse.body, {
			headers: {
				"Content-Type": "text/event-stream",
				"Cache-Control": "no-cache",
				Connection: "keep-alive",
			},
		});
	}

	const data = await anthropicResponse.json();
	return new Response(JSON.stringify(data), {
		headers: { "Content-Type": "application/json" },
	});
});
