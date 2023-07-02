<script setup lang="ts">
import { onMounted, type Ref, ref } from 'vue'
import { allFields, numberSchema, type MeasurementInput, measurementInputs } from '@/types/core'
import useActionStore from '@/stores/action'
import useMeasurementInputWatcher from '@/composables/useMeasurementInputWatcher'

defineProps<{
  inspecting: boolean
}>()

const actionStore = useActionStore()
useMeasurementInputWatcher(coreIdUpdate)

const dataField = allFields.Values.measurementData
const field = allFields.Values.inches
const isVisible: Ref<boolean> = ref(false)

function coreIdUpdate(measurementInput: MeasurementInput) {
  if (measurementInput === measurementInputs.Values.Inches) {
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
  return val ? `${val} in` : '-'
}
</script>

<template>
  <div v-if="isVisible">
    <div class="text-weight-bold text-body1">Inches</div>

    <div v-if="inspecting">
      {{ inspectFormat(actionStore.record[dataField][field]) }}
    </div>

    <QInput
      v-else
      v-model.number="actionStore.record[dataField][field]"
      :rules="[(val: number) => numberSchema.safeParse(val).success || 'Must be 0 or greater']"
      type="number"
      lazy-rules
      dense
      outlined
      color="primary"
    />
  </div>
</template>
