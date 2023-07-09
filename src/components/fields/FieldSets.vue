<script setup lang="ts">
import { type Ref, ref } from 'vue'
import { Field, exerciseDataFields, numberSchema } from '@/types/core'
import { Limit, Icon, RouteName } from '@/types/general'
import type { ExerciseInput, AnyCoreRecord, PreviousData } from '@/types/core'
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

  // Do not overwrite existing data during edits
  if (!actionStore.record.id) {
    const inputFields = coreExerciseInputs.value.map((input) =>
      DataSchema.getFieldForInput(input)
    ) as Field[]

    // Building the set object with the correct inputs
    actionStore.record.exerciseSets = [
      exerciseDataFields.reduce((acc, field) => {
        if (inputFields.includes(field)) {
          acc[field] = undefined
          return acc
        } else {
          delete acc[field]
          return acc
        }
      }, {} as { [key in Field]: any }),
    ]
  }
})

function addSet() {
  if (
    actionStore.record?.exerciseSets?.length > 0 &&
    actionStore.record?.exerciseSets?.length < Limit.MAX_SETS
  ) {
    const firstSetCopy = { ...actionStore.record.exerciseSets[0] }

    for (const field in firstSetCopy) {
      firstSetCopy[field] = undefined
    }

    actionStore.record.exerciseSets.push(firstSetCopy)
  }
}

function removeSet() {
  confirmDialog(
    'Remove Last Set',
    'Are you sure you want to remove the last set?',
    Icon.REMOVE_LAST,
    'warning',
    async () => {
      try {
        if (actionStore.record?.exerciseSets?.length > 1) {
          actionStore.record.exerciseSets.pop()
        }
      } catch (error) {
        log.error('Failed to remove last set', error)
      }
    }
  )
}

function previousValue(setIndex: number, field: Field) {
  if (route.name === RouteName.EDIT) {
    return ''
  } else {
    const previousExerciseSet = corePrevious.value?.exerciseSets?.[setIndex] as {
      [key in Field]: any
    }

    if (previousExerciseSet) {
      const previousValue = previousExerciseSet[field]
      return previousValue ? String(previousValue) : ''
    } else {
      return ''
    }
  }
}
</script>

<template>
  <!-- Instructional records hide everything -->
  <div v-if="actionStore.record?.exerciseSets?.length !== 0">
    <div class="text-weight-bold text-body1">Exercise Sets</div>

    <div v-if="inspecting" class="q-ml-sm">
      <div v-for="(exerciseData, setIndex) in actionStore.record.exerciseSets" :key="setIndex">
        Set {{ setIndex + 1 }}
        <li v-for="(value, key) in exerciseData" :key="key" class="q-ml-sm">
          {{ DataSchema.getInputForField(key as any) }}: {{ value }}
        </li>
      </div>
    </div>

    <div v-else>
      <div class="row q-mb-sm">
        <div class="col">
          Sets organize the inputs you choose for this exercise into numbered groups that also
          display how you previously performed. Multiple sets must be enabled to add more than one
          set.
        </div>

        <div v-if="coreMultipleSets" class="column reverse">
          <div>
            <QBtn
              :disable="actionStore.record.exerciseSets.length === Limit.MAX_SETS"
              color="positive"
              class="q-ml-sm"
              round
              :icon="Icon.ADD"
              @click="addSet()"
            />
            <QBtn
              :disable="actionStore.record.exerciseSets.length === 1"
              color="negative"
              class="q-ml-sm"
              round
              :icon="Icon.REMOVE"
              @click="removeSet()"
            />
          </div>
        </div>
      </div>

      <div
        v-for="(setData, setIndex) in actionStore.record.exerciseSets"
        :key="setIndex"
        class="row q-mb-md"
      >
        <QBadge
          v-if="coreMultipleSets"
          size="lg"
          color="secondary"
          class="text-bold text-body1 q-mr-sm"
        >
          {{ setIndex + 1 }}
        </QBadge>
        <div class="col">
          <div class="row q-mt-xs">
            <QInput
              v-for="(key, i) in Object.keys(setData)"
              :key="i"
              stack-label
              class="col-6 q-mb-xs"
              type="number"
              filled
              square
              dense
              :hint="previousValue(setIndex, key as Field)"
              v-model.number="actionStore.record.exerciseSets[setIndex][key]"
              :rules="[(val: number) => numberSchema.safeParse(val).success || 'Must be 0 or greater']"
              :label="DataSchema.getInputForField(key as Field)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
