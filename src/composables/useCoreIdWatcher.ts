import { watch } from 'vue'
import { recordGroups, type AnyCoreRecord } from '@/types/core'
import useLogger from '@/composables/useLogger'
import useActionStore from '@/stores/action'
import DB from '@/services/Database'

export default function useCoreIdWatcher(updateFunc: (coreRecord: AnyCoreRecord) => void) {
  const actionStore = useActionStore()
  const { log } = useLogger()

  /**
   * Watching action store core id for changes.
   */
  watch(
    () => actionStore.record.coreId,
    async (newValue, oldValue) => {
      try {
        if (newValue !== oldValue) {
          // Must have changed
          if (actionStore.record.coreId) {
            // Must have value after change
            const record = (await DB.getRecord(
              recordGroups.Values.core,
              actionStore.record.coreId
            )) as AnyCoreRecord

            if (record) {
              updateFunc(record) // Pass entire record to update function
            }
          }
        }
      } catch (error) {
        log.error('Error with core id watcher', error)
      }
    },
    { immediate: true }
  )
}
