<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue'
import {
  allFields,
  measurementInputs,
  measurementInputSchema,
  type MeasurementInput,
} from '@/types/core'
import useLogger from '@/composables/useLogger'
import useActionStore from '@/stores/action'

defineProps<{
  inspecting: boolean
}>()

const { log } = useLogger()
const actionStore = useActionStore()

const field = allFields.Values.measurementInput
const options: Ref<{ value: MeasurementInput; label: MeasurementInput }[]> = ref([])

onMounted(async () => {
  try {
    actionStore.record[field] = actionStore.record[field] ?? []

    options.value = measurementInputs.options.map((o: MeasurementInput) => ({
      value: o,
      label: o,
    }))
  } catch (error) {
    log.error('Error with measurement input field', error)
  }
})

function inspectFormat(val: MeasurementInput) {
  return `${val || '-'}`
}
</script>

<template>
  <div class="text-weight-bold text-body1">Measurement Input</div>

  <div v-if="inspecting">
    {{ inspectFormat(actionStore.record[field]) }}
  </div>

  <div v-else>
    <p>
      Select a measurement input that represents the type of data you want to record on this
      measurement.
    </p>

    <QSelect
      v-model="actionStore.record[field]"
      :rules="[(val: MeasurementInput) => measurementInputSchema.safeParse(val).success || 'Required']"
      :options="options"
      lazy-rules
      emit-value
      map-options
      options-dense
      dense
      outlined
      color="primary"
    />
  </div>
</template>
