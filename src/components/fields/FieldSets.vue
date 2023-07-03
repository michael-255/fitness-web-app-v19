<script setup lang="ts">
import { type Ref, ref } from 'vue'
import { allFields, exerciseInputs, type ExerciseInput, type AnyField } from '@/types/core'
import { Limit, Icon } from '@/types/general'
import useActionStore from '@/stores/action'
import useExerciseInputsWatcher from '@/composables/useExerciseInputsWatcher'
import useMultipleSetsWatcher from '@/composables/useMultipleSetsWatcher'

defineProps<{
  inspecting: boolean
}>()

const actionStore = useActionStore()
useExerciseInputsWatcher(updateData)
useMultipleSetsWatcher(updateMultipleSets)

const currentExerciseInputs: Ref<ExerciseInput[]> = ref([])
const hasMultipleSets: Ref<boolean> = ref(false)
const setCounter: Ref<number> = ref(0)

function updateMultipleSets(multipleSets: boolean) {
  hasMultipleSets.value = multipleSets
}

function updateData(inputs: ExerciseInput[]) {
  currentExerciseInputs.value = inputs

  // Determine which set fields are being tracked based on the exercise inputs
  if (currentExerciseInputs.value.length > 0) {
    initSets(exerciseInputs.Values.Reps, allFields.Values.reps)
    initSets(exerciseInputs.Values['Weight (lbs)'], allFields.Values.weightLbs)
    initSets(exerciseInputs.Values['Distance (miles)'], allFields.Values.distanceMiles)
    initSets(exerciseInputs.Values['Duration (minutes)'], allFields.Values.durationMinutes)
    initSets(exerciseInputs.Values['Watts'], allFields.Values.watts)
    initSets(exerciseInputs.Values['Speed (mph)'], allFields.Values.speedMph)
    initSets(exerciseInputs.Values['Calories Burned'], allFields.Values.calories)
    initSets(exerciseInputs.Values['Resistence'], allFields.Values.resistence)
  }
}

function initSets(selectedInput: ExerciseInput, field: AnyField) {
  if (currentExerciseInputs.value.includes(selectedInput)) {
    actionStore.record[field] = actionStore.record?.[field] ?? [0] // Empty sets array
    setCounter.value = actionStore.record[field].length
  } else {
    actionStore.record[field] = null // Nulling out other fields
  }
}

function addInputSets(selectedInput: ExerciseInput, field: AnyField) {
  if (currentExerciseInputs.value.includes(selectedInput) && hasMultipleSets.value) {
    if (actionStore.record?.[field] && actionStore.record?.[field].length < Limit.MAX_SETS) {
      actionStore.record[field].push(0) // Add default value
      setCounter.value = actionStore.record[field].length
    }
  }
}

function removeInputSet(selectedInput: ExerciseInput, field: AnyField) {
  if (currentExerciseInputs.value.includes(selectedInput) && hasMultipleSets.value) {
    if (actionStore.record?.[field] && actionStore.record?.[field].length > 1) {
      actionStore.record[field].pop() // Remove last value
      setCounter.value = actionStore.record[field].length
    }
  }
}

function addSet() {
  addInputSets(exerciseInputs.Values.Reps, allFields.Values.reps)
  addInputSets(exerciseInputs.Values['Weight (lbs)'], allFields.Values.weightLbs)
  addInputSets(exerciseInputs.Values['Distance (miles)'], allFields.Values.distanceMiles)
  addInputSets(exerciseInputs.Values['Duration (minutes)'], allFields.Values.durationMinutes)
  addInputSets(exerciseInputs.Values['Watts'], allFields.Values.watts)
  addInputSets(exerciseInputs.Values['Speed (mph)'], allFields.Values.speedMph)
  addInputSets(exerciseInputs.Values['Calories Burned'], allFields.Values.calories)
  addInputSets(exerciseInputs.Values['Resistence'], allFields.Values.resistence)
}

function removeSet() {
  removeInputSet(exerciseInputs.Values.Reps, allFields.Values.reps)
  removeInputSet(exerciseInputs.Values['Weight (lbs)'], allFields.Values.weightLbs)
  removeInputSet(exerciseInputs.Values['Distance (miles)'], allFields.Values.distanceMiles)
  removeInputSet(exerciseInputs.Values['Duration (minutes)'], allFields.Values.durationMinutes)
  removeInputSet(exerciseInputs.Values['Watts'], allFields.Values.watts)
  removeInputSet(exerciseInputs.Values['Speed (mph)'], allFields.Values.speedMph)
  removeInputSet(exerciseInputs.Values['Calories Burned'], allFields.Values.calories)
  removeInputSet(exerciseInputs.Values['Resistence'], allFields.Values.resistence)
}

function inspectFormat(val: number[]) {
  return val?.join(', ') || '-'
}
</script>

<template>
  <div class="text-weight-bold text-body1">Exercise Sets</div>

  <div v-if="inspecting" class="q-ml-sm">
    <li>
      {{ exerciseInputs.Values.Reps }}:
      {{ inspectFormat(actionStore.record?.reps) }}
    </li>
    <li>
      {{ exerciseInputs.Values['Weight (lbs)'] }}:
      {{ inspectFormat(actionStore.record?.weightLbs) }}
    </li>
    <li>
      {{ exerciseInputs.Values['Distance (miles)'] }}:
      {{ inspectFormat(actionStore.record?.distanceMiles) }}
    </li>
    <li>
      {{ exerciseInputs.Values['Duration (minutes)'] }}:
      {{ inspectFormat(actionStore.record?.durationMinutes) }}
    </li>
    <li>
      {{ exerciseInputs.Values.Watts }}:
      {{ inspectFormat(actionStore.record?.watts) }}
    </li>
    <li>
      {{ exerciseInputs.Values['Speed (mph)'] }}:
      {{ inspectFormat(actionStore.record?.speedMph) }}
    </li>
    <li>
      {{ exerciseInputs.Values['Calories Burned'] }}:
      {{ inspectFormat(actionStore.record?.calories) }}
    </li>
    <li>
      {{ exerciseInputs.Values.Resistence }}:
      {{ inspectFormat(actionStore.record?.resistence) }}
    </li>
  </div>

  <!-- TODO - Compare template to v16 version to see how you could design this -->
  <div v-else>
    <QBtn
      :disable="!hasMultipleSets || setCounter === Limit.MAX_SETS"
      round
      color="positive"
      :icon="Icon.ADD"
      @click="addSet()"
    />
    <QBtn
      :disable="!hasMultipleSets || setCounter === 1"
      round
      color="negative"
      :icon="Icon.REMOVE"
      @click="removeSet()"
    />
  </div>
</template>
