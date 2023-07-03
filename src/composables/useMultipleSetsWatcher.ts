import { watch } from 'vue'
import { recordGroups } from '@/types/core'
import useLogger from '@/composables/useLogger'
import useActionStore from '@/stores/action'
import DB from '@/services/Database'

export default function useMultipleSetsWatcher(updateFunc: (hasMultipleSets: boolean) => void) {
  const actionStore = useActionStore()
  const { log } = useLogger()

  /**
   * Watching actionStore coreId.
   * The provided function is called when the property changes.
   */
  watch(
    () => actionStore.record.coreId as string,
    async () => {
      try {
        if (actionStore.record.coreId) {
          const record = await DB.getRecord(recordGroups.Values.core, actionStore.record.coreId)
          const hasMultipleSets = record?.multipleSets
          if (hasMultipleSets !== undefined) {
            updateFunc(hasMultipleSets)
          }
        }
      } catch (error) {
        log.error('Error with multiple sets watcher', error)
      }
    },
    { immediate: true }
  )
}
