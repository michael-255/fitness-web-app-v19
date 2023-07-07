<script setup lang="ts">
import { type Ref, ref } from 'vue'
import { MeasurementInput, type AnyCoreRecord, Field, percentSchema } from '@/types/core'
import useActionStore from '@/stores/action'
import useCoreIdWatcher from '@/composables/useCoreIdWatcher'

defineProps<{
  inspecting: boolean
}>()

const actionStore = useActionStore()

const field = Field.PERCENT
const isVisible: Ref<boolean> = ref(false)

useCoreIdWatcher((coreRecord: AnyCoreRecord) => {
  if (coreRecord?.measurementInput === MeasurementInput.PERCENT) {
    actionStore.record[field] = actionStore.record?.[field] ?? undefined
    isVisible.value = true
  } else {
    isVisible.value = false
  }
})

function inspectFormat(val: number) {
  return val ? `${val}%` : '-'
}
</script>

<template>
  <div v-if="isVisible">
    <div class="text-weight-bold text-body1">{{ MeasurementInput.PERCENT }}</div>

    <div v-if="inspecting">{{ inspectFormat(actionStore.record[field]) }}</div>

    <!-- TODO - Hint with last value -->
    <QInput
      v-else
      v-model.number="actionStore.record[field]"
      :rules="[(val: number) => percentSchema.safeParse(val).success || 'Must be between 1 and 100']"
      type="number"
      lazy-rules
      dense
      outlined
      color="primary"
    />
  </div>
</template>
