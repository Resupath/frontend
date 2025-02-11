import { create } from "zustand";

import { RoomWithCharacter, listRooms } from "@/src/types/room";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

export type RoomStore = {
    rooms: RoomWithCharacter[];
};

export type RoomActions = {
    asyncListRooms: () => Promise<void>;
};

export const useRoomStore = create<RoomStore & RoomActions>((set) => ({
    rooms: [],
    asyncListRooms: async () => {
        pipe(
            listRooms(),
            TE.map((response) => set({ rooms: response.data })),
            TE.mapLeft((error) => set({ rooms: [] }))
        )();
    },
}));
