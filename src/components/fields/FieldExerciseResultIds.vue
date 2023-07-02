<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue'
import {
  type ExerciseResultRecord,
  allFields,
  recordGroups,
  recordTypes,
  exerciseResultIdsSchema,
} from '@/types/core'
import { truncateString } from '@/utils/common'
import useLogger from '@/composables/useLogger'
import useActionStore from '@/stores/action'
import DB from '@/services/Database'

defineProps<{
  inspecting: boolean
}>()

const { log } = useLogger()
const actionStore = useActionStore()

const field = allFields.Values.exerciseResultIds
const options: Ref<{ value: string; label: string }[]> = ref([])

onMounted(async () => {
  try {
    actionStore.record[field] = actionStore.record[field] ?? []

    const records = (await DB.getRecords(
      recordGroups.Values.sub,
      recordTypes.Values.exercise
    )) as ExerciseResultRecord[]

    options.value = records.map((r: ExerciseResultRecord) => ({
      value: r.id,
      label: `${truncateString(r.id, 8, '*')})`,
    }))
  } catch (error) {
    log.error('Error with exercise result ids field', error)
  }
})

function inspectFormat(val: ExerciseResultRecord[]) {
  return val?.join(', ') || '-'
}
</script>

<template>
  <div class="text-weight-bold text-body1">Exercise Result Ids</div>

  <div v-if="inspecting">
    {{ inspectFormat(actionStore.record[field]) }}
  </div>

  <div v-else>
    <p>Ids of all completed exercises associated with this workout.</p>

    <QSelect
      v-model="actionStore.record[field]"
      :rules="[(val: ExerciseResultRecord[]) => exerciseResultIdsSchema.safeParse(val).success || 'Invalid']"
      :options="options"
      lazy-rules
      multiple
      counter
      emit-value
      map-options
      options-dense
      dense
      outlined
      color="primary"
    />
  </div>
</template>
