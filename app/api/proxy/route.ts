import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_SERVER_URL;

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const path = searchParams.get("path");

        if (!path) {
            return NextResponse.json({ error: "Path parameter is required" }, { status: 400 });
        }

        const forwardParams = new URLSearchParams();
        searchParams.forEach((value, key) => {
            if (key !== "path") {
                forwardParams.append(key, value);
            }
        });

        const targetUrl = `${BACKEND_URL}${path}${forwardParams.toString() ? `?${forwardParams.toString()}` : ""}`;

        const response = await fetch(targetUrl, {
            headers: {
                ...Object.fromEntries(request.headers),
                host: new URL(BACKEND_URL as string).host,
            },
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Proxy error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const path = searchParams.get("path");

        if (!path) {
            return NextResponse.json({ error: "Path parameter is required" }, { status: 400 });
        }

        const forwardParams = new URLSearchParams();
        searchParams.forEach((value, key) => {
            if (key !== "path") {
                forwardParams.append(key, value);
            }
        });

        const contentType = request.headers.get("content-type");
        let body;
        let headers: Record<string, string> = {
            ...Object.fromEntries(request.headers),
            host: new URL(BACKEND_URL as string).host,
        };

        if (contentType?.includes("application/json")) {
            body = JSON.stringify(await request.json());
        } else if (contentType?.includes("multipart/form-data")) {
            body = await request.formData();
            delete headers["content-type"];
            delete headers["content-length"];
        } else if (contentType?.includes("application/x-www-form-urlencoded")) {
            body = await request.formData();
            delete headers["content-type"];
            delete headers["content-length"];
        } else {
            body = await request.text();
        }

        const targetUrl = `${BACKEND_URL}${path}${forwardParams.toString() ? `?${forwardParams.toString()}` : ""}`;

        const response = await fetch(targetUrl, {
            method: "POST",
            headers,
            body,
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Proxy error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const path = searchParams.get("path");

        if (!path) {
            return NextResponse.json({ error: "Path parameter is required" }, { status: 400 });
        }

        const forwardParams = new URLSearchParams();
        searchParams.forEach((value, key) => {
            if (key !== "path") {
                forwardParams.append(key, value);
            }
        });

        const contentType = request.headers.get("content-type");
        let body;

        if (contentType?.includes("application/json")) {
            body = JSON.stringify(await request.json());
        } else if (contentType?.includes("multipart/form-data")) {
            body = await request.formData();
        } else if (contentType?.includes("application/x-www-form-urlencoded")) {
            body = await request.formData();
        } else {
            body = await request.text();
        }

        const targetUrl = `${BACKEND_URL}${path}${forwardParams.toString() ? `?${forwardParams.toString()}` : ""}`;

        const response = await fetch(targetUrl, {
            method: "PUT",
            headers: {
                ...Object.fromEntries(request.headers),
                host: new URL(BACKEND_URL as string).host,
            },
            body,
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Proxy error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const path = searchParams.get("path");

        if (!path) {
            return NextResponse.json({ error: "Path parameter is required" }, { status: 400 });
        }

        const response = await fetch(`${BACKEND_URL}${path}`, {
            method: "DELETE",
            headers: {
                ...Object.fromEntries(request.headers),
                host: new URL(BACKEND_URL as string).host,
            },
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Proxy error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const path = searchParams.get("path");

        if (!path) {
            return NextResponse.json({ error: "Path parameter is required" }, { status: 400 });
        }

        const forwardParams = new URLSearchParams();
        searchParams.forEach((value, key) => {
            if (key !== "path") {
                forwardParams.append(key, value);
            }
        });

        const contentType = request.headers.get("content-type");
        let body;
        let headers: Record<string, string> = {
            ...Object.fromEntries(request.headers),
            host: new URL(BACKEND_URL as string).host,
        };

        if (contentType?.includes("application/json")) {
            body = JSON.stringify(await request.json());
        } else if (contentType?.includes("multipart/form-data")) {
            body = await request.formData();
            delete headers["content-type"];
            delete headers["content-length"];
        } else if (contentType?.includes("application/x-www-form-urlencoded")) {
            body = await request.formData();
            delete headers["content-type"];
            delete headers["content-length"];
        } else {
            body = await request.text();
        }

        const targetUrl = `${BACKEND_URL}${path}${forwardParams.toString() ? `?${forwardParams.toString()}` : ""}`;

        const response = await fetch(targetUrl, {
            method: "PATCH",
            headers,
            body,
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Proxy error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
