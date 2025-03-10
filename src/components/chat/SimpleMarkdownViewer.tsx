interface SimpleMarkdownViewerProps {
    content: string;
    className?: string;
}

export function SimpleMarkdownViewer({ content, className = "" }: SimpleMarkdownViewerProps) {
    const parseMarkdown = (text: string): string => {
        return (
            text
                // 코드 블록
                .replace(
                    /```(\w*)\n([\s\S]*?)```/g,
                    (_, lang, code) =>
                        `<div class="relative">${
                            lang
                                ? `<div class="absolute right-2 top-2 text-xs text-gray-500 dark:text-gray-400">${lang}</div>`
                                : ""
                        }<pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-3 overflow-x-auto font-mono text-sm border border-gray-200 dark:border-gray-700"><code class="language-${lang}">${code
                            .replace(/^\n+|\n+$/g, "") // 앞뒤 줄바꿈 제거
                            .split("\n")
                            .map((line: string) => line.trimEnd()) // 각 줄 끝의 공백 제거
                            .join("\n")}</code></pre></div>`
                )
                // 인라인 코드
                .replace(
                    /`([^`]+)`/g,
                    '<code class="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded font-mono text-sm border border-gray-200 dark:border-gray-700">$1</code>'
                )
                // 헤더
                .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
                .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>')
                .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
                // 볼드
                .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
                // 이탤릭
                .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
                // 링크
                .replace(
                    /\[([^\]]+)\]\(([^)]+)\)/g,
                    '<a href="$2" class="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>'
                )
                // 순서 없는 리스트
                .replace(/^\s*[-*+]\s+(.*)$/gm, '<li class="ml-4">$1</li>')
                // 순서 있는 리스트
                .replace(/^\s*\d+\.\s+(.*)$/gm, '<li class="ml-4 list-decimal">$1</li>')
                // 인용구
                .replace(
                    /^>\s(.*)$/gm,
                    '<blockquote class="border-l-4 border-gray-300 pl-4 my-2 italic">$1</blockquote>'
                )
                // 수평선
                .replace(/^---$/gm, '<hr class="my-4 border-t border-gray-300 dark:border-gray-600">')
                // 줄바꿈
                .replace(/\n/g, "<br />")
        );
    };

    return (
        <div className={`markdown-content ${className}`} dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }} />
    );
}
