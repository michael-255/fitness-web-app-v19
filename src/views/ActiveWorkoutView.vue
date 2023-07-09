<script setup lang="ts">
import { Icon } from '@/types/general'
import { AppName } from '@/constants/global'
import { useMeta } from 'quasar'
import { onMounted, ref, type Ref } from 'vue'
import { numberSchema, type ActiveWorkoutRecord } from '@/types/core'
import ResponsivePage from '@/components/ResponsivePage.vue'
import useLogger from '@/composables/useLogger'
import useDialogs from '@/composables/useDialogs'
import useRoutables from '@/composables/useRoutables'
import DB from '@/services/Database'
import DataSchema from '@/services/DataSchema'

useMeta({ title: `${AppName} - Active Workout` })

const { log } = useLogger()
const { confirmDialog } = useDialogs()
const { goToDashboard } = useRoutables()

const activeWorkout: Ref<ActiveWorkoutRecord | undefined> = ref(undefined)
const isFormValid = ref(true)

onMounted(async () => {
  activeWorkout.value = await DB.getActiveWorkout()
  console.log('activeWorkout:', activeWorkout.value) // TODO - Temp
})

async function onSubmit() {
  confirmDialog(
    'Finish Workout',
    'Are you ready to finish and save this workout?',
    Icon.SAVE,
    'positive',
    async () => {
      try {
        await DB.finishActiveWorkout()
        goToDashboard()
      } catch (error) {
        log.error('Failed to finish active workout', error)
      }
    }
  )
}
</script>

<template>
  <ResponsivePage>
    <QForm
      @submit="onSubmit"
      @validation-error="isFormValid = false"
      @validation-success="isFormValid = true"
    >
      <!-- Active Workout -->
      <div v-if="activeWorkout">
        <div v-for="(exercise, i) in activeWorkout.exercises" :key="i">
          <div class="text-h6">{{ exercise.name }}</div>
          <div>{{ exercise.desc }}</div>

          <div class="q-my-md">
            <QBtn color="positive" class="q-ml-sm" round :icon="Icon.ADD" />
            <QBtn color="negative" class="q-ml-sm" round :icon="Icon.REMOVE" />
          </div>

          <div
            v-for="(exerciseSet, setIndex) in exercise.exerciseSets"
            :key="setIndex"
            class="row q-mb-md"
          >
            <QBadge size="lg" color="secondary" class="text-bold text-body1 q-mr-sm">
              {{ setIndex + 1 }}
            </QBadge>
            <div class="col">
              <div class="row q-mt-xs">
                <QInput
                  v-for="(input, i) in exercise.exerciseInputs"
                  :key="i"
                  stack-label
                  class="col-6 q-mb-xs"
                  type="number"
                  filled
                  square
                  dense
                  hint="TODO"
                  v-model.number="exerciseSet[DataSchema.getFieldForInput(input)]"
                  :rules="[(val: number) => numberSchema.safeParse(val).success || 'Must be 0 or greater']"
                  :label="input"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-h6">No active workout available</div>

      <!-- Submit -->
      <div v-if="activeWorkout" class="row justify-center q-my-sm">
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
