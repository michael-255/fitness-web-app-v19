<script setup lang="ts">
import { type Ref, ref } from 'vue'
import { MeasurementInput, type AnyCoreRecord, allFields, percentSchema } from '@/types/core'
import useActionStore from '@/stores/action'
import useCoreIdWatcher from '@/composables/useCoreIdWatcher'

defineProps<{
  inspecting: boolean
}>()

const actionStore = useActionStore()

const dataField = allFields.Values.measuredData
const field = allFields.Values.percent
const isVisible: Ref<boolean> = ref(false)

useCoreIdWatcher((coreRecord: AnyCoreRecord) => {
  const measurementInput = coreRecord?.measurementInput as MeasurementInput | undefined

  if (measurementInput === MeasurementInput.PERCENT) {
    actionStore.record[dataField] = {
      [field]: actionStore.record?.[dataField]?.[field] ?? 0, // Defaulting
    }
    isVisible.value = true
  } else {
    isVisible.value = false
  }
})

function inspectFormat(val: number) {
  return val ? `${val}%` : '-'
}
</script>

<template>
  <div v-if="isVisible">
    <div class="text-weight-bold text-body1">Percentage</div>

    <div v-if="inspecting">
      {{ inspectFormat(actionStore.record[dataField][field]) }}
    </div>

    <!-- TODO - Hint with last value -->
    <QInput
      v-else
      v-model.number="actionStore.record[dataField][field]"
      :rules="[(val: number) => percentSchema.safeParse(val).success || 'Percent must be between 0 and 100']"
      type="number"
      lazy-rules
      dense
      outlined
      color="primary"
    />
  </div>
</template>
