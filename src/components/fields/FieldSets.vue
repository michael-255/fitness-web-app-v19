<script setup lang="ts">
import { type Ref, ref } from 'vue'
import { ExerciseInput, Field, numberSchema } from '@/types/core'
import { Limit, Icon } from '@/types/general'
import type { AnyCoreRecord } from '@/types/core'
import useActionStore from '@/stores/action'
import useCoreIdWatcher from '@/composables/useCoreIdWatcher'
import useLogger from '@/composables/useLogger'
import useDialogs from '@/composables/useDialogs'
import DataSchema from '@/services/DataSchema'

defineProps<{
  inspecting: boolean
}>()

const { log } = useLogger()
const { confirmDialog } = useDialogs()
const actionStore = useActionStore()

const exerciseInputsRef: Ref<ExerciseInput[]> = ref([])
const multipleSetsRef: Ref<boolean> = ref(false)
const setIndexes: Ref<null[]> = ref([])

useCoreIdWatcher((coreRecord: AnyCoreRecord) => {
  exerciseInputsRef.value = (coreRecord?.exerciseInputs ?? []) as ExerciseInput[]
  multipleSetsRef.value = Boolean(coreRecord?.multipleSets)

  // Restrict sets to one if multiple sets is off
  if (!multipleSetsRef.value) {
    setIndexes.value = [null] // Hack to update set lengths
    restrictSets(Field.REPS)
    restrictSets(Field.WEIGHT)
    restrictSets(Field.DISTANCE)
    restrictSets(Field.DURATION)
    restrictSets(Field.WATTS)
    restrictSets(Field.SPEED)
    restrictSets(Field.CALORIES)
    restrictSets(Field.RESISTANCE)
    restrictSets(Field.INCLINE)
    restrictSets(Field.STEPS)
  }

  // Determine which exercise inputs are being used and displayed
  if (exerciseInputsRef.value.length > 0) {
    initSets(ExerciseInput.REPS, Field.REPS)
    initSets(ExerciseInput.WEIGHT, Field.WEIGHT)
    initSets(ExerciseInput.DISTANCE, Field.DISTANCE)
    initSets(ExerciseInput.DURATION, Field.DURATION)
    initSets(ExerciseInput.WATTS, Field.WATTS)
    initSets(ExerciseInput.SPEED, Field.SPEED)
    initSets(ExerciseInput.CALORIES, Field.CALORIES)
    initSets(ExerciseInput.RESISTANCE, Field.RESISTANCE)
    initSets(ExerciseInput.INCLINE, Field.INCLINE)
    initSets(ExerciseInput.STEPS, Field.STEPS)
  } else {
    actionStore.record[Field.SETS_DATA] = {}
  }
})

function restrictSets(field: Field) {
  actionStore.record[Field.SETS_DATA][field] = actionStore.record?.[Field.SETS_DATA]?.[field]
    ? [actionStore.record[Field.SETS_DATA][field][0]] // Single element array for no sets exercise
    : [undefined]
}

function initSets(input: ExerciseInput, field: Field) {
  if (exerciseInputsRef.value.includes(input)) {
    actionStore.record[Field.SETS_DATA][field] = actionStore.record?.[Field.SETS_DATA]?.[field]
      ? actionStore.record[Field.SETS_DATA][field]
      : [undefined] // Initial empty sets array

    // Hack to keep track of number of sets
    setIndexes.value = Array(actionStore.record[Field.SETS_DATA][field].length).fill(null)
  } else {
    delete actionStore.record[Field.SETS_DATA][field]
  }
}

function addSet() {
  addInputSets(ExerciseInput.REPS, Field.REPS)
  addInputSets(ExerciseInput.WEIGHT, Field.WEIGHT)
  addInputSets(ExerciseInput.DISTANCE, Field.DISTANCE)
  addInputSets(ExerciseInput.DURATION, Field.DURATION)
  addInputSets(ExerciseInput.WATTS, Field.WATTS)
  addInputSets(ExerciseInput.SPEED, Field.SPEED)
  addInputSets(ExerciseInput.CALORIES, Field.CALORIES)
  addInputSets(ExerciseInput.RESISTANCE, Field.RESISTANCE)
  addInputSets(ExerciseInput.INCLINE, Field.INCLINE)
  addInputSets(ExerciseInput.STEPS, Field.STEPS)
}

function removeSet() {
  confirmDialog(
    'Remove Last Set',
    'Are you sure you want to remove the last set?',
    Icon.REMOVE_LAST,
    'warning',
    async () => {
      try {
        removeInputSet(ExerciseInput.REPS, Field.REPS)
        removeInputSet(ExerciseInput.WEIGHT, Field.WEIGHT)
        removeInputSet(ExerciseInput.DISTANCE, Field.DISTANCE)
        removeInputSet(ExerciseInput.DURATION, Field.DURATION)
        removeInputSet(ExerciseInput.WATTS, Field.WATTS)
        removeInputSet(ExerciseInput.SPEED, Field.SPEED)
        removeInputSet(ExerciseInput.CALORIES, Field.CALORIES)
        removeInputSet(ExerciseInput.RESISTANCE, Field.RESISTANCE)
        removeInputSet(ExerciseInput.INCLINE, Field.INCLINE)
        removeInputSet(ExerciseInput.STEPS, Field.STEPS)
      } catch (error) {
        log.error('Failed to remove last set', error)
      }
    }
  )
}

function addInputSets(selectedInput: ExerciseInput, field: Field) {
  if (exerciseInputsRef.value.includes(selectedInput)) {
    if (
      actionStore.record?.[Field.SETS_DATA]?.[field] &&
      actionStore.record[Field.SETS_DATA][field].length < Limit.MAX_SETS
    ) {
      actionStore.record[Field.SETS_DATA][field].push(undefined) // Add empty exercise set

      // Hack to keep track of number of sets
      setIndexes.value = Array(actionStore.record[Field.SETS_DATA][field].length).fill(null)
    }
  }
}

function removeInputSet(selectedInput: ExerciseInput, field: Field) {
  if (exerciseInputsRef.value.includes(selectedInput)) {
    if (
      actionStore.record?.[Field.SETS_DATA]?.[field] &&
      actionStore.record[Field.SETS_DATA][field].length > 1
    ) {
      actionStore.record[Field.SETS_DATA][field].pop() // Remove last exercise set

      // Hack to keep track of number of sets
      setIndexes.value = Array(actionStore.record[Field.SETS_DATA][field].length).fill(null)
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
    <li v-for="(input, i) in exerciseInputsRef" :key="i">
      {{ input }}:
      {{
        inspectFormat(actionStore.record?.[Field.SETS_DATA]?.[DataSchema.getFieldForInput(input)])
      }}
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
          <!-- TODO - Hint with last value -->
          <QInput
            v-for="(input, i) in exerciseInputsRef"
            :key="i"
            stack-label
            class="col-6 q-mb-xs"
            type="number"
            filled
            square
            dense
            hint="TODO - Hint with last value"
            v-model.number="
              actionStore.record[Field.SETS_DATA][DataSchema.getFieldForInput(input)][index]
            "
            :rules="[validationRule()]"
            :label="input"
          />
        </div>
      </div>
    </div>
  </div>
</template>
