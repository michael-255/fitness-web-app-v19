<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue'
import {
  type ExerciseRecord,
  allFields,
  recordGroups,
  recordTypes,
  exerciseIdsSchema,
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

const field = allFields.Values.exerciseIds
const options: Ref<{ value: string; label: string }[]> = ref([])

onMounted(async () => {
  try {
    actionStore.record[field] = actionStore.record[field] ?? []

    const records = (await DB.getRecords(
      recordGroups.Values.core,
      recordTypes.Values.exercise
    )) as ExerciseRecord[]

    options.value = records.map((r: ExerciseRecord) => ({
      value: r.id,
      label: `${r.name} (${truncateString(r.id, 8, '*')})`,
    }))
  } catch (error) {
    log.error('Error with exercise ids field', error)
  }
})

function inspectFormat(val: ExerciseRecord[]) {
  return val?.join(', ') || '-'
}
</script>

<template>
  <div class="text-weight-bold text-body1">Exercises</div>

  <div v-if="inspecting">
    {{ inspectFormat(actionStore.record[field]) }}
  </div>

  <div v-else>
    <p>Exercises associated with this workout.</p>

    <QSelect
      v-model="actionStore.record[field]"
      :rules="[(val: ExerciseRecord[]) => exerciseIdsSchema.safeParse(val).success || 'Required']"
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
