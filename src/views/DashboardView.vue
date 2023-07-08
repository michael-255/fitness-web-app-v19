<script setup lang="ts">
import { useTimeAgo } from '@vueuse/core'
import { getDisplayDate } from '@/utils/common'
import { Icon } from '@/types/general'
import { useMeta } from 'quasar'
import { ref, type Ref, onUnmounted } from 'vue'
import { AppName } from '@/constants/global'
import { getRecordsCountDisplay } from '@/utils/common'
import {
  SettingKey,
  RecordType,
  RecordGroup,
  type AnyCoreRecord,
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

async function viewPreviousNote(note: string) {
  dismissDialog('Previous Note', note, Icon.NOTE)
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
  await DB.beginWorkout(record)
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
            <p v-show="showDescription">{{ record.desc }}</p>

            <!-- Is Active -->
            <QBadge
              v-if="record.active"
              rounded
              color="warning"
              class="absolute-top-left q-py-none"
              style="left: -4px; top: -6px"
            >
              <QIcon :name="Icon.LOCK" />
              <span class="text-caption q-ml-xs">Active</span>
            </QBadge>

            <!-- Top right corner buttons on card -->
            <div class="absolute-top-right q-ma-xs">
              <!-- Note -->
              <QIcon
                v-show="record?.previous?.note"
                :name="Icon.NOTE"
                color="primary"
                size="md"
                class="cursor-pointer q-mr-xs"
                @click="viewPreviousNote(record?.previous?.note || '')"
              />

              <!-- Discard Active Workout-->
              <QBtn
                v-if="record?.active && record?.type === RecordType.WORKOUT"
                round
                flat
                color="negative"
                :icon="Icon.DELETE"
                @click="onDiscardActiveWorkout(record?.name)"
              />

              <!-- Favorite Star -->
              <span v-else>
                <QIcon
                  v-if="!record.active && record.favorited"
                  :name="Icon.FAVORITE_ON"
                  color="warning"
                  size="md"
                  class="cursor-pointer"
                  @click="onUnfavorite(record.id, record.name)"
                />
                <QIcon
                  v-if="!record.active && !record.favorited"
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
                      :disable="record.active"
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

            <!-- Time Ago Display -->
            <QBadge rounded color="secondary" class="q-py-none">
              <QIcon :name="Icon.PREVIOUS" />
              <span class="text-caption q-ml-xs">
                {{ useTimeAgo(record?.previous?.timestamp || '').value || 'No previous records' }}
              </span>
            </QBadge>

            <!-- Previous Created Date -->
            <div v-show="record?.previous?.timestamp">
              <QIcon :name="Icon.CALENDAR_CHECK" />
              <span class="text-caption q-ml-xs">
                {{ getDisplayDate(record?.previous?.timestamp) }}
              </span>
            </div>

            <!-- Previous Workout Data -->
            <div v-show="record?.previous?.workoutDuration">
              <QIcon :name="Icon.STOPWATCH" />
              <span class="text-caption q-ml-xs">
                {{ record?.previous?.workoutDuration }}
              </span>
            </div>

            <!-- Previous Measurement Data -->
            <div v-show="record?.previous?.bodyWeight">
              <QIcon :name="Icon.MEASUREMENTS" />
              <span class="text-caption q-ml-xs">
                {{ record?.previous?.bodyWeight }}
              </span>
            </div>

            <div v-show="record?.previous?.percent">
              <QIcon :name="Icon.MEASUREMENTS" />
              <span class="text-caption q-ml-xs">
                {{ record?.previous?.percent }}
              </span>
            </div>

            <div v-show="record?.previous?.inches">
              <QIcon :name="Icon.MEASUREMENTS" />
              <span class="text-caption q-ml-xs">
                {{ record?.previous?.inches }}
              </span>
            </div>

            <div v-show="record?.previous?.lbs">
              <QIcon :name="Icon.MEASUREMENTS" />
              <span class="text-caption q-ml-xs">
                {{ record?.previous?.lbs }}
              </span>
            </div>

            <div v-show="record?.previous?.number">
              <QIcon :name="Icon.MEASUREMENTS" />
              <span class="text-caption q-ml-xs">
                {{ record?.previous?.number }}
              </span>
            </div>

            <!-- Previous Exercise Data -->
            <div v-show="record?.previous?.reps">
              <QIcon :name="Icon.REPS" />
              <span class="text-caption q-ml-xs"> {{ record?.previous?.reps }} reps </span>
            </div>

            <div v-show="record?.previous?.weightLbs">
              <QIcon :name="Icon.WEIGHT" />
              <span class="text-caption q-ml-xs"> {{ record?.previous?.weightLbs }} lbs </span>
            </div>

            <div v-show="record?.previous?.distanceMiles">
              <QIcon :name="Icon.DISTANCE" />
              <span class="text-caption q-ml-xs"> {{ record?.previous?.distanceMiles }} mi </span>
            </div>

            <div v-show="record?.previous?.durationMinutes">
              <QIcon :name="Icon.DURATION" />
              <span class="text-caption q-ml-xs">
                {{ record?.previous?.durationMinutes }} minutes
              </span>
            </div>

            <div v-show="record?.previous?.watts">
              <QIcon :name="Icon.WATTS" />
              <span class="text-caption q-ml-xs"> {{ record?.previous?.watts }} watts </span>
            </div>

            <div v-show="record?.previous?.speedMph">
              <QIcon :name="Icon.SPEED" />
              <span class="text-caption q-ml-xs"> {{ record?.previous?.speedMph }} mph </span>
            </div>

            <div v-show="record?.previous?.resistance">
              <QIcon :name="Icon.RESISTANCE" />
              <span class="text-caption q-ml-xs">
                {{ record?.previous?.resistance }} resistance
              </span>
            </div>

            <div v-show="record?.previous?.incline">
              <QIcon :name="Icon.INCLINE" />
              <span class="text-caption q-ml-xs"> {{ record?.previous?.incline }} incline </span>
            </div>

            <div v-show="record?.previous?.calories">
              <QIcon :name="Icon.CALORIES" />
              <span class="text-caption q-ml-xs"> {{ record?.previous?.calories }} calories </span>
            </div>
          </QCardSection>

          <QCardActions clas="col-auto">
            <!-- Workout Only Card Buttons -->
            <QBtn
              v-if="record?.active && record?.type === RecordType.WORKOUT"
              label="Resume Workout"
              color="positive"
              class="full-width"
              :icon="Icon.WORKOUT_RESUME"
              @click="goToActiveWorkout()"
            />

            <QBtn
              v-else-if="!record?.active && record?.type === RecordType.WORKOUT"
              label="Begin Workout"
              color="primary"
              :icon="Icon.WORKOUT_BEGIN"
              class="full-width"
              @click="onBeginWorkout(record as WorkoutRecord)"
            />

            <div v-else-if="record?.active" class="text-center full-width">
              Access limited while active
            </div>

            <!-- Measurements Only Card Button-->
            <QBtn
              v-else-if="record?.type === RecordType.MEASUREMENT"
              label="Take Measurement"
              color="primary"
              class="full-width"
              :icon="Icon.MEASUREMENTS"
              @click="goToCreate(RecordGroup.SUB, RecordType.MEASUREMENT, record?.id)"
            />

            <!-- Exercises Only Card Button-->
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
      <p class="col-12 text-grey text-center text-body1">
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
