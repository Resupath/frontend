export function CharacterCardSkeleton() {
    return (
        <div className="animate-pulse bg-white rounded-lg shadow-md p-4">
            <div className="w-full h-48 bg-gray-200 rounded-lg mb-4" /> {/* 캐릭터 이미지 영역 */}
            <div className="space-y-3">
                <div className="h-5 bg-gray-200 rounded w-2/3" /> {/* 캐릭터 이름 */}
                <div className="flex space-x-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4" /> {/* 레벨 */}
                    <div className="h-4 bg-gray-200 rounded w-1/4" /> {/* 직업 */}
                </div>
                <div className="h-4 bg-gray-200 rounded w-full" /> {/* 추가 정보 */}
            </div>
        </div>
    );
}
