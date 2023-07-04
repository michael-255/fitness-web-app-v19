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
const setIndexes: Ref<null[]> = ref([])

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
    actionStore.record[field] = [undefined] // Empty sets array - actionStore.record?.[field] ??
    setIndexes.value = Array(actionStore.record[field].length).fill(null)
  } else {
    actionStore.record[field] = null // Nulling out other fields
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

function addInputSets(selectedInput: ExerciseInput, field: AnyField) {
  if (currentExerciseInputs.value.includes(selectedInput) && hasMultipleSets.value) {
    if (actionStore.record?.[field] && actionStore.record?.[field].length < Limit.MAX_SETS) {
      actionStore.record[field].push(undefined) // Add default value
      setIndexes.value = Array(actionStore.record[field].length).fill(null)
    }
  }
}

function removeInputSet(selectedInput: ExerciseInput, field: AnyField) {
  if (currentExerciseInputs.value.includes(selectedInput) && hasMultipleSets.value) {
    if (actionStore.record?.[field] && actionStore.record?.[field].length > 1) {
      actionStore.record[field].pop() // Remove last value
      setIndexes.value = Array(actionStore.record[field].length).fill(null)
    }
  }
}

function inspectFormat(val: number[]) {
  return val?.join(', ') || '-'
}
</script>

<template>
  <div class="text-weight-bold text-body1">Exercise Sets</div>

  <div v-if="inspecting" class="q-ml-sm">
    <li v-if="currentExerciseInputs.includes(exerciseInputs.Values.Reps)">
      {{ exerciseInputs.Values.Reps }}:
      {{ inspectFormat(actionStore.record?.reps) }}
    </li>
    <li v-if="currentExerciseInputs.includes(exerciseInputs.Values['Weight (lbs)'])">
      {{ exerciseInputs.Values['Weight (lbs)'] }}:
      {{ inspectFormat(actionStore.record?.weightLbs) }}
    </li>
    <li v-if="currentExerciseInputs.includes(exerciseInputs.Values['Distance (miles)'])">
      {{ exerciseInputs.Values['Distance (miles)'] }}:
      {{ inspectFormat(actionStore.record?.distanceMiles) }}
    </li>
    <li v-if="currentExerciseInputs.includes(exerciseInputs.Values['Duration (minutes)'])">
      {{ exerciseInputs.Values['Duration (minutes)'] }}:
      {{ inspectFormat(actionStore.record?.durationMinutes) }}
    </li>
    <li v-if="currentExerciseInputs.includes(exerciseInputs.Values.Watts)">
      {{ exerciseInputs.Values.Watts }}:
      {{ inspectFormat(actionStore.record?.watts) }}
    </li>
    <li v-if="currentExerciseInputs.includes(exerciseInputs.Values['Speed (mph)'])">
      {{ exerciseInputs.Values['Speed (mph)'] }}:
      {{ inspectFormat(actionStore.record?.speedMph) }}
    </li>
    <li v-if="currentExerciseInputs.includes(exerciseInputs.Values['Calories Burned'])">
      {{ exerciseInputs.Values['Calories Burned'] }}:
      {{ inspectFormat(actionStore.record?.calories) }}
    </li>
    <li v-if="currentExerciseInputs.includes(exerciseInputs.Values.Resistence)">
      {{ exerciseInputs.Values.Resistence }}:
      {{ inspectFormat(actionStore.record?.resistence) }}
    </li>
  </div>

  <div v-else>
    <div class="row q-mb-sm">
      <div class="col">
        Sets organize the inputs you choose for this exercise into numbered groups that also display
        how you previously performed. Multiple sets must be on to use additional sets.
      </div>

      <div v-if="hasMultipleSets" class="column reverse">
        <div>
          <QBtn
            :disable="setIndexes.length === Limit.MAX_SETS"
            color="positive"
            class="q-ml-sm"
            round
            :icon="Icon.ADD"
            @click="addSet()"
          />
          <QBtn
            :disable="setIndexes.length === 1"
            color="negative"
            class="q-ml-sm"
            round
            :icon="Icon.REMOVE"
            @click="removeSet()"
          />
        </div>
      </div>
    </div>

    <div v-for="(_, index) in setIndexes" :key="index" class="row q-mb-md">
      <QBadge
        outline
        v-if="hasMultipleSets"
        size="lg"
        color="primary"
        class="text-bold text-body1 q-mr-sm"
      >
        {{ index + 1 }}
      </QBadge>
      <div class="col">
        <div class="row q-mt-xs">
          <QInput
            v-if="currentExerciseInputs.includes(exerciseInputs.Values.Reps)"
            stack-label
            class="col-6 q-mb-xs"
            type="number"
            filled
            square
            dense
            hint="135 (5, 5, -10, 5, 5)"
            v-model.number="actionStore.record.reps[index]"
            :label="exerciseInputs.Values.Reps"
          />
          <QInput
            v-if="currentExerciseInputs.includes(exerciseInputs.Values['Weight (lbs)'])"
            stack-label
            class="col-6 q-mb-xs"
            type="number"
            filled
            square
            dense
            hint="135 (5, 5, -10, 5, 5)"
            v-model.number="actionStore.record.weightLbs[index]"
            :label="exerciseInputs.Values['Weight (lbs)']"
          />
          <QInput
            v-if="currentExerciseInputs.includes(exerciseInputs.Values['Distance (miles)'])"
            stack-label
            class="col-6 q-mb-xs"
            type="number"
            filled
            square
            dense
            hint="135 (5, 5, -10, 5, 5)"
            v-model.number="actionStore.record.distanceMiles[index]"
            :label="exerciseInputs.Values['Distance (miles)']"
          />
          <QInput
            v-if="currentExerciseInputs.includes(exerciseInputs.Values['Duration (minutes)'])"
            stack-label
            class="col-6 q-mb-xs"
            type="number"
            filled
            square
            dense
            hint="135 (5, 5, -10, 5, 5)"
            v-model.number="actionStore.record.durationMinutes[index]"
            :label="exerciseInputs.Values['Duration (minutes)']"
          />
          <QInput
            v-if="currentExerciseInputs.includes(exerciseInputs.Values.Watts)"
            stack-label
            class="col-6 q-mb-xs"
            type="number"
            filled
            square
            dense
            hint="135 (5, 5, -10, 5, 5)"
            v-model.number="actionStore.record.watts[index]"
            :label="exerciseInputs.Values['Watts']"
          />
          <QInput
            v-if="currentExerciseInputs.includes(exerciseInputs.Values['Speed (mph)'])"
            stack-label
            class="col-6 q-mb-xs"
            type="number"
            filled
            square
            dense
            hint="135 (5, 5, -10, 5, 5)"
            v-model.number="actionStore.record.speedMph[index]"
            :label="exerciseInputs.Values['Speed (mph)']"
          />
          <QInput
            v-if="currentExerciseInputs.includes(exerciseInputs.Values['Calories Burned'])"
            stack-label
            class="col-6 q-mb-xs"
            type="number"
            filled
            square
            dense
            hint="135 (5, 5, -10, 5, 5)"
            v-model.number="actionStore.record.calories[index]"
            :label="exerciseInputs.Values['Calories Burned']"
          />
          <QInput
            v-if="currentExerciseInputs.includes(exerciseInputs.Values.Resistence)"
            stack-label
            class="col-6 q-mb-xs"
            type="number"
            filled
            square
            dense
            hint="135 (5, 5, -10, 5, 5)"
            v-model.number="actionStore.record.resistence[index]"
            :label="exerciseInputs.Values['Resistence']"
          />
        </div>
      </div>
    </div>
  </div>
</template>
