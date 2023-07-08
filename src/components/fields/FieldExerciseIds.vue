<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue'
import { type ExerciseRecord, exerciseIdsSchema, RecordType, RecordGroup } from '@/types/core'
import { truncateString } from '@/utils/common'
import useLogger from '@/composables/useLogger'
import useActionStore from '@/stores/action'
import DB from '@/services/Database'

defineProps<{
  inspecting: boolean
}>()

const { log } = useLogger()
const actionStore = useActionStore()

const options: Ref<{ value: string; label: string }[]> = ref([])

onMounted(async () => {
  try {
    actionStore.record.exerciseIds = actionStore.record.exerciseIds ?? []

    const records = (await DB.getRecords(RecordGroup.CORE, RecordType.EXERCISE)) as ExerciseRecord[]

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

  <div v-if="inspecting">{{ inspectFormat(actionStore.record.exerciseIds) }}</div>

  <div v-else>
    <p>Exercises associated with this workout.</p>

    <QSelect
      v-model="actionStore.record.exerciseIds"
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
