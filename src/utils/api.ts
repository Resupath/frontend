import axios from "axios";

import { useAuthStore } from "@/src/stores/useAuthStore";

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
});

api.interceptors.request.use((config) => {
    const { user } = useAuthStore.getState();

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
