<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue'
import { measurementInputSchema, MeasurementInput } from '@/types/core'
import { Icon, RouteName } from '@/types/general'
import useLogger from '@/composables/useLogger'
import useActionStore from '@/stores/action'
import useRoutables from '@/composables/useRoutables'

defineProps<{
  inspecting: boolean
}>()

const { log } = useLogger()
const { route } = useRoutables()
const actionStore = useActionStore()

const options: Ref<{ value: MeasurementInput; label: MeasurementInput }[]> = ref([])

onMounted(async () => {
  try {
    actionStore.record.measurementInput = actionStore.record.measurementInput ?? undefined

    options.value = Object.values(MeasurementInput).map((o: MeasurementInput) => ({
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

  <div v-if="inspecting">{{ inspectFormat(actionStore.record.measurementInput) }}</div>

  <div v-else>
    <p>
      Select a measurement input that represents the type of data you want to record on this
      measurement. This cannot be updated once set during record creation.
    </p>

    <QSelect
      :disable="route.name === RouteName.EDIT"
      v-model="actionStore.record.measurementInput"
      :rules="[(val: MeasurementInput) => measurementInputSchema.safeParse(val).success || 'Required']"
      :options="options"
      lazy-rules
      emit-value
      map-options
      options-dense
      dense
      outlined
      color="primary"
    >
      <template v-if="route.name === RouteName.EDIT" v-slot:prepend>
        <QIcon color="warning" :name="Icon.LOCK" />
      </template>
    </QSelect>
  </div>
</template>
