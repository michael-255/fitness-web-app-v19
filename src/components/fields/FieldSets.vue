<script setup lang="ts">
import { type Ref, ref } from 'vue'
import { Field, numberSchema } from '@/types/core'
import { Limit, Icon } from '@/types/general'
import type { ExerciseInput, AnyCoreRecord } from '@/types/core'
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
const previous = ref({} as any)

useCoreIdWatcher((coreRecord: AnyCoreRecord) => {
  exerciseInputsRef.value = (coreRecord?.[Field.EXERCISE_INPUTS] ?? []) as ExerciseInput[]
  multipleSetsRef.value = Boolean(coreRecord?.[Field.MULTIPLE_SETS])
  previous.value = coreRecord?.previous
})

function addSet() {
  exerciseInputsRef.value.forEach((input) => {
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
        exerciseInputsRef.value.forEach((input) => {
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

function previousValue(field: Field) {
  const previousValue = previous.value[field]
  return previousValue ? previousValue : ''
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
      <li v-for="(input, i) in exerciseInputsRef" :key="i">
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

        <div v-if="multipleSetsRef" class="column reverse">
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
              v-for="(input, i) in exerciseInputsRef"
              :key="i"
              stack-label
              class="col-6 q-mb-xs"
              type="number"
              filled
              square
              dense
              :hint="previousValue(DataSchema.getFieldForInput(input))"
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
