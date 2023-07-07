<script setup lang="ts">
import { type Ref, ref } from 'vue'
import { MeasurementInput, type AnyCoreRecord, bodyWeightSchema, Field } from '@/types/core'
import useActionStore from '@/stores/action'
import useCoreIdWatcher from '@/composables/useCoreIdWatcher'

defineProps<{
  inspecting: boolean
}>()

const actionStore = useActionStore()

const field = Field.BODY_WEIGHT
const isVisible: Ref<boolean> = ref(false)

useCoreIdWatcher((coreRecord: AnyCoreRecord) => {
  if (coreRecord?.measurementInput === MeasurementInput.BODY_WEIGHT) {
    actionStore.record[field] = actionStore.record?.[field] ?? undefined
    isVisible.value = true
  } else {
    isVisible.value = false
  }
})

function inspectFormat(val: number) {
  return val ? `${val} lbs` : '-'
}
</script>

<template>
  <div v-if="isVisible">
    <div class="text-weight-bold text-body1">{{ MeasurementInput.BODY_WEIGHT }}</div>

    <div v-if="inspecting">{{ inspectFormat(actionStore.record[field]) }}</div>

    <!-- TODO - Hint with last value -->
    <QInput
      v-else
      v-model.number="actionStore.record[field]"
      :rules="[(val: number) => bodyWeightSchema.safeParse(val).success || 'Must be between 1 and 1000']"
      type="number"
      lazy-rules
      dense
      outlined
      color="primary"
    />
  </div>
</template>
