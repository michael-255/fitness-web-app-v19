<script setup lang="ts">
import { useTimeAgo } from '@vueuse/core'
import { getDisplayDate } from '@/utils/common'
import { Icon } from '@/types/general'
import { uid, useMeta } from 'quasar'
import { ref, type Ref, onUnmounted } from 'vue'
import { AppName } from '@/constants/global'
import { getRecordsCountDisplay } from '@/utils/common'
import {
  type AnyCoreRecord,
  type RecordType,
  settingkeys,
  recordGroups,
  recordTypes,
  type WorkoutResultRecord,
  type WorkoutRecord,
  type ExerciseResultRecord,
} from '@/types/core'
import DataSchema from '@/services/DataSchema'
import ResponsivePage from '@/components/ResponsivePage.vue'
import WelcomeOverlay from '@/components/WelcomeOverlay.vue'
import useRoutables from '@/composables/useRoutables'
import useUIStore from '@/stores/ui'
import useLogger from '@/composables/useLogger'
import useDialogs from '@/composables/useDialogs'
import DB from '@/services/Database'

useMeta({ title: `${AppName} - Dashboard` })

const uiStore = useUIStore()
const { log } = useLogger()
const { goToActiveWorkout, goToCreate, goToEdit } = useRoutables()
const { confirmDialog, dismissDialog, inspectDialog, chartsDialog } = useDialogs()

const showDescription: Ref<boolean> = ref(false)
const dashboardOptions = DataSchema.getDashboardOptions()
// Type is used as the key to access related parent records
const dashboardRecords: Ref<{ [key in RecordType]: AnyCoreRecord[] }> = ref(
  recordTypes.options.reduce((acc, type) => {
    acc[type] = []
    return acc
  }, {} as { [key in RecordType]: AnyCoreRecord[] })
)

const settingsSubscription = DB.liveSettings().subscribe({
  next: (liveSettings) => {
    showDescription.value = liveSettings.find(
      (s) => s.key === settingkeys.Values['dashboard-descriptions']
    )?.value as boolean
  },
  error: (error) => {
    log.error('Error fetching live Settings', error)
  },
})

const dashboardSubscription = DB.liveDashboard().subscribe({
  next: (liveDashboard) => {
    dashboardRecords.value = liveDashboard
  },
  error: (error) => {
    log.error('Error fetching live Dashboard', error)
  },
})

onUnmounted(() => {
  settingsSubscription.unsubscribe()
  dashboardSubscription.unsubscribe()
})

async function viewLastNote(note: string) {
  dismissDialog('Last Note', note, Icon.NOTE)
}

async function onFavorite(id: string, name: string) {
  confirmDialog(
    'Favorite',
    `Do you want to favorite ${name}?`,
    Icon.FAVORITE_ON,
    'info',
    async () => {
      try {
        await DB.CoreRecords.update(id, { favorited: true })
        log.info(`${name} favorited`, { id, name })
      } catch (error) {
        log.error('Favorite update failed', error)
      }
    }
  )
}

async function onUnfavorite(id: string, name: string) {
  confirmDialog(
    'Unfavorite',
    `Do you want to unfavorite ${name}?`,
    Icon.FAVORITE_OFF,
    'info',
    async () => {
      try {
        await DB.CoreRecords.update(id, { favorited: false })
        log.info(`${name} unfavorited`, { id, name })
      } catch (error) {
        log.error('Unfavorite update failed', error)
      }
    }
  )
}

async function onInspect(type: RecordType, id: string) {
  const title = DataSchema.getLabel(recordGroups.Values.core, type, 'singular') as string
  const record = (await DB.getRecord(recordGroups.Values.core, id)) as AnyCoreRecord
  const fields = DataSchema.getFields(recordGroups.Values.core, type)
  console.log('record', record)
  inspectDialog(title, record, fields)
}

async function onCharts(type: RecordType, id: string) {
  const title = DataSchema.getLabel(
    recordGroups.Values.core,
    uiStore.dashboardSelection,
    'singular'
  ) as string
  chartsDialog(title, type, id)
}

async function onDiscardActiveWorkout(name: string) {
  confirmDialog(
    'Discard Active Workout',
    `Are you sure you want to discard the active workout ${name}?`,
    Icon.DELETE,
    'negative',
    async () => {
      try {
        await DB.discardActiveRecords()
        log.info('Active workout discarded', { name })
      } catch (error) {
        log.error('Failed to discard active workout', error)
      }
    }
  )
}

async function onBeginWorkout(record: WorkoutRecord) {
  // Need to see if an active workout already exists
  const activeCount = (await DB.getActiveRecords()).count

  if (activeCount > 0) {
    confirmDialog(
      'Replace Active Workout',
      `You already have an active workout. Do you want to replace it with ${record.name}?`,
      Icon.WARN,
      'warning',
      async () => {
        try {
          await DB.discardActiveRecords()
          await beginActiveWorkout(record)
          log.info('Replaced active workout', { replacedBy: record.name })
        } catch (error) {
          log.error('Failed to replace active workout', error)
        }
      }
    )
  } else {
    await beginActiveWorkout(record)
  }
}

async function beginActiveWorkout(record: WorkoutRecord) {
  // TODO - Create Exercise Result Records

  console.log('record', record.exerciseIds)

  const newExerciseResults: ExerciseResultRecord[] = record.exerciseIds.map((exerciseId) => {
    return {
      active: true,
      id: uid(),
      type: recordTypes.Values.exercise,
      timestamp: Date.now(),
      coreId: exerciseId,
      note: '',
      reps: null,
      weightLbs: null,
      distanceMiles: null,
      durationMinutes: null,
      watts: null,
      speedMph: null,
      calories: null,
      resistence: null,
    }
  })

  const newWorkoutResult: WorkoutResultRecord = {
    active: true,
    id: uid(),
    type: recordTypes.Values.workout,
    timestamp: Date.now(),
    coreId: record.id,
    note: '',
    exerciseResultIds: newExerciseResults.map((r) => r.id),
  }

  // Setting core workout to active
  record.active = true
  await DB.updateRecord(recordGroups.Values.core, recordTypes.Values.workout, record.id, record)

  // Setting core exercises to active
  await Promise.all(
    newExerciseResults.map(async (r) => {
      const exercise = (await DB.getRecord(recordGroups.Values.core, r.coreId)) as AnyCoreRecord
      exercise.active = true
      return await DB.updateRecord(
        recordGroups.Values.core,
        recordTypes.Values.exercise,
        exercise.id,
        exercise
      )
    })
  )

  // Add new result records to database
  await DB.addRecord(recordGroups.Values.sub, recordTypes.Values.workout, newWorkoutResult)
  await Promise.all(
    newExerciseResults.map((r) =>
      DB.addRecord(recordGroups.Values.sub, recordTypes.Values.exercise, r)
    )
  )

  goToActiveWorkout(record.id)
}
</script>

<template>
  <ResponsivePage :bannerIcon="Icon.DASHBOARD" bannerTitle="Dashboard">
    <WelcomeOverlay />

    <section class="q-mb-md">
      <p class="text-center text-body1">
        {{ dashboardOptions.find((o) => o.value === uiStore.dashboardSelection)?.label }}
      </p>

      <div class="row justify-center">
        <QBtn
          v-for="(option, i) in dashboardOptions"
          :key="i"
          round
          size="lg"
          class="q-mb-xs q-mx-xs"
          :icon="option.icon"
          :color="uiStore.dashboardSelection === option.value ? 'primary' : 'grey'"
          @click="uiStore.dashboardSelection = option.value"
        />
      </div>
    </section>

    <!-- Dashboard Cards -->
    <div class="row justify-center q-gutter-md">
      <div
        v-for="(record, i) in dashboardRecords[uiStore.dashboardSelection]"
        :key="i"
        class="col-xs-12 col-sm-12 col-md-12 col-lg-5"
      >
        <QCard class="column full-height">
          <QCardSection class="col">
            <p class="text-h6">{{ record.name }}</p>
            <p v-if="showDescription">{{ record.desc }}</p>

            <!-- Top right corner buttons on card -->
            <div class="absolute-top-right q-ma-xs">
              <!-- Note -->
              <QIcon
                v-show="record?.lastSub?.note"
                :name="Icon.NOTE"
                color="primary"
                size="md"
                class="cursor-pointer q-mr-xs"
                @click="viewLastNote(record?.lastSub?.note || '')"
              />

              <!-- Discard Active Workout-->
              <QBtn
                v-if="record?.type === recordTypes.Values.workout && record?.active"
                round
                flat
                color="negative"
                :icon="Icon.DELETE"
                @click="onDiscardActiveWorkout(record?.name)"
              />

              <!-- Favorite Star -->
              <span v-else>
                <QIcon
                  v-show="record.favorited"
                  :name="Icon.FAVORITE_ON"
                  color="warning"
                  size="md"
                  class="cursor-pointer"
                  @click="onUnfavorite(record.id, record.name)"
                />
                <QIcon
                  v-show="!record.favorited"
                  :name="Icon.FAVORITE_OFF"
                  color="grey"
                  size="md"
                  class="cursor-pointer"
                  @click="onFavorite(record.id, record.name)"
                />
              </span>

              <!-- Vertical Actions Menu -->
              <QBtn round flat :icon="Icon.MENU_VERTICAL">
                <QMenu
                  auto-close
                  anchor="top right"
                  transition-show="flip-right"
                  transition-hide="flip-left"
                >
                  <QList>
                    <QItem clickable @click="onCharts(record.type, record.id)">
                      <QItemSection avatar>
                        <QIcon color="accent" :name="Icon.CHARTS" />
                      </QItemSection>
                      <QItemSection>Charts</QItemSection>
                    </QItem>

                    <QItem clickable @click="onInspect(record.type, record.id)">
                      <QItemSection avatar>
                        <QIcon color="primary" :name="Icon.INSPECT" />
                      </QItemSection>
                      <QItemSection>Inspect</QItemSection>
                    </QItem>

                    <QItem
                      clickable
                      @click="goToEdit(recordGroups.Values.core, record?.type, record?.id)"
                    >
                      <QItemSection avatar>
                        <QIcon color="warning" :name="Icon.EDIT" />
                      </QItemSection>
                      <QItemSection>Edit</QItemSection>
                    </QItem>
                  </QList>
                </QMenu>
              </QBtn>
            </div>

            <div class="q-mb-md">
              <!-- Time Ago Display -->
              <QBadge rounded color="secondary" class="q-py-none">
                <QIcon :name="Icon.PREVIOUS" />
                <span class="text-caption q-ml-xs">
                  {{ useTimeAgo(record?.lastSub?.timestamp || '').value || 'No previous records' }}
                </span>
              </QBadge>

              <!-- Previous Record Created Date -->
              <div v-if="record?.lastSub?.timestamp">
                <QIcon :name="Icon.CALENDAR_CHECK" />
                <span class="text-caption q-ml-xs">
                  {{ getDisplayDate(record?.lastSub?.timestamp) }}
                </span>
              </div>
            </div>
          </QCardSection>

          <QCardActions clas="col-auto">
            <QBtn
              v-if="record?.type === recordTypes.Values.workout && record?.active"
              label="Resume Workout"
              color="positive"
              class="full-width"
              :icon="Icon.WORKOUT_RESUME"
              @click="goToActiveWorkout(record?.id)"
            />

            <QBtn
              v-else-if="record?.type === recordTypes.Values.workout && !record?.active"
              label="Begin Workout"
              color="primary"
              :icon="Icon.WORKOUT_BEGIN"
              class="full-width"
              @click="onBeginWorkout(record as WorkoutRecord)"
            />

            <QBtn
              v-else
              label="Add Sub Record"
              color="primary"
              class="full-width"
              :icon="Icon.ADD_NOTE"
              @click="goToCreate(recordGroups.Values.sub, record?.type, record?.id)"
            />
          </QCardActions>
        </QCard>
      </div>
    </div>

    <!-- Record Count & Create -->
    <div class="row justify-center q-mt-md">
      <QIcon class="col-12 text-center" name="menu_open" size="80px" color="grey" />

      <p class="col-12 text-grey text-center">
        {{ getRecordsCountDisplay(dashboardRecords[uiStore.dashboardSelection]) }}
      </p>

      <QBtn
        color="positive"
        :icon="Icon.CREATE"
        :label="`Create ${DataSchema.getLabel(
          recordGroups.Values.core,
          uiStore.dashboardSelection,
          'singular'
        )}`"
        @click="goToCreate(recordGroups.Values.core, uiStore.dashboardSelection)"
      />
    </div>
  </ResponsivePage>
</template>
