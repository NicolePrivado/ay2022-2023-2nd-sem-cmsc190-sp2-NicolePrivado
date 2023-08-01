import { create } from "zustand";

const useStore = create((set) => ({
    device_token: null,
    user: null,

    set_user: (user) => set(() => ({
        user: user
    })),
    set_token: (token) => set(() => ({
        device_token : token
    })),
}))

export default useStore;