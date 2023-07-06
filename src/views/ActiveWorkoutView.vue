<script setup lang="ts">
import { Icon } from '@/types/general'
import { AppName } from '@/constants/global'
import { useMeta } from 'quasar'
import { onMounted, ref, type Ref } from 'vue'
import {
  type AnySubRecord,
  numberSchema,
  ExerciseInput,
  type AnyCoreRecord,
  RecordType,
} from '@/types/core'
import ResponsivePage from '@/components/ResponsivePage.vue'
import useLogger from '@/composables/useLogger'
import useDialogs from '@/composables/useDialogs'
import useRoutables from '@/composables/useRoutables'
import DB from '@/services/Database'

useMeta({ title: `${AppName} - Active Workout` })

const { log } = useLogger()
const { confirmDialog } = useDialogs()
const { goToDashboard } = useRoutables()

const activeRecords: Ref<{
  core: AnyCoreRecord[]
  sub: AnySubRecord[]
  count: number
}> = ref({} as { core: AnyCoreRecord[]; sub: AnySubRecord[]; count: number })
const isFormValid = ref(true)

const testNumber = ref(0)

onMounted(async () => {
  activeRecords.value = await DB.getActiveRecords()
  const activeWorkout = activeRecords.value.core.find((r) => r.type === RecordType.WORKOUT)
  console.log('activeRecords', activeRecords.value)
  console.log('activeWorkout', activeWorkout)
})

async function onSubmit() {
  confirmDialog(
    'Finish Workout',
    'Are you ready to finish and save this workout?',
    Icon.SAVE,
    'positive',
    async () => {
      try {
        await DB.keepActiveRecords()
        goToDashboard()
      } catch (error) {
        log.error('Failed to finish active workout', error)
      }
    }
  )
}

function validationRule() {
  return (val: number) => numberSchema.safeParse(val).success || 'Must be 0 or greater'
}
</script>

<template>
  <ResponsivePage>
    <QForm
      @submit="onSubmit"
      @validation-error="isFormValid = false"
      @validation-success="isFormValid = true"
    >
      <!-- Active Exercises -->
      <div>
        <div v-for="(record, i) in activeRecords" :key="i" class="row q-mb-md">
          <QBadge size="lg" color="secondary" class="text-bold text-body1 q-mr-sm">
            {{ i + 1 }}
          </QBadge>
          <div class="col">
            <div class="row q-mt-xs">
              <!-- TODO - Hint with last value -->
              <!-- <QInput
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
              /> -->
            </div>
          </div>
        </div>
      </div>

      <!-- Submit -->
      <div class="row justify-center q-my-sm">
        <QBtn label="Finish Workout" type="submit" color="positive" :icon="Icon.SAVE" />
      </div>

      <!-- Validation Message -->
      <div v-show="!isFormValid" class="row justify-center">
        <QIcon :name="Icon.WARN" color="warning" />
        <span class="text-caption q-ml-xs text-warning">
          Correct invalid entries and try again
        </span>
      </div>
    </QForm>
  </ResponsivePage>
</template>
