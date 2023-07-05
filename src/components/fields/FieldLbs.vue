<script setup lang="ts">
import { type Ref, ref } from 'vue'
import { MeasurementInput, type AnyCoreRecord, allFields, numberSchema } from '@/types/core'
import useActionStore from '@/stores/action'
import useCoreIdWatcher from '@/composables/useCoreIdWatcher'

defineProps<{
  inspecting: boolean
}>()

const actionStore = useActionStore()

const dataField = allFields.Values.measuredData
const field = allFields.Values.lbs
const isVisible: Ref<boolean> = ref(false)

useCoreIdWatcher((coreRecord: AnyCoreRecord) => {
  const measurementInput = coreRecord?.measurementInput as MeasurementInput | undefined

  if (measurementInput === MeasurementInput.LBS) {
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
    <div class="text-weight-bold text-body1">Lbs</div>

    <div v-if="inspecting">
      {{ inspectFormat(actionStore.record[dataField][field]) }}
    </div>

    <!-- TODO - Hint with last value -->
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
