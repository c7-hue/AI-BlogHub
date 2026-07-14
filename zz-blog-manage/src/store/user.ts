import { defineStore } from 'pinia'

export const useUserStore = defineStore('user',{
  state:()=>({
    id:-1,
    name:'',
    token:'',
  }),
  persist: {
    storage: localStorage,
  },
  actions: {
    setUser(user: { id: number; name: string; token: string }) {
      this.$patch(user)
    },
    clearUser() {
      this.$reset()
    },
  },
})
 
