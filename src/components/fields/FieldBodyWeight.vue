<script setup lang="ts">
import { type Ref, ref } from 'vue'
import { allFields, bodyWeightSchema, measurementInputs, type MeasurementInput } from '@/types/core'
import useActionStore from '@/stores/action'
import useMeasurementInputWatcher from '@/composables/useMeasurementInputWatcher'

defineProps<{
  inspecting: boolean
}>()

const actionStore = useActionStore()
useMeasurementInputWatcher(updateActionRecord)

const field = allFields.Values.bodyWeight
const isVisible: Ref<boolean> = ref(false)

function updateActionRecord(measurementInput: MeasurementInput) {
  if (measurementInput === measurementInputs.Values['Body Weight (lbs)']) {
    actionStore.record[field] = actionStore.record?.[field] ?? 0 // Defaulting
    // Nulling out other fields
    actionStore.record.percent = null
    actionStore.record.inches = null
    actionStore.record.lbs = null
    isVisible.value = true
  } else {
    isVisible.value = false
  }
}

function inspectFormat(val: number) {
  return val ? `${val} lbs` : '-'
}
</script>

<template>
  <div v-if="isVisible">
    <div class="text-weight-bold text-body1">Body Weight (lbs)</div>

    <div v-if="inspecting">
      {{ inspectFormat(actionStore.record[field]) }}
    </div>

    <QInput
      v-else
      v-model.number="actionStore.record[field]"
      :rules="[(val: number) => bodyWeightSchema.safeParse(val).success || 'Must greater then 0']"
      type="number"
      lazy-rules
      dense
      outlined
      color="primary"
    />
  </div>
</template>
