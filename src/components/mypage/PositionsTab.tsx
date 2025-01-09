"use client";

import { useEffect, useState } from "react";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";
import { Pagination } from "@/src/types/pagination";
import { createPosition, Position, PositionCreateRequest, listPositions } from "@/src/types/position";

export default function PositionsTab() {
    const [positions, setPositions] = useState<Pagination<Position>>({
        data: [],
        meta: { page: 1, take: 10, totalCount: 0, totalPage: 1 },
    });
    const [newPosition, setNewPosition] = useState("");

    const asyncCreatePosition = (position: PositionCreateRequest) =>
        pipe(
            createPosition(position),
            TE.mapLeft((error) => console.error(error))
        )().then(() => {
            setNewPosition("");
            asyncListPositions();
        });

    const asyncListPositions = () =>
        pipe(
            listPositions(),
            TE.map((positions) => setPositions(positions)),
            TE.mapLeft((error) => console.error(error))
        )();

    useEffect(() => {
        asyncListPositions();
    }, []);

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-4">포지션 추가</h3>
                <div className="flex gap-4 mb-4">
                    <input
                        type="text"
                        value={newPosition}
                        onChange={(e) => setNewPosition(e.target.value)}
                        placeholder="포지션 키워드"
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    />
                    <button
                        onClick={() => asyncCreatePosition({ keyword: newPosition })}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                        추가
                    </button>
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-4">경험 포지션</h3>
                {positions.data.length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-400">아직 추가된 포지션이 없습니다.</p>
                ) : (
                    <div className="space-y-3">
                        {positions.data.map((position) => (
                            <div
                                key={position.id}
                                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                            >
                                <div>
                                    <h4 className="font-medium">{position.keyword}</h4>
                                </div>
                                <button
                                    onClick={() => {}}
                                    className="text-red-500 hover:text-red-600 transition-colors"
                                >
                                    삭제
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
