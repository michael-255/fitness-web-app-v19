<script setup lang="ts">
import { type Ref, ref } from 'vue'
import { allFields, bodyWeightSchema, measurementInputs, type MeasurementInput } from '@/types/core'
import useActionStore from '@/stores/action'
import useMeasurementInputWatcher from '@/composables/useMeasurementInputWatcher'

defineProps<{
  inspecting: boolean
}>()

const actionStore = useActionStore()
useMeasurementInputWatcher(coreIdUpdate)

const dataField = allFields.Values.measurementData
const field = allFields.Values.bodyWeight
const isVisible: Ref<boolean> = ref(false)

function coreIdUpdate(measurementInput: MeasurementInput) {
  if (measurementInput === measurementInputs.Values['Body Weight (lbs)']) {
    // Default the field if needed
    if (actionStore.record?.measurementData?.[field] === undefined) {
      actionStore.record.measurementData = {
        [field]: 0,
      }
    }

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
      {{ inspectFormat(actionStore.record[dataField][field]) }}
    </div>

    <QInput
      v-else
      v-model.number="actionStore.record[dataField][field]"
      :rules="[(val: number) => bodyWeightSchema.safeParse(val).success || 'Must greater then 0']"
      type="number"
      lazy-rules
      dense
      outlined
      color="primary"
    />
  </div>
</template>
