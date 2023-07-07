import { defineStore } from 'pinia'
import type { Field } from '@/types/core'

const useActionStore = defineStore({
  id: 'action',

  state: () => ({
    record: {} as { [key in Field]: any },
    setIndexes: [null], // Hack used with v-for in FieldSets component
  }),
})

export default useActionStore
