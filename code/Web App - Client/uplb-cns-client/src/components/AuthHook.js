import create from 'zustand';

const useStore = create((set) => ({
  user: null,
  isAuthenticated: false,

  setAuth: (user, isAuthenticated) => set((state) => {
    state.user = user
    state.isAuthenticated = isAuthenticated
  }),
}))

export default useStore;