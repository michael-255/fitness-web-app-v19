<script setup lang="ts">
import { useTimeAgo } from '@vueuse/core'
import { getDisplayDate } from '@/utils/common'
import { Icon } from '@/types/general'
import { uid, useMeta } from 'quasar'
import { ref, type Ref, onUnmounted } from 'vue'
import { AppName } from '@/constants/global'
import { getRecordsCountDisplay } from '@/utils/common'
import {
  SettingKey,
  RecordType,
  RecordGroup,
  type AnyCoreRecord,
  type WorkoutResultRecord,
  type WorkoutRecord,
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
  Object.values(RecordType).reduce((acc, type) => {
    acc[type] = []
    return acc
  }, {} as { [key in RecordType]: AnyCoreRecord[] })
)

const settingsSubscription = DB.liveSettings().subscribe({
  next: (liveSettings) => {
    showDescription.value = liveSettings.find((s) => s.key === SettingKey.DASHBOARD_DESCRIPTIONS)
      ?.value as boolean
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
  const title = DataSchema.getLabel(RecordGroup.CORE, type, 'singular') as string
  const record = (await DB.getRecord(RecordGroup.CORE, id)) as AnyCoreRecord
  const fields = DataSchema.getFields(RecordGroup.CORE, type)
  inspectDialog(title, record, fields)
}

async function onCharts(type: RecordType, id: string) {
  const title = DataSchema.getLabel(
    RecordGroup.CORE,
    uiStore.dashboardSelection,
    'singular'
  ) as string
  chartsDialog(title, type, id)
}

async function onDiscardActiveWorkout(name: string) {
  confirmDialog(
    'Discard Active Workout',
    `Are you sure you want to discard the active workout ${name}? Any progress recorded in the workout will be lost.`,
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
  const activeExerciseResultIds = await Promise.all(
    record.exerciseIds.map(async (exerciseId) => {
      return await DB.createActiveExerciseResultRecord(exerciseId)
    })
  )

  const newWorkoutResult: WorkoutResultRecord = {
    active: true,
    id: uid(),
    type: RecordType.WORKOUT,
    timestamp: Date.now(),
    coreId: record.id,
    note: '',
    exerciseResultIds: activeExerciseResultIds,
  }

  // Setting core workout to active
  record.active = true
  await DB.updateRecord(RecordGroup.CORE, RecordType.WORKOUT, record.id, record)

  // Setting core exercises to active
  await Promise.all(
    record.exerciseIds.map(async (id) => {
      const exercise = (await DB.getRecord(RecordGroup.CORE, id)) as AnyCoreRecord
      exercise.active = true
      return await DB.updateRecord(RecordGroup.CORE, RecordType.EXERCISE, exercise.id, exercise)
    })
  )

  // Add new active result records to database
  await DB.addRecord(RecordGroup.SUB, RecordType.WORKOUT, newWorkoutResult)

  goToActiveWorkout()
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

            <!-- Is Active -->
            <QBadge
              v-if="record.active"
              rounded
              color="warning"
              class="absolute-top-left q-py-none"
              style="left: -4px; top: -6px"
            >
              <span class="text-caption">Active</span>
            </QBadge>

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
                v-if="record?.type === RecordType.WORKOUT && record?.active"
                round
                flat
                color="negative"
                :icon="Icon.DELETE"
                @click="onDiscardActiveWorkout(record?.name)"
              />

              <!-- Favorite Star -->
              <span v-else>
                <QIcon
                  v-if="!record.active"
                  v-show="record.favorited"
                  :name="Icon.FAVORITE_ON"
                  color="warning"
                  size="md"
                  class="cursor-pointer"
                  @click="onUnfavorite(record.id, record.name)"
                />
                <QIcon
                  v-if="!record.active"
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
                      v-if="!record.active"
                      clickable
                      @click="goToEdit(RecordGroup.CORE, record?.type, record?.id)"
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
              v-if="record?.type === RecordType.WORKOUT && record?.active"
              label="Resume Workout"
              color="positive"
              class="full-width"
              :icon="Icon.WORKOUT_RESUME"
              @click="goToActiveWorkout()"
            />

            <QBtn
              v-else-if="record?.type === RecordType.WORKOUT && !record?.active"
              label="Begin Workout"
              color="primary"
              :icon="Icon.WORKOUT_BEGIN"
              class="full-width"
              @click="onBeginWorkout(record as WorkoutRecord)"
            />

            <div v-else-if="record?.active" class="text-center full-width">
              Access limited while active
            </div>

            <QBtn
              v-else-if="record?.type === RecordType.MEASUREMENT"
              label="Take Measurement"
              color="primary"
              class="full-width"
              :icon="Icon.MEASUREMENTS"
              @click="goToCreate(RecordGroup.SUB, RecordType.MEASUREMENT, record?.id)"
            />

            <QBtn
              v-else
              label="Add Exercise Entry"
              color="primary"
              class="full-width"
              :icon="Icon.ADD_NOTE"
              @click="goToCreate(RecordGroup.SUB, RecordType.EXERCISE, record?.id)"
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
          RecordGroup.CORE,
          uiStore.dashboardSelection,
          'singular'
        )}`"
        @click="goToCreate(RecordGroup.CORE, uiStore.dashboardSelection)"
      />
    </div>
  </ResponsivePage>
</template>
