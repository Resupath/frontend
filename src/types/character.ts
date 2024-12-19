import * as TE from "fp-ts/TaskEither";

interface Character {
    id: string;
    memberId: string;
    nickname: string;
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
}

const listCharacters = (): TE.TaskEither<Error, Character[]> =>
    TE.tryCatch(
        async () => {
            const dummyData: Character[] = [
                {
                    id: "1",
                    memberId: "1",
                    nickname: "Alice",
                    isPublic: true,
                    createdAt: "2024-01-01",
                    updatedAt: "2024-01-01",
                },
                {
                    id: "2",
                    memberId: "2",
                    nickname: "Bob",
                    isPublic: false,
                    createdAt: "2024-01-02",
                    updatedAt: "2024-01-02",
                },
                {
                    id: "3",
                    memberId: "3",
                    nickname: "Charlie",
                    isPublic: true,
                    createdAt: "2024-01-03",
                    updatedAt: "2024-01-03",
                },
                {
                    id: "4",
                    memberId: "4",
                    nickname: "David",
                    isPublic: true,
                    createdAt: "2024-01-04",
                    updatedAt: "2024-01-04",
                },
                {
                    id: "5",
                    memberId: "5",
                    nickname: "Emma",
                    isPublic: false,
                    createdAt: "2024-01-05",
                    updatedAt: "2024-01-05",
                },
                {
                    id: "6",
                    memberId: "6",
                    nickname: "Frank",
                    isPublic: true,
                    createdAt: "2024-01-06",
                    updatedAt: "2024-01-06",
                },
                {
                    id: "7",
                    memberId: "7",
                    nickname: "Grace",
                    isPublic: false,
                    createdAt: "2024-01-07",
                    updatedAt: "2024-01-07",
                },
                {
                    id: "8",
                    memberId: "8",
                    nickname: "Henry",
                    isPublic: true,
                    createdAt: "2024-01-08",
                    updatedAt: "2024-01-08",
                },
            ];
            return dummyData;
        },
        (error) => new Error("Failed to fetch characters")
    );

export type { Character };

export { listCharacters };
