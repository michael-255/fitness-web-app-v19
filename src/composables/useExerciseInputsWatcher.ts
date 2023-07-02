import { watch } from 'vue'
import { recordGroups, type ExerciseInput } from '@/types/core'
import useLogger from '@/composables/useLogger'
import useActionStore from '@/stores/action'
import DB from '@/services/Database'

export default function useExerciseInputsWatcher(
  updateFunc: (exerciseInputs: ExerciseInput[]) => void
) {
  const actionStore = useActionStore()
  const { log } = useLogger()

  /**
   * Watching actionStore exerciseInputs.
   * The provided function is called when the property changes.
   */
  watch(
    () => actionStore.record.exerciseInputs as ExerciseInput,
    async () => {
      try {
        if (actionStore.record.coreId) {
          const record = await DB.getRecord(recordGroups.Values.core, actionStore.record.coreId)
          const exerciseInputs = record?.exerciseInputs
          if (exerciseInputs) {
            updateFunc(exerciseInputs)
          }
        }
      } catch (error) {
        log.error('Error with exercise inputs watcher', error)
      }
    },
    { immediate: true }
  )
}
