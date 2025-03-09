export function ChatMessageSkeleton() {
    return (
        <div className="space-y-4">
            {/* 왼쪽 메시지 (상대방) */}
            <div className="flex items-start space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full" /> {/* 프로필 이미지 */}
                <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-20" /> {/* 이름 */}
                    <div className="h-16 bg-gray-200 rounded-lg w-64" /> {/* 메시지 */}
                </div>
            </div>

            {/* 오른쪽 메시지 (나) */}
            <div className="flex items-start justify-end space-x-3 animate-pulse">
                <div className="space-y-2 text-right">
                    <div className="h-3 bg-gray-200 rounded w-20 ml-auto" /> {/* 이름 */}
                    <div className="h-12 bg-gray-200 rounded-lg w-48" /> {/* 메시지 */}
                </div>
            </div>
        </div>
    );
}
