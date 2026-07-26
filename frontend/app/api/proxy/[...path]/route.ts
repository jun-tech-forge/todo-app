import { NextRequest, NextResponse } from "next/server";

const DEFAULT_API_HOST = "http://localhost:8000/api";

function resolveApiHost(): string {
  const backendSchema = process.env.BACKEND_SCHEMA ?? "http://";
  const backendFqdn = process.env.BACKEND_FQDN;
  const backendPort = process.env.BACKEND_PORT;

  if (backendFqdn && backendPort) {
    return `${backendSchema}${backendFqdn}:${backendPort}/api`;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("BACKEND_FQDN and BACKEND_PORT are required in production.");
  }

  return DEFAULT_API_HOST;
}

async function forwardRequest(
  request: NextRequest,
  context: { params: { path: string[] } },
): Promise<NextResponse> {
  const apiHost = resolveApiHost();
  const upstream = new URL(`${apiHost}/${context.params.path.join("/")}`);
  upstream.search = request.nextUrl.search;

  console.info("Proxying API request", {
    method: request.method,
    pathname: request.nextUrl.pathname,
    upstream: upstream.toString(),
  });

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  const cookie = request.headers.get("cookie");

  if (contentType) {
    headers.set("content-type", contentType);
  }
  if (cookie) {
    headers.set("cookie", cookie);
  }

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
    cache: "no-store",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.text();
  }

  const response = await fetch(upstream, init);
  const body = await response.text();
  const nextResponse = new NextResponse(body, {
    status: response.status,
  });

  const responseContentType = response.headers.get("content-type");
  const setCookie = response.headers.get("set-cookie");

  if (responseContentType) {
    nextResponse.headers.set("content-type", responseContentType);
  }
  if (setCookie) {
    nextResponse.headers.set("set-cookie", setCookie);
  }

  return nextResponse;
}

export async function GET(request: NextRequest, context: { params: { path: string[] } }) {
  return forwardRequest(request, context);
}

export async function POST(request: NextRequest, context: { params: { path: string[] } }) {
  return forwardRequest(request, context);
}

export async function PATCH(request: NextRequest, context: { params: { path: string[] } }) {
  return forwardRequest(request, context);
}

export async function PUT(request: NextRequest, context: { params: { path: string[] } }) {
  return forwardRequest(request, context);
}

export async function DELETE(request: NextRequest, context: { params: { path: string[] } }) {
  return forwardRequest(request, context);
}
