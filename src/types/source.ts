interface Source {
    id: string;
    type: "file" | "link" | "notion";
    subtype: string;
    url: string;
    createdAt: string;
}

interface SourceCreateRequest extends Pick<Source, "type" | "subtype" | "url"> {}

export type { Source, SourceCreateRequest };
