<script setup lang="ts">
import { type Ref, ref } from 'vue'
import {
  type ExerciseInput,
  type AnyField,
  allFields,
  exerciseInputs,
  numberSchema,
} from '@/types/core'
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

const exerciseInputsRef: Ref<ExerciseInput[]> = ref([])
const multipleSetsRef: Ref<boolean> = ref(false)
const setIndexes: Ref<null[]> = ref([])

useCoreIdWatcher((coreRecord: AnyCoreRecord) => {
  exerciseInputsRef.value = (coreRecord?.exerciseInputs ?? []) as ExerciseInput[]
  multipleSetsRef.value = Boolean(coreRecord?.multipleSets)

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
    restrictSets(allFields.Values.resistence)
  }

  // Determine which exercise inputs are being used and displayed
  if (exerciseInputsRef.value.length > 0) {
    initSets(exerciseInputs.Values.Reps, allFields.Values.reps)
    initSets(exerciseInputs.Values['Weight (lbs)'], allFields.Values.weightLbs)
    initSets(exerciseInputs.Values['Distance (miles)'], allFields.Values.distanceMiles)
    initSets(exerciseInputs.Values['Duration (minutes)'], allFields.Values.durationMinutes)
    initSets(exerciseInputs.Values['Watts'], allFields.Values.watts)
    initSets(exerciseInputs.Values['Speed (mph)'], allFields.Values.speedMph)
    initSets(exerciseInputs.Values['Calories Burned'], allFields.Values.calories)
    initSets(exerciseInputs.Values['Resistence'], allFields.Values.resistence)
  } else {
    // No exercise inputs being display is likely an error
    actionStore.record[allFields.Values.reps] = null
    actionStore.record[allFields.Values.weightLbs] = null
    actionStore.record[allFields.Values.distanceMiles] = null
    actionStore.record[allFields.Values.durationMinutes] = null
    actionStore.record[allFields.Values.watts] = null
    actionStore.record[allFields.Values.speedMph] = null
    actionStore.record[allFields.Values.calories] = null
    actionStore.record[allFields.Values.resistence] = null
  }
})

function restrictSets(field: AnyField) {
  const value = actionStore.record?.[field] ? [actionStore.record?.[field][0]] : [undefined]
  actionStore.record[field] = value
}

function initSets(input: ExerciseInput, field: AnyField) {
  if (exerciseInputsRef.value.includes(input)) {
    actionStore.record[field] = actionStore.record?.[field] ?? [undefined] // Empty sets array
    setIndexes.value = Array(actionStore.record[field].length).fill(null)
  } else {
    actionStore.record[field] = null
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
  confirmDialog(
    'Remove Last Set',
    'Are you sure you want to remove the last set?',
    Icon.REMOVE_LAST,
    'warning',
    async () => {
      try {
        removeInputSet(exerciseInputs.Values.Reps, allFields.Values.reps)
        removeInputSet(exerciseInputs.Values['Weight (lbs)'], allFields.Values.weightLbs)
        removeInputSet(exerciseInputs.Values['Distance (miles)'], allFields.Values.distanceMiles)
        removeInputSet(
          exerciseInputs.Values['Duration (minutes)'],
          allFields.Values.durationMinutes
        )
        removeInputSet(exerciseInputs.Values['Watts'], allFields.Values.watts)
        removeInputSet(exerciseInputs.Values['Speed (mph)'], allFields.Values.speedMph)
        removeInputSet(exerciseInputs.Values['Calories Burned'], allFields.Values.calories)
        removeInputSet(exerciseInputs.Values['Resistence'], allFields.Values.resistence)
      } catch (error) {
        log.error('Failed to remove last set', error)
      }
    }
  )
}

function addInputSets(selectedInput: ExerciseInput, field: AnyField) {
  if (exerciseInputsRef.value.includes(selectedInput)) {
    if (actionStore.record?.[field] && actionStore.record?.[field].length < Limit.MAX_SETS) {
      actionStore.record[field].push(undefined) // Add empty value
      setIndexes.value = Array(actionStore.record[field].length).fill(null)
    }
  }
}

function removeInputSet(selectedInput: ExerciseInput, field: AnyField) {
  if (exerciseInputsRef.value.includes(selectedInput)) {
    if (actionStore.record?.[field] && actionStore.record?.[field].length > 1) {
      actionStore.record[field].pop() // Remove last value
      setIndexes.value = Array(actionStore.record[field].length).fill(null)
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
    <li v-if="exerciseInputsRef.includes(exerciseInputs.Values.Reps)">
      {{ exerciseInputs.Values.Reps }}:
      {{ inspectFormat(actionStore.record?.reps) }}
    </li>
    <li v-if="exerciseInputsRef.includes(exerciseInputs.Values['Weight (lbs)'])">
      {{ exerciseInputs.Values['Weight (lbs)'] }}:
      {{ inspectFormat(actionStore.record?.weightLbs) }}
    </li>
    <li v-if="exerciseInputsRef.includes(exerciseInputs.Values['Distance (miles)'])">
      {{ exerciseInputs.Values['Distance (miles)'] }}:
      {{ inspectFormat(actionStore.record?.distanceMiles) }}
    </li>
    <li v-if="exerciseInputsRef.includes(exerciseInputs.Values['Duration (minutes)'])">
      {{ exerciseInputs.Values['Duration (minutes)'] }}:
      {{ inspectFormat(actionStore.record?.durationMinutes) }}
    </li>
    <li v-if="exerciseInputsRef.includes(exerciseInputs.Values.Watts)">
      {{ exerciseInputs.Values.Watts }}:
      {{ inspectFormat(actionStore.record?.watts) }}
    </li>
    <li v-if="exerciseInputsRef.includes(exerciseInputs.Values['Speed (mph)'])">
      {{ exerciseInputs.Values['Speed (mph)'] }}:
      {{ inspectFormat(actionStore.record?.speedMph) }}
    </li>
    <li v-if="exerciseInputsRef.includes(exerciseInputs.Values['Calories Burned'])">
      {{ exerciseInputs.Values['Calories Burned'] }}:
      {{ inspectFormat(actionStore.record?.calories) }}
    </li>
    <li v-if="exerciseInputsRef.includes(exerciseInputs.Values.Resistence)">
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
            v-if="exerciseInputsRef.includes(exerciseInputs.Values.Reps)"
            stack-label
            class="col-6 q-mb-xs"
            type="number"
            filled
            square
            dense
            hint="135 (5, 5, -10, 5, 5)"
            v-model.number="actionStore.record.reps[index]"
            :rules="[validationRule()]"
            :label="exerciseInputs.Values.Reps"
          />
          <QInput
            v-if="exerciseInputsRef.includes(exerciseInputs.Values['Weight (lbs)'])"
            stack-label
            class="col-6 q-mb-xs"
            type="number"
            filled
            square
            dense
            hint="135 (5, 5, -10, 5, 5)"
            v-model.number="actionStore.record.weightLbs[index]"
            :rules="[validationRule()]"
            :label="exerciseInputs.Values['Weight (lbs)']"
          />
          <QInput
            v-if="exerciseInputsRef.includes(exerciseInputs.Values['Distance (miles)'])"
            stack-label
            class="col-6 q-mb-xs"
            type="number"
            filled
            square
            dense
            hint="135 (5, 5, -10, 5, 5)"
            v-model.number="actionStore.record.distanceMiles[index]"
            :rules="[validationRule()]"
            :label="exerciseInputs.Values['Distance (miles)']"
          />
          <QInput
            v-if="exerciseInputsRef.includes(exerciseInputs.Values['Duration (minutes)'])"
            stack-label
            class="col-6 q-mb-xs"
            type="number"
            filled
            square
            dense
            hint="135 (5, 5, -10, 5, 5)"
            v-model.number="actionStore.record.durationMinutes[index]"
            :rules="[validationRule()]"
            :label="exerciseInputs.Values['Duration (minutes)']"
          />
          <QInput
            v-if="exerciseInputsRef.includes(exerciseInputs.Values.Watts)"
            stack-label
            class="col-6 q-mb-xs"
            type="number"
            filled
            square
            dense
            hint="135 (5, 5, -10, 5, 5)"
            v-model.number="actionStore.record.watts[index]"
            :rules="[validationRule()]"
            :label="exerciseInputs.Values['Watts']"
          />
          <QInput
            v-if="exerciseInputsRef.includes(exerciseInputs.Values['Speed (mph)'])"
            stack-label
            class="col-6 q-mb-xs"
            type="number"
            filled
            square
            dense
            hint="135 (5, 5, -10, 5, 5)"
            v-model.number="actionStore.record.speedMph[index]"
            :rules="[validationRule()]"
            :label="exerciseInputs.Values['Speed (mph)']"
          />
          <QInput
            v-if="exerciseInputsRef.includes(exerciseInputs.Values['Calories Burned'])"
            stack-label
            class="col-6 q-mb-xs"
            type="number"
            filled
            square
            dense
            hint="135 (5, 5, -10, 5, 5)"
            v-model.number="actionStore.record.calories[index]"
            :rules="[validationRule()]"
            :label="exerciseInputs.Values['Calories Burned']"
          />
          <QInput
            v-if="exerciseInputsRef.includes(exerciseInputs.Values.Resistence)"
            stack-label
            class="col-6 q-mb-xs"
            type="number"
            filled
            square
            dense
            hint="135 (5, 5, -10, 5, 5)"
            v-model.number="actionStore.record.resistence[index]"
            :rules="[validationRule()]"
            :label="exerciseInputs.Values['Resistence']"
          />
        </div>
      </div>
    </div>
  </div>
</template>
