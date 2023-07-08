<script setup lang="ts">
import { type Ref, ref } from 'vue'
import { type AnyCoreRecord, MeasurementInput, numberSchema } from '@/types/core'
import useActionStore from '@/stores/action'
import useCoreIdWatcher from '@/composables/useCoreIdWatcher'

defineProps<{
  inspecting: boolean
}>()

const actionStore = useActionStore()

const isVisible: Ref<boolean> = ref(false)

useCoreIdWatcher((coreRecord: AnyCoreRecord) => {
  if (coreRecord?.measurementInput === MeasurementInput.NUMBER) {
    actionStore.record.number = actionStore.record.number ?? undefined
    isVisible.value = true
  } else {
    isVisible.value = false
  }
})

function inspectFormat(val: number) {
  return val ? `${val}` : '-'
}
</script>

<template>
  <div v-if="isVisible">
    <div class="text-weight-bold text-body1">{{ MeasurementInput.NUMBER }}</div>

    <div v-if="inspecting">{{ inspectFormat(actionStore.record.number) }}</div>

    <!-- TODO - Hint with last value -->
    <QInput
      v-else
      v-model.number="actionStore.record.number"
      :rules="[(val: number) => numberSchema.safeParse(val).success || 'Must be a valid number']"
      type="number"
      lazy-rules
      dense
      outlined
      color="primary"
    />
  </div>
</template>
