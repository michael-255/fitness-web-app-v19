<script setup lang="ts">
import { Icon } from '@/types/general'
import { AppName } from '@/constants/global'
import { useMeta } from 'quasar'
import { onMounted, ref, type Ref } from 'vue'
import { type AnySubRecord, numberSchema, ExerciseInput } from '@/types/core'
import ResponsivePage from '@/components/ResponsivePage.vue'
import useLogger from '@/composables/useLogger'
import useDialogs from '@/composables/useDialogs'
import useRoutables from '@/composables/useRoutables'
import DB from '@/services/Database'

useMeta({ title: `${AppName} - Active Workout` })

const { log } = useLogger()
const { confirmDialog } = useDialogs()
const { goToDashboard } = useRoutables()

const activeRecords: Ref<AnySubRecord[]> = ref([])
const isFormValid = ref(true)

const testNumber = ref(0)

onMounted(async () => {
  activeRecords.value = (await DB.getActiveRecords()).sub
  console.log('activeRecords', activeRecords.value)
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
              <QInput
                stack-label
                class="col-6 q-mb-xs"
                type="number"
                filled
                square
                dense
                hint="135 (5, 5, -10, 5, 5)"
                v-model.number="testNumber"
                :rules="[validationRule()]"
                :label="ExerciseInput.REPS"
              />
              <QInput
                stack-label
                class="col-6 q-mb-xs"
                type="number"
                filled
                square
                dense
                hint="135 (5, 5, -10, 5, 5)"
                v-model.number="testNumber"
                :rules="[validationRule()]"
                :label="ExerciseInput.WEIGHT"
              />
              <QInput
                stack-label
                class="col-6 q-mb-xs"
                type="number"
                filled
                square
                dense
                hint="135 (5, 5, -10, 5, 5)"
                v-model.number="testNumber"
                :rules="[validationRule()]"
                :label="ExerciseInput.DISTANCE"
              />
              <QInput
                stack-label
                class="col-6 q-mb-xs"
                type="number"
                filled
                square
                dense
                hint="135 (5, 5, -10, 5, 5)"
                v-model.number="testNumber"
                :rules="[validationRule()]"
                :label="ExerciseInput.DURATION"
              />
              <QInput
                stack-label
                class="col-6 q-mb-xs"
                type="number"
                filled
                square
                dense
                hint="135 (5, 5, -10, 5, 5)"
                v-model.number="testNumber"
                :rules="[validationRule()]"
                :label="ExerciseInput.WATTS"
              />
              <QInput
                stack-label
                class="col-6 q-mb-xs"
                type="number"
                filled
                square
                dense
                hint="135 (5, 5, -10, 5, 5)"
                v-model.number="testNumber"
                :rules="[validationRule()]"
                :label="ExerciseInput.SPEED"
              />
              <QInput
                stack-label
                class="col-6 q-mb-xs"
                type="number"
                filled
                square
                dense
                hint="135 (5, 5, -10, 5, 5)"
                v-model.number="testNumber"
                :rules="[validationRule()]"
                :label="ExerciseInput.CALORIES"
              />
              <QInput
                stack-label
                class="col-6 q-mb-xs"
                type="number"
                filled
                square
                dense
                hint="135 (5, 5, -10, 5, 5)"
                v-model.number="testNumber"
                :rules="[validationRule()]"
                :label="ExerciseInput.RESISTANCE"
              />
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
