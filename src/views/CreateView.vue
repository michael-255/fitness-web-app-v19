<script setup lang="ts">
import { Icon } from '@/types/general'
import { type AnyRecord, RecordGroup, RecordType } from '@/types/core'
import { onMounted, onUnmounted, ref } from 'vue'
import { extend, uid, useMeta } from 'quasar'
import { AppName } from '@/constants/global'
import DataSchema from '@/services/DataSchema'
import ErrorStates from '@/components/ErrorStates.vue'
import ResponsivePage from '@/components/ResponsivePage.vue'
import useRoutables from '@/composables/useRoutables'
import useActionStore from '@/stores/action'
import useLogger from '@/composables/useLogger'
import useDialogs from '@/composables/useDialogs'
import DB from '@/services/Database'

useMeta({ title: `${AppName} - Create Record` })

const { routeGroup, routeType, routeCoreId, goBack } = useRoutables()
const { log } = useLogger()
const { confirmDialog } = useDialogs()
const actionStore = useActionStore()

const label = DataSchema.getLabel(routeGroup as RecordGroup, routeType as RecordType, 'singular')
const fields = DataSchema.getFields(routeGroup as RecordGroup, routeType as RecordType)
const isFormValid = ref(true)

onMounted(async () => {
  try {
    // When directly adding this record to a specific core record
    if (routeCoreId) {
      actionStore.record.coreId = routeCoreId // Selects this core record if able
    }
  } catch (error) {
    log.error('Error loading create view', error)
  }
})

onUnmounted(() => {
  actionStore.$reset()
})

async function onSubmit() {
  confirmDialog('Create', `Create ${label} record?`, Icon.CREATE, 'positive', async () => {
    try {
      // Setup other fields before saving
      actionStore.record.id = uid()
      actionStore.record.type = routeType

      if (routeType === RecordType.WORKOUT || routeType === RecordType.EXERCISE) {
        actionStore.record.active = false
      }

      await DB.addRecord(
        routeGroup as RecordGroup,
        routeType as RecordType,
        extend(true, {}, actionStore.record) as AnyRecord
      )

      log.info('Successfully created record', {
        id: actionStore.record.id,
        type: actionStore.record.type,
      })

      goBack()
    } catch (error) {
      log.error('Create failed', error)
    }
  })
}
</script>

<template>
  <ResponsivePage :bannerIcon="Icon.CREATE" :bannerTitle="`Create ${label}`">
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
        <div v-if="!actionStore.record.active" class="row justify-center q-my-sm">
          <QBtn label="Create" type="submit" color="positive" :icon="Icon.SAVE" />
        </div>
        <div v-else class="row justify-center q-my-sm">
          <QBtn disable label="Active" color="warning" :icon="Icon.LOCK" />
        </div>

        <!-- Validation Message -->
        <div v-show="!isFormValid" class="row justify-center">
          <QIcon :name="Icon.WARN" color="warning" />
          <span class="text-caption q-ml-xs text-warning">
            Correct invalid entries and try again
          </span>
        </div>
      </QForm>
    </div>

    <ErrorStates v-else error="unknown" />
  </ResponsivePage>
</template>
