import { watch } from 'vue'
import { recordGroups, type MeasurementInput } from '@/types/core'
import useLogger from '@/composables/useLogger'
import useActionStore from '@/stores/action'
import DB from '@/services/Database'

export default function useMeasurementInputWatcher(
  coreIdUpdateFunc: (measurementInput: MeasurementInput) => void
) {
  const actionStore = useActionStore()
  const { log } = useLogger()

  /**
   * Watching actionStore measurementInput.
   * The provided function is called when the property changes.
   */
  watch(
    () => actionStore.record.coreId as MeasurementInput,
    async () => {
      try {
        if (actionStore.record.coreId) {
          const record = await DB.getRecord(recordGroups.Values.core, actionStore.record.coreId)
          const measurementInput = record?.measurementInput
          coreIdUpdateFunc(measurementInput)
        }
      } catch (error) {
        log.error('Error with measurement input watcher', error)
      }
    },
    { immediate: true }
  )
}
