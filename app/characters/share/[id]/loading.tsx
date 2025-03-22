export default function Loading() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-600">채팅방을 생성하는 중...</p>
            </div>
        </div>
    );
}
