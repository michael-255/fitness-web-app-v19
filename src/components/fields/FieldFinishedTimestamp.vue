<script setup lang="ts">
import { date } from 'quasar'
import { onMounted, type Ref, ref } from 'vue'
import { Icon } from '@/types/general'
import { getDisplayDate } from '@/utils/common'
import { allFields } from '@/types/core'
import useActionStore from '@/stores/action'

defineProps<{
  inspecting: boolean
}>()

const actionStore = useActionStore()

const field = allFields.Values.finishedTimestamp
const displayDate: Ref<string | undefined> = ref('')
const datePicker: Ref<string> = ref('')
const timePicker: Ref<string> = ref('')

onMounted(() => {
  const existingTime = actionStore.record[field]
  datePicker.value = date.formatDate(existingTime, 'ddd MMM DD YYYY')
  timePicker.value = date.formatDate(existingTime, 'HH:mm:00')
  updateDisplayDate(existingTime)
})

function updateDisplayDate(timestamp: number) {
  actionStore.record[field] = timestamp
  displayDate.value = date.formatDate(timestamp, 'ddd, YYYY MMM Do, h:mm A')
}

function onPickerUpdate() {
  // Set empty pickers with current time
  datePicker.value = datePicker.value
    ? datePicker.value
    : date.formatDate(Date.now(), 'ddd MMM DD YYYY')
  timePicker.value = timePicker.value ? timePicker.value : date.formatDate(Date.now(), 'HH:mm:00')

  const dateTimestamp = new Date(`${datePicker.value} ${timePicker.value}`).getTime()
  updateDisplayDate(dateTimestamp)
}

function clearDates(): void {
  actionStore.record[field] = undefined
  displayDate.value = undefined
}

function inspectFormat(val: number) {
  return getDisplayDate(val) || '-'
}
</script>

<template>
  <div class="text-weight-bold text-body1">Finished Date</div>

  <div v-if="inspecting">
    {{ inspectFormat(actionStore.record[field]) }}
  </div>

  <QInput v-else v-model="displayDate" dense outlined disable color="primary" hint="Auto formatted">
    <template v-slot:after>
      <!-- Date Picker -->
      <QBtn :icon="Icon.CALENDAR_DATE" color="primary" class="q-px-sm">
        <QPopupProxy>
          <QDate v-model="datePicker" mask="ddd MMM DD YYYY">
            <div class="row items-center justify-end q-gutter-sm">
              <QBtn label="Cancel" flat v-close-popup />
              <QBtn label="OK" color="primary" flat @click="onPickerUpdate()" v-close-popup />
            </div>
          </QDate>
        </QPopupProxy>
      </QBtn>

      <!-- Time Picker -->
      <QBtn :icon="Icon.CLOCK" color="primary" class="q-ml-sm q-px-sm">
        <QPopupProxy>
          <QTime v-model="timePicker" mask="HH:mm:00" now-btn>
            <div class="row items-center justify-end q-gutter-sm">
              <QBtn label="Cancel" flat v-close-popup />
              <QBtn label="OK" color="primary" flat @click="onPickerUpdate()" v-close-popup />
            </div>
          </QTime>
        </QPopupProxy>
      </QBtn>

      <!-- Clear DataTime -->
      <QBtn
        :icon="Icon.CALENDAR_CLEAR"
        color="negative"
        class="q-ml-sm q-px-sm"
        @click="clearDates()"
      />
    </template>
  </QInput>
</template>