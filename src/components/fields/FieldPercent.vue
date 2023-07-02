<script setup lang="ts">
import { type Ref, ref } from 'vue'
import { allFields, percentSchema, type MeasurementInput, measurementInputs } from '@/types/core'
import useActionStore from '@/stores/action'
import useMeasurementInputWatcher from '@/composables/useMeasurementInputWatcher'

defineProps<{
  inspecting: boolean
}>()

const actionStore = useActionStore()
useMeasurementInputWatcher(coreIdUpdate)

const field = allFields.Values.percent
const objectField = allFields.Values.measured
const isVisible: Ref<boolean> = ref(false)

function coreIdUpdate(measurementInput: MeasurementInput) {
  if (measurementInput === measurementInputs.Values.Percentage) {
    // Default the field if needed
    if (actionStore.record?.[field]?.[objectField] === undefined) {
      actionStore.record[field] = {
        [objectField]: 0,
      }
    }

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
      {{ inspectFormat(actionStore.record[field][objectField]) }}
    </div>

    <QInput
      v-else
      v-model.number="actionStore.record[field][objectField]"
      :rules="[(val: number) => percentSchema.safeParse(val).success || 'Percent must be between 0 and 100']"
      type="number"
      lazy-rules
      dense
      outlined
      color="primary"
    />
  </div>
</template>
