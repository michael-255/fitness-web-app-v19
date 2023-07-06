<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue'
import { ExercisePreset, exercisePresetSchema, Field } from '@/types/core'
import useLogger from '@/composables/useLogger'
import useActionStore from '@/stores/action'

defineProps<{
  inspecting: boolean
}>()

const { log } = useLogger()
const actionStore = useActionStore()

const field = Field.EXERCISE_PRESET
const options: Ref<{ value: ExercisePreset; label: ExercisePreset }[]> = ref([])

onMounted(async () => {
  try {
    actionStore.record[field] = actionStore.record[field] ?? []

    options.value = Object.values(ExercisePreset).map((o: ExercisePreset) => ({
      value: o,
      label: o,
    }))
  } catch (error) {
    log.error('Error with exercise preset field', error)
  }
})

function inspectFormat(val: ExercisePreset) {
  return `${val || '-'}`
}
</script>

<template>
  <div class="text-weight-bold text-body1">Exercise Preset</div>

  <div v-if="inspecting">
    {{ inspectFormat(actionStore.record[field]) }}
  </div>

  <div v-else>
    <p>Select a preset for this exercise that represents the type of data you want to record.</p>

    <QSelect
      v-model="actionStore.record[field]"
      :rules="[(val: ExercisePreset) => exercisePresetSchema.safeParse(val).success || 'Required']"
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
