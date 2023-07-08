<script setup lang="ts">
import { type Ref, ref } from 'vue'
import {
  Field,
  RecordType,
  exerciseDataFields,
  measurementDataFields,
  numberSchema,
} from '@/types/core'
import { Limit, Icon, RouteName } from '@/types/general'
import type { ExerciseInput, AnyCoreRecord, PreviousData, MeasurementInput } from '@/types/core'
import useActionStore from '@/stores/action'
import useCoreIdWatcher from '@/composables/useCoreIdWatcher'
import useRoutables from '@/composables/useRoutables'
import useLogger from '@/composables/useLogger'
import useDialogs from '@/composables/useDialogs'
import DataSchema from '@/services/DataSchema'

defineProps<{
  inspecting: boolean
}>()

const { log } = useLogger()
const { confirmDialog } = useDialogs()
const { route } = useRoutables()
const actionStore = useActionStore()

const coreExerciseInputs: Ref<ExerciseInput[]> = ref([])
const coreMultipleSets: Ref<boolean> = ref(false)
const corePrevious: Ref<PreviousData> = ref({})

useCoreIdWatcher((coreRecord: AnyCoreRecord) => {
  coreExerciseInputs.value = (coreRecord?.exerciseInputs ?? []) as ExerciseInput[]
  coreMultipleSets.value = Boolean(coreRecord?.multipleSets)
  corePrevious.value = coreRecord?.previous ?? {}

  if (coreRecord?.type === RecordType.MEASUREMENT) {
    // Setup measurement result data fields
    const measurementInput = coreRecord?.measurementInput as MeasurementInput

    measurementDataFields.forEach((field) => {
      if (field === DataSchema.getFieldForInput(measurementInput)) {
        actionStore.record[field] = actionStore.record[field] ?? undefined
      } else {
        delete actionStore.record[field]
      }
    })
  } else if (coreRecord?.type === RecordType.EXERCISE) {
    // Setup exercise result data fields
    const exerciseInputs = (coreRecord?.exerciseInputs ?? []) as ExerciseInput[]
    const inputFields = exerciseInputs.map((input) => DataSchema.getFieldForInput(input)) as Field[]

    exerciseDataFields.forEach((field) => {
      if (inputFields.includes(field)) {
        actionStore.record[field] =
          actionStore.record?.[field]?.length > 1
            ? actionStore.record[field]
            : [actionStore.record?.[field]?.[0]] ?? [undefined]
        actionStore.setIndexes = Array(actionStore.record[field].length).fill(null) // Hack
      } else {
        delete actionStore.record[field]
      }
    })

    if (exerciseInputs.length === 0) {
      actionStore.setIndexes = [] // Hack
    }
  }
})

function addSet() {
  coreExerciseInputs.value.forEach((input) => {
    const field = DataSchema.getFieldForInput(input)

    if (actionStore.record?.[field] && actionStore.record[field].length < Limit.MAX_SETS) {
      actionStore.record[field].push(undefined) // Add empty exercise set
      actionStore.setIndexes = Array(actionStore.record[field].length).fill(null) // Hack
    }
  })
}

function removeSet() {
  confirmDialog(
    'Remove Last Set',
    'Are you sure you want to remove the last set?',
    Icon.REMOVE_LAST,
    'warning',
    async () => {
      try {
        coreExerciseInputs.value.forEach((input) => {
          const field = DataSchema.getFieldForInput(input)

          if (actionStore.record?.[field] && actionStore.record[field].length > 1) {
            actionStore.record[field].pop() // Add empty exercise set
            actionStore.setIndexes = Array(actionStore.record[field].length).fill(null) // Hack
          }
        })
      } catch (error) {
        log.error('Failed to remove last set', error)
      }
    }
  )
}

function previousValue(field: Field, index: number) {
  if (route.name === RouteName.EDIT) {
    return ''
  } else {
    const previousValue = corePrevious.value?.[field as keyof PreviousData]?.[index]
    return previousValue ? String(previousValue) : ''
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
  <!-- Instructional records hide everything -->
  <div v-if="actionStore.setIndexes.length !== 0">
    <div class="text-weight-bold text-body1">Exercise Sets</div>

    <div v-if="inspecting" class="q-ml-sm">
      <li v-for="(input, i) in coreExerciseInputs" :key="i">
        {{ input }}:
        {{ inspectFormat(actionStore.record?.[DataSchema.getFieldForInput(input)]) }}
      </li>
    </div>

    <div v-else>
      <div class="row q-mb-sm">
        <div class="col">
          Sets organize the inputs you choose for this exercise into numbered groups that also
          display how you previously performed. Multiple sets must be on to add more than one set.
        </div>

        <div v-if="coreMultipleSets" class="column reverse">
          <div>
            <QBtn
              :disable="actionStore.setIndexes.length === Limit.MAX_SETS"
              color="positive"
              class="q-ml-sm"
              round
              :icon="Icon.ADD"
              @click="addSet()"
            />
            <QBtn
              :disable="actionStore.setIndexes.length === 1"
              color="negative"
              class="q-ml-sm"
              round
              :icon="Icon.REMOVE"
              @click="removeSet()"
            />
          </div>
        </div>
      </div>

      <div v-for="(_, index) in actionStore.setIndexes" :key="index" class="row q-mb-md">
        <QBadge
          v-if="coreMultipleSets"
          size="lg"
          color="secondary"
          class="text-bold text-body1 q-mr-sm"
        >
          {{ index + 1 }}
        </QBadge>
        <div class="col">
          <div class="row q-mt-xs">
            <QInput
              v-for="(input, i) in coreExerciseInputs"
              :key="i"
              stack-label
              class="col-6 q-mb-xs"
              type="number"
              filled
              square
              dense
              :hint="previousValue(DataSchema.getFieldForInput(input), index)"
              v-model.number="actionStore.record[DataSchema.getFieldForInput(input)][index]"
              :rules="[validationRule()]"
              :label="input"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
