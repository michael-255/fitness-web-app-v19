<script setup lang="ts">
import { type Ref, ref } from 'vue'
import { allFields, numberSchema, type MeasurementInput, measurementInputs } from '@/types/core'
import useActionStore from '@/stores/action'
import useMeasurementInputWatcher from '@/composables/useMeasurementInputWatcher'

defineProps<{
  inspecting: boolean
}>()

const actionStore = useActionStore()
useMeasurementInputWatcher(updateActionRecord)

const field = allFields.Values.inches
const isVisible: Ref<boolean> = ref(false)

function updateActionRecord(measurementInput: MeasurementInput) {
  if (measurementInput === measurementInputs.Values.Inches) {
    actionStore.record[field] = actionStore.record?.[field] ?? 0 // Defaulting
    // Nulling out other fields
    actionStore.record.percent = null
    actionStore.record.bodyWeight = null
    actionStore.record.lbs = null
    isVisible.value = true
  } else {
    isVisible.value = false
  }
}

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
