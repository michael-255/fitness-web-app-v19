<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue'
import { ExerciseInput, Field, exerciseInputsSchema } from '@/types/core'
import useLogger from '@/composables/useLogger'
import useActionStore from '@/stores/action'

defineProps<{
  inspecting: boolean
}>()

const { log } = useLogger()
const actionStore = useActionStore()

const field = Field.EXERCISE_INPUTS
const options: Ref<{ value: ExerciseInput; label: ExerciseInput }[]> = ref([])

onMounted(async () => {
  try {
    actionStore.record[field] = actionStore.record[field] ?? []

    options.value = Object.values(ExerciseInput).map((o: ExerciseInput) => ({
      value: o,
      label: o,
    }))
  } catch (error) {
    log.error('Error with exercise inputs field', error)
  }
})

function inspectFormat(val: ExerciseInput[]) {
  return val?.join(', ') || '-'
}
</script>

<template>
  <div class="text-weight-bold text-body1">Exercise Inputs</div>

  <div v-if="inspecting">{{ inspectFormat(actionStore.record[field]) }}</div>

  <div v-else>
    <p>
      Select inputs that represents the type of data you want to record. Select no inputs if you
      want the exercise to be purely instructional.
    </p>

    <QSelect
      v-model="actionStore.record[field]"
      :rules="[(val: ExerciseInput[]) => exerciseInputsSchema.safeParse(val).success || 'Required']"
      :options="options"
      lazy-rules
      multiple
      counter
      emit-value
      map-options
      options-dense
      dense
      outlined
      color="primary"
    />
  </div>
</template>
