import type { Duration } from '@/types/general'
import { watch } from 'vue'
import useUIStore from '@/stores/ui'
import useLogger from '@/composables/useLogger'

export default function useChartTimeWatcher(updateFunc: () => Promise<void>) {
  const uiStore = useUIStore()
  const { log } = useLogger()

  /**
   * Watching uiStore chart time.
   * The provided function is called when the property changes.
   */
  watch(
    () => uiStore.chartTime as keyof typeof Duration,
    async () => {
      try {
        await updateFunc()
      } catch (error) {
        log.error('Error with chart time watcher', error)
      }
    },
    { immediate: true }
  )
}
