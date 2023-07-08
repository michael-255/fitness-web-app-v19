<script setup lang="ts">
import { Icon } from '@/types/general'
import {
  type AnyRecord,
  type RecordGroup,
  type AnyCoreRecord,
  RecordType,
  Field,
  measurementDataFields,
  exerciseDataFields,
  MeasurementInput,
  ExerciseInput,
} from '@/types/core'
import { onMounted, onUnmounted, ref } from 'vue'
import { extend, useMeta } from 'quasar'
import { AppName } from '@/constants/global'
import DataSchema from '@/services/DataSchema'
import ErrorStates from '@/components/ErrorStates.vue'
import ResponsivePage from '@/components/ResponsivePage.vue'
import useCoreIdWatcher from '@/composables/useCoreIdWatcher'
import useRoutables from '@/composables/useRoutables'
import useActionStore from '@/stores/action'
import useLogger from '@/composables/useLogger'
import useDialogs from '@/composables/useDialogs'
import DB from '@/services/Database'

useMeta({ title: `${AppName} - Edit Record` })

const { routeGroup, routeType, routeId, goBack } = useRoutables()
const { log } = useLogger()
const { confirmDialog } = useDialogs()
const actionStore = useActionStore()

const label = DataSchema.getLabel(routeGroup as RecordGroup, routeType as RecordType, 'singular')
const fields = DataSchema.getFields(routeGroup as RecordGroup, routeType as RecordType)
const isFormValid = ref(true)

onMounted(async () => {
  try {
    const editRecord = (await DB.getRecord(
      routeGroup as RecordGroup,
      routeId as string
    )) as AnyRecord

    if (editRecord) {
      extend(true, actionStore.record, editRecord)
    } else {
      throw new Error('Record not found')
    }
  } catch (error) {
    log.error('Error loading edit view', error)
  }
})

useCoreIdWatcher((coreRecord: AnyCoreRecord) => {
  const type = coreRecord?.[Field.TYPE]

  if (type === RecordType.MEASUREMENT) {
    const measurementInput = coreRecord?.[Field.MEASUREMENT_INPUT] as MeasurementInput

    measurementDataFields.forEach((field) => {
      if (field === DataSchema.getFieldForInput(measurementInput)) {
        actionStore.record[field] = actionStore.record[field] ?? undefined
      } else {
        delete actionStore.record[field]
      }
    })
  } else if (type === RecordType.EXERCISE) {
    const exerciseInputs = (coreRecord?.[Field.EXERCISE_INPUTS] ?? []) as ExerciseInput[]
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

onUnmounted(() => {
  actionStore.$reset()
})

async function onSubmit() {
  confirmDialog('Update', `Update ${label} record?`, Icon.EDIT, 'positive', async () => {
    try {
      const deepRecordCopy = extend(true, {}, actionStore.record) as AnyRecord
      await DB.putRecord(routeGroup as RecordGroup, routeType as RecordType, deepRecordCopy)

      log.info('Successfully updated record', {
        id: deepRecordCopy[Field.ID],
        type: routeType,
      })

      goBack()
    } catch (error) {
      log.error('Edit failed', error)
    }
  })
}
</script>

<template>
  <ResponsivePage :bannerIcon="Icon.EDIT" :bannerTitle="`Edit ${label}`">
    <div v-if="label && fields">
      <QForm
        @submit="onSubmit"
        @validation-error="isFormValid = false"
        @validation-success="isFormValid = true"
      >
        <!-- Dynamic Async Components -->
        <div v-for="(field, i) in fields" :key="i" class="q-mb-md">
          <component :is="field" :inspecting="false" />
        </div>

        <!-- Submit -->
        <div v-if="!actionStore.record[Field.ACTIVE]" class="row justify-center q-my-sm">
          <QBtn label="Update" type="submit" color="positive" :icon="Icon.SAVE" />
        </div>
        <div v-else class="row justify-center q-my-sm">
          <QBtn disable label="Active" color="warning" :icon="Icon.LOCK" />
        </div>

        <!-- Validation Message -->
        <div class="row justify-center">
          <div v-show="!isFormValid">
            <QIcon :name="Icon.WARN" color="warning" />
            <span class="text-caption q-ml-xs text-warning">
              Correct invalid entries and try again
            </span>
          </div>
        </div>
      </QForm>
    </div>

    <ErrorStates v-else error="unknown" />
  </ResponsivePage>
</template>
