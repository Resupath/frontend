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

        const body = await request.json();
        const response = await fetch(`${BACKEND_URL}${path}`, {
            method: "POST",
            headers: {
                ...Object.fromEntries(request.headers),
                "Content-Type": "application/json",
                host: new URL(BACKEND_URL as string).host,
            },
            body: JSON.stringify(body),
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

        const body = await request.json();
        const response = await fetch(`${BACKEND_URL}${path}`, {
            method: "PUT",
            headers: {
                ...Object.fromEntries(request.headers),
                "Content-Type": "application/json",
                host: new URL(BACKEND_URL as string).host,
            },
            body: JSON.stringify(body),
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
