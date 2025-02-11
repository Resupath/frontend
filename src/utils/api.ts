import axios from "axios";

import { useAuthStore } from "@/src/stores/useAuthStore";

export const api = axios.create({
    baseURL: "/api/proxy",
    paramsSerializer: (params) => {
        const searchParams = new URLSearchParams();
        // path 파라미터는 프록시 라우트에 필요한 실제 엔드포인트 경로
        if (params.path) {
            searchParams.append("path", params.path);
        }
        // 나머지 파라미터들은 쿼리스트링으로 처리
        Object.entries(params).forEach(([key, value]) => {
            if (key !== "path" && value !== undefined) {
                searchParams.append(key, String(value));
            }
        });
        return searchParams.toString();
    },
});

api.interceptors.request.use((config) => {
    const { user } = useAuthStore.getState();

    // path가 없는 경우 URL에서 추출
    if (!config.params?.path) {
        const path = config.url;
        config.params = { ...config.params, path };
        config.url = "";
    }

    if (user.accessToken) {
        config.headers["X-Member"] = `Bearer ${user.accessToken}`;
    }

    if (user.userToken) {
        config.headers["X-User"] = `Bearer ${user.userToken}`;
    }

    return config;
});

api.interceptors.response.use((response) => {
    return response;
});
