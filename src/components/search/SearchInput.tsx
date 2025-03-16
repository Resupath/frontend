import React, { FC, useState, useRef, useEffect, KeyboardEvent } from "react";
import { Pagination } from "@/src/types/pagination";
import { api } from "@/src/utils/api";
import { useDebounce } from "@/src/hooks/useDebounce";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";

interface SearchInputProps {
    apiType: "skill" | "position";
    onSelect: (value: string) => void;
}

/**
 * @author
 * @function SearchInput
 **/

export const SearchInput: FC<SearchInputProps> = ({ onSelect, apiType }) => {
    const [value, setValue] = useState("");
    const url = apiType === "skill" ? "/skills" : "/positions";
    const [isOpen, setIsOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const debouncedValue = useDebounce(value, 300);

    const [searchResult, setSearchResult] = useState<Pagination<{ id: string; keyword: string }>>({
        data: [],
        meta: {
            page: 0,
            take: 0,
            totalCount: 0,
            totalPage: 0,
        },
    });

    console.log(searchResult.data);

    const fetchResults = async (searchValue: string, pageNum: number) => {
        if (!searchValue.trim()) {
            setSearchResult((prev) => ({ ...prev, data: [] }));
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.get(`${url}`, {
                params: {
                    search: searchValue,
                    page: pageNum,
                },
            });

            if (pageNum === 1) {
                setSearchResult(response.data);
            } else {
                setSearchResult((prev) => ({
                    ...response.data,
                    data: [...prev.data, ...response.data.data],
                }));
            }

            setHasMore(pageNum < response.data.meta.totalPage);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setPage(1);
        fetchResults(debouncedValue, 1);
    }, [debouncedValue]);

    const handleScroll = () => {
        if (containerRef.current && !isLoading && hasMore) {
            const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
            if (scrollTop + clientHeight >= scrollHeight - 20) {
                setPage((prev) => prev + 1);
                fetchResults(value, page + 1);
            }
        }
    };

    const handleSelect = (selectedValue: string) => {
        setIsOpen(false);
        onSelect(selectedValue);
        setValue("");
        setSelectedIndex(-1);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen || searchResult.data.length === 0) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setSelectedIndex((prev) => (prev < searchResult.data.length - 1 ? prev + 1 : prev));
                break;
            case "ArrowUp":
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
                break;
            case "Enter":
                e.preventDefault();
                if (selectedIndex >= 0) {
                    handleSelect(searchResult.data[selectedIndex].keyword);
                }
                break;
            case "Escape":
                setIsOpen(false);
                break;
        }
    };

    useEffect(() => {
        setSelectedIndex(-1);
    }, [searchResult.data]);

    return (
        <div className="relative">
            <input
                type="text"
                value={value}
                onChange={(e) => {
                    setValue(e.target.value);
                    setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                onKeyDown={handleKeyDown}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none bg-gray-50 dark:bg-gray-700"
                placeholder={`보유 ${apiType === "skill" ? "스킬" : "포지션"}을 검색해 주세요.`}
            />

            {isOpen && value.trim() && (
                <div
                    className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
                    onMouseDown={(e) => e.preventDefault()}
                >
                    <div ref={containerRef} className="max-h-60 overflow-y-auto" onScroll={handleScroll}>
                        {searchResult.data.length > 0 ? (
                            searchResult.data.map((item, index) => (
                                <div
                                    key={item.id}
                                    className={`px-4 py-2 cursor-pointer ${
                                        index === selectedIndex
                                            ? "bg-primary text-white dark:bg-primary dark:text-white"
                                            : "hover:bg-gray-100 dark:hover:bg-gray-700"
                                    }`}
                                    onClick={() => handleSelect(item.keyword)}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                >
                                    {item.keyword}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                                검색 결과가 없습니다.
                            </div>
                        )}
                        {isLoading && <div className="px-4 py-2 text-center text-gray-500">로딩 중...</div>}
                    </div>
                </div>
            )}
        </div>
    );
};
