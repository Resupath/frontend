"use client";

import { retrieveCharacter } from "@/src/types/character";
import { createRoom } from "@/src/types/room";
import { useRouter } from "next/navigation";

import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";
import Loading from "./loading";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { api } from "@/src/utils/api";
import { useRoomStore } from "@/src/stores/useRoomStore";

interface CharacterShareClientProps {
    id: string;
}

export default function CharacterShareClient({ id }: CharacterShareClientProps) {
    const router = useRouter();

    const { setAuth, user } = useAuthStore();

    const { asyncListRooms: refreshRooms } = useRoomStore((state) => state);

    const [isCreating, setIsCreating] = useState(false);

    const getUserToken = () =>
        pipe(
            TE.tryCatch(
                () =>
                    api.get<{
                        accessToken: string;
                    }>("/auth/user"),
                (error) => new Error("유저 토큰 발급 실패")
            ),
            TE.map((res) => res.data.accessToken),
            TE.map((accessToken) => setAuth({ userToken: accessToken })),
            TE.mapLeft((error) => console.error(error))
        )();

    const asyncCreateRoom = async (id: string) =>
        pipe(
            createRoom(id),
            TE.map((room) => {
                refreshRooms();
                setTimeout(() => {
                    router.push(`/room/${room.data.id}`);
                }, 3000);
            }),
            TE.mapLeft((error) => {
                console.error("Error in CharacterSharePage:", error);
                router.push("/");
            })
        )();

    useEffect(() => {
        if (isCreating) return; // 이미 생성 중이면 중복 실행 방지

        if (user?.userToken) {
            setIsCreating(true);
            asyncCreateRoom(id);
        }
    }, [user?.userToken]);

    return <Loading />;
}
