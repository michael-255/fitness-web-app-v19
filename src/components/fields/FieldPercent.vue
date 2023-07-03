<script setup lang="ts">
import { type Ref, ref } from 'vue'
import { allFields, percentSchema, type MeasurementInput, measurementInputs } from '@/types/core'
import useActionStore from '@/stores/action'
import useMeasurementInputWatcher from '@/composables/useMeasurementInputWatcher'

defineProps<{
  inspecting: boolean
}>()

const actionStore = useActionStore()
useMeasurementInputWatcher(updateActionRecord)

const field = allFields.Values.percent
const isVisible: Ref<boolean> = ref(false)

function updateActionRecord(measurementInput: MeasurementInput) {
  if (measurementInput === measurementInputs.Values.Percentage) {
    actionStore.record[field] = actionStore.record?.[field] ?? 0 // Defaulting
    // Nulling out other fields
    actionStore.record.bodyWeight = null
    actionStore.record.inches = null
    actionStore.record.lbs = null
    isVisible.value = true
  } else {
    isVisible.value = false
  }
}

function inspectFormat(val: number) {
  return val ? `${val}%` : '-'
}
</script>

<template>
  <div v-if="isVisible">
    <div class="text-weight-bold text-body1">Percentage</div>

    <div v-if="inspecting">
      {{ inspectFormat(actionStore.record[field]) }}
    </div>

    <QInput
      v-else
      v-model.number="actionStore.record[field]"
      :rules="[(val: number) => percentSchema.safeParse(val).success || 'Percent must be between 0 and 100']"
      type="number"
      lazy-rules
      dense
      outlined
      color="primary"
    />
  </div>
</template>
