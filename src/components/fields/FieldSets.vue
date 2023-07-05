<script setup lang="ts">
import { type Ref, ref } from 'vue'
import { ExerciseInput, type AnyField, allFields, numberSchema } from '@/types/core'
import { Limit, Icon } from '@/types/general'
import type { AnyCoreRecord } from '@/types/core'
import useActionStore from '@/stores/action'
import useCoreIdWatcher from '@/composables/useCoreIdWatcher'
import useLogger from '@/composables/useLogger'
import useDialogs from '@/composables/useDialogs'

defineProps<{
  inspecting: boolean
}>()

const { log } = useLogger()
const { confirmDialog } = useDialogs()
const actionStore = useActionStore()

const dataField = allFields.Values.setsData
const exerciseInputsRef: Ref<ExerciseInput[]> = ref([])
const multipleSetsRef: Ref<boolean> = ref(false)
const setIndexes: Ref<null[]> = ref([])

useCoreIdWatcher((coreRecord: AnyCoreRecord) => {
  exerciseInputsRef.value = (coreRecord?.exerciseInputs ?? []) as ExerciseInput[]
  multipleSetsRef.value = Boolean(coreRecord?.multipleSets)

  // Reset sets data field
  actionStore.record[dataField] = {}

  // Restrict sets to one if multiple sets is off
  if (!multipleSetsRef.value) {
    setIndexes.value = [null] // Hack to update set lengths
    restrictSets(allFields.Values.reps)
    restrictSets(allFields.Values.weightLbs)
    restrictSets(allFields.Values.distanceMiles)
    restrictSets(allFields.Values.durationMinutes)
    restrictSets(allFields.Values.watts)
    restrictSets(allFields.Values.speedMph)
    restrictSets(allFields.Values.calories)
    restrictSets(allFields.Values.resistance)
  }

  // Determine which exercise inputs are being used and displayed
  if (exerciseInputsRef.value.length > 0) {
    initSets(ExerciseInput.REPS, allFields.Values.reps)
    initSets(ExerciseInput.WEIGHT, allFields.Values.weightLbs)
    initSets(ExerciseInput.DISTANCE, allFields.Values.distanceMiles)
    initSets(ExerciseInput.DURATION, allFields.Values.durationMinutes)
    initSets(ExerciseInput.WATTS, allFields.Values.watts)
    initSets(ExerciseInput.SPEED, allFields.Values.speedMph)
    initSets(ExerciseInput.CALORIES, allFields.Values.calories)
    initSets(ExerciseInput.RESISTANCE, allFields.Values.resistance)
  } else {
    actionStore.record[dataField] = {}
  }
})

function restrictSets(field: AnyField) {
  actionStore.record[dataField][field] = actionStore.record?.[dataField]?.[field]
    ? [actionStore.record[dataField][field][0]] // Single element array for no sets exercise
    : [undefined]
}

function initSets(input: ExerciseInput, field: AnyField) {
  if (exerciseInputsRef.value.includes(input)) {
    actionStore.record[dataField][field] = actionStore.record?.[dataField]?.[field]
      ? actionStore.record[dataField][field]
      : [undefined] // Initial empty sets array

    // Hack to keep track of number of sets
    setIndexes.value = Array(actionStore.record[dataField][field].length).fill(null)
  } else {
    delete actionStore.record[dataField][field]
  }
}

function addSet() {
  addInputSets(ExerciseInput.REPS, allFields.Values.reps)
  addInputSets(ExerciseInput.WEIGHT, allFields.Values.weightLbs)
  addInputSets(ExerciseInput.DISTANCE, allFields.Values.distanceMiles)
  addInputSets(ExerciseInput.DURATION, allFields.Values.durationMinutes)
  addInputSets(ExerciseInput.WATTS, allFields.Values.watts)
  addInputSets(ExerciseInput.SPEED, allFields.Values.speedMph)
  addInputSets(ExerciseInput.CALORIES, allFields.Values.calories)
  addInputSets(ExerciseInput.RESISTANCE, allFields.Values.resistance)
}

function removeSet() {
  confirmDialog(
    'Remove Last Set',
    'Are you sure you want to remove the last set?',
    Icon.REMOVE_LAST,
    'warning',
    async () => {
      try {
        removeInputSet(ExerciseInput.REPS, allFields.Values.reps)
        removeInputSet(ExerciseInput.WEIGHT, allFields.Values.weightLbs)
        removeInputSet(ExerciseInput.DISTANCE, allFields.Values.distanceMiles)
        removeInputSet(ExerciseInput.DURATION, allFields.Values.durationMinutes)
        removeInputSet(ExerciseInput.WATTS, allFields.Values.watts)
        removeInputSet(ExerciseInput.SPEED, allFields.Values.speedMph)
        removeInputSet(ExerciseInput.CALORIES, allFields.Values.calories)
        removeInputSet(ExerciseInput.RESISTANCE, allFields.Values.resistance)
      } catch (error) {
        log.error('Failed to remove last set', error)
      }
    }
  )
}

function addInputSets(selectedInput: ExerciseInput, field: AnyField) {
  if (exerciseInputsRef.value.includes(selectedInput)) {
    if (
      actionStore.record?.[dataField]?.[field] &&
      actionStore.record[dataField][field].length < Limit.MAX_SETS
    ) {
      actionStore.record[dataField][field].push(undefined) // Add empty exercise set

      // Hack to keep track of number of sets
      setIndexes.value = Array(actionStore.record[dataField][field].length).fill(null)
    }
  }
}

function removeInputSet(selectedInput: ExerciseInput, field: AnyField) {
  if (exerciseInputsRef.value.includes(selectedInput)) {
    if (
      actionStore.record?.[dataField]?.[field] &&
      actionStore.record[dataField][field].length > 1
    ) {
      actionStore.record[dataField][field].pop() // Remove last exercise set

      // Hack to keep track of number of sets
      setIndexes.value = Array(actionStore.record[dataField][field].length).fill(null)
    }
  }
}

function inspectFormat(val: number[]) {
  return val?.join(', ') || '-'
}

function validationRule() {
  return (val: number) => numberSchema.safeParse(val).success || 'Must be 0 or greater'
}
</script>

<template>
  <div class="text-weight-bold text-body1">Exercise Sets</div>

  <div v-if="inspecting" class="q-ml-sm">
    <li v-if="exerciseInputsRef.includes(ExerciseInput.REPS)">
      {{ ExerciseInput.REPS }}:
      {{ inspectFormat(actionStore.record?.[dataField]?.reps) }}
    </li>
    <li v-if="exerciseInputsRef.includes(ExerciseInput.WEIGHT)">
      {{ ExerciseInput.WEIGHT }}:
      {{ inspectFormat(actionStore.record?.[dataField]?.weightLbs) }}
    </li>
    <li v-if="exerciseInputsRef.includes(ExerciseInput.DISTANCE)">
      {{ ExerciseInput.DISTANCE }}:
      {{ inspectFormat(actionStore.record?.[dataField]?.distanceMiles) }}
    </li>
    <li v-if="exerciseInputsRef.includes(ExerciseInput.DURATION)">
      {{ ExerciseInput.DURATION }}:
      {{ inspectFormat(actionStore.record?.[dataField]?.durationMinutes) }}
    </li>
    <li v-if="exerciseInputsRef.includes(ExerciseInput.WATTS)">
      {{ ExerciseInput.WATTS }}:
      {{ inspectFormat(actionStore.record?.[dataField]?.watts) }}
    </li>
    <li v-if="exerciseInputsRef.includes(ExerciseInput.SPEED)">
      {{ ExerciseInput.SPEED }}:
      {{ inspectFormat(actionStore.record?.[dataField]?.speedMph) }}
    </li>
    <li v-if="exerciseInputsRef.includes(ExerciseInput.CALORIES)">
      {{ ExerciseInput.CALORIES }}:
      {{ inspectFormat(actionStore.record?.[dataField]?.calories) }}
    </li>
    <li v-if="exerciseInputsRef.includes(ExerciseInput.RESISTANCE)">
      {{ ExerciseInput.RESISTANCE }}:
      {{ inspectFormat(actionStore.record?.[dataField]?.resistance) }}
    </li>
  </div>

  <div v-else>
    <div class="row q-mb-sm">
      <div class="col">
        Sets organize the inputs you choose for this exercise into numbered groups that also display
        how you previously performed. Multiple sets must be on to use additional sets.
      </div>

      <div v-if="multipleSetsRef" class="column reverse">
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
        v-if="multipleSetsRef"
        size="lg"
        color="secondary"
        class="text-bold text-body1 q-mr-sm"
      >
        {{ index + 1 }}
      </QBadge>
      <div class="col">
        <div class="row q-mt-xs">
          <QInput
            v-if="exerciseInputsRef.includes(ExerciseInput.REPS)"
            stack-label
            class="col-6 q-mb-xs"
            type="number"
            filled
            square
            dense
            hint="135 (5, 5, -10, 5, 5)"
            v-model.number="actionStore.record[dataField].reps[index]"
            :rules="[validationRule()]"
            :label="ExerciseInput.REPS"
          />
          <QInput
            v-if="exerciseInputsRef.includes(ExerciseInput.WEIGHT)"
            stack-label
            class="col-6 q-mb-xs"
            type="number"
            filled
            square
            dense
            hint="135 (5, 5, -10, 5, 5)"
            v-model.number="actionStore.record[dataField].weightLbs[index]"
            :rules="[validationRule()]"
            :label="ExerciseInput.WEIGHT"
          />
          <QInput
            v-if="exerciseInputsRef.includes(ExerciseInput.DISTANCE)"
            stack-label
            class="col-6 q-mb-xs"
            type="number"
            filled
            square
            dense
            hint="135 (5, 5, -10, 5, 5)"
            v-model.number="actionStore.record[dataField].distanceMiles[index]"
            :rules="[validationRule()]"
            :label="ExerciseInput.DISTANCE"
          />
          <QInput
            v-if="exerciseInputsRef.includes(ExerciseInput.DURATION)"
            stack-label
            class="col-6 q-mb-xs"
            type="number"
            filled
            square
            dense
            hint="135 (5, 5, -10, 5, 5)"
            v-model.number="actionStore.record[dataField].durationMinutes[index]"
            :rules="[validationRule()]"
            :label="ExerciseInput.DURATION"
          />
          <QInput
            v-if="exerciseInputsRef.includes(ExerciseInput.WATTS)"
            stack-label
            class="col-6 q-mb-xs"
            type="number"
            filled
            square
            dense
            hint="135 (5, 5, -10, 5, 5)"
            v-model.number="actionStore.record[dataField].watts[index]"
            :rules="[validationRule()]"
            :label="ExerciseInput.WATTS"
          />
          <QInput
            v-if="exerciseInputsRef.includes(ExerciseInput.SPEED)"
            stack-label
            class="col-6 q-mb-xs"
            type="number"
            filled
            square
            dense
            hint="135 (5, 5, -10, 5, 5)"
            v-model.number="actionStore.record[dataField].speedMph[index]"
            :rules="[validationRule()]"
            :label="ExerciseInput.SPEED"
          />
          <QInput
            v-if="exerciseInputsRef.includes(ExerciseInput.CALORIES)"
            stack-label
            class="col-6 q-mb-xs"
            type="number"
            filled
            square
            dense
            hint="135 (5, 5, -10, 5, 5)"
            v-model.number="actionStore.record[dataField].calories[index]"
            :rules="[validationRule()]"
            :label="ExerciseInput.CALORIES"
          />
          <QInput
            v-if="exerciseInputsRef.includes(ExerciseInput.RESISTANCE)"
            stack-label
            class="col-6 q-mb-xs"
            type="number"
            filled
            square
            dense
            hint="135 (5, 5, -10, 5, 5)"
            v-model.number="actionStore.record[dataField].resistance[index]"
            :rules="[validationRule()]"
            :label="ExerciseInput.RESISTANCE"
          />
        </div>
      </div>
    </div>
  </div>
</template>
