<script setup lang="ts">
import { type Ref, ref } from 'vue'
import { MeasurementInput, type AnyCoreRecord, allFields, bodyWeightSchema } from '@/types/core'
import useActionStore from '@/stores/action'
import useCoreIdWatcher from '@/composables/useCoreIdWatcher'

defineProps<{
  inspecting: boolean
}>()

const actionStore = useActionStore()

const dataField = allFields.Values.measuredData
const field = allFields.Values.bodyWeight
const isVisible: Ref<boolean> = ref(false)

useCoreIdWatcher((coreRecord: AnyCoreRecord) => {
  const measurementInput = coreRecord?.measurementInput as MeasurementInput | undefined

  if (measurementInput === MeasurementInput.BODY_WEIGHT) {
    actionStore.record[dataField] = {
      [field]: actionStore.record?.[dataField]?.[field] ?? 0, // Defaulting
    }
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
    <div class="text-weight-bold text-body1">Body Weight (lbs)</div>

    <div v-if="inspecting">
      {{ inspectFormat(actionStore.record[dataField][field]) }}
    </div>

    <!-- TODO - Hint with last value -->
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
