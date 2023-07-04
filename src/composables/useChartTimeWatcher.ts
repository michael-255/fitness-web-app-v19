import type { Duration } from '@/types/general'
import { watch } from 'vue'
import useUIStore from '@/stores/ui'
import useLogger from '@/composables/useLogger'

export default function useChartTimeWatcher(updateFunc: () => Promise<void>) {
  const uiStore = useUIStore()
  const { log } = useLogger()

  /**
   * Watching ui store chart time for changes.
   */
  watch(
    () => uiStore.chartTime as keyof typeof Duration,
    async (newValue, oldValue) => {
      try {
        if (newValue !== oldValue) {
          await updateFunc()
        }
      } catch (error) {
        log.error('Error with chart time watcher', error)
      }
    },
    { immediate: true }
  )
}
