<script setup lang="ts">
import { Icon } from '@/types/general'
import { onMounted, onUnmounted, ref } from 'vue'
import { extend, useMeta } from 'quasar'
import { AppName } from '@/constants/global'
import type { AnyRecord, RecordGroup, RecordType } from '@/types/core'
import DataSchema from '@/services/DataSchema'
import ErrorStates from '@/components/ErrorStates.vue'
import ResponsivePage from '@/components/ResponsivePage.vue'
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

onUnmounted(() => {
  actionStore.$reset()
})

async function onSubmit() {
  confirmDialog('Update', `Update ${label} record?`, Icon.EDIT, 'positive', async () => {
    try {
      await DB.putRecord(
        routeGroup as RecordGroup,
        routeType as RecordType,
        extend(true, {}, actionStore.record) as AnyRecord
      )

      log.info('Successfully updated record', {
        id: actionStore.record.id,
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
        <div v-if="!actionStore.record.active" class="row justify-center q-my-sm">
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
