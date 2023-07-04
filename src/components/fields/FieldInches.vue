<script setup lang="ts">
import { type Ref, ref } from 'vue'
import {
  type MeasurementInput,
  type AnyCoreRecord,
  allFields,
  numberSchema,
  measurementInputs,
} from '@/types/core'
import useActionStore from '@/stores/action'
import useCoreIdWatcher from '@/composables/useCoreIdWatcher'

defineProps<{
  inspecting: boolean
}>()

const actionStore = useActionStore()

const field = allFields.Values.inches
const isVisible: Ref<boolean> = ref(false)

useCoreIdWatcher((coreRecord: AnyCoreRecord) => {
  const measurementInput = coreRecord?.measurementInput as MeasurementInput | undefined

  if (measurementInput === measurementInputs.Values.Inches) {
    actionStore.record[field] = actionStore.record?.[field] ?? 0 // Defaulting
    // Nulling out other measurement data fields
    actionStore.record.bodyWeight = null
    actionStore.record.percent = null
    actionStore.record.lbs = null
    isVisible.value = true
  } else {
    isVisible.value = false
  }
})

function inspectFormat(val: number) {
  return val ? `${val} in` : '-'
}
</script>

<template>
  <div v-if="isVisible">
    <div class="text-weight-bold text-body1">Inches</div>

    <div v-if="inspecting">
      {{ inspectFormat(actionStore.record[field]) }}
    </div>

    <QInput
      v-else
      v-model.number="actionStore.record[field]"
      :rules="[(val: number) => numberSchema.safeParse(val).success || 'Must be 0 or greater']"
      type="number"
      lazy-rules
      dense
      outlined
      color="primary"
    />
  </div>
</template>
