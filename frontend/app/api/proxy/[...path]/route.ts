import { NextRequest, NextResponse } from "next/server";

const DEFAULT_API_HOST = "http://localhost:8000/api";

function resolveApiHost(): string {
  return process.env.APP_SERVICE_HOST ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_HOST;
}

async function forwardRequest(
  request: NextRequest,
  context: { params: { path: string[] } },
): Promise<NextResponse> {
  const upstream = new URL(`${resolveApiHost()}/${context.params.path.join("/")}`);
  upstream.search = request.nextUrl.search;

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