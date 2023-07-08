<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue'
import { truncateString } from '@/utils/common'
import { type AnyCoreRecord, type RecordType, idSchema, RecordGroup } from '@/types/core'
import { RouteName } from '@/types/general'
import useLogger from '@/composables/useLogger'
import useActionStore from '@/stores/action'
import useRoutables from '@/composables/useRoutables'
import DB from '@/services/Database'

defineProps<{
  inspecting: boolean
}>()

const { route, routeType } = useRoutables()
const { log } = useLogger()
const actionStore = useActionStore()

const options: Ref<{ value: string; label: string }[]> = ref([])

onMounted(async () => {
  try {
    const records = (await DB.getRecords(
      RecordGroup.CORE,
      routeType as RecordType
    )) as AnyCoreRecord[]

    options.value = records.map((r: AnyCoreRecord) => ({
      value: r.id,
      label: `${r.name} (${truncateString(r.id, 8, '*')})`,
    }))

    const coreIdFound = options.value.some((o) => o.value === actionStore.record.coreId)

    if (!coreIdFound) {
      actionStore.record.coreId = options.value[0].value ?? undefined // If no options
    }
  } catch (error) {
    log.error('Error with core id field', error)
  }
})

function inspectFormat(val: string) {
  return `${val || '-'}`
}
</script>

<template>
  <div class="text-weight-bold text-body1">Core Record</div>

  <div v-if="inspecting">{{ inspectFormat(actionStore.record.coreId) }}</div>

  <div v-else>
    <p>
      The core record that this sub record is associated with. This cannot be updated once set
      during record creation.
    </p>

    <QSelect
      :disable="route.name === RouteName.EDIT"
      v-model="actionStore.record.coreId"
      :rules="[(val: string) => idSchema.safeParse(val).success || 'Required']"
      :options="options"
      emit-value
      map-options
      options-dense
      dense
      outlined
      color="primary"
    />
  </div>
</template>
