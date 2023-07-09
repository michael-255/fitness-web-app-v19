<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue'
import {
  type ExerciseResultRecord,
  exerciseResultIdsSchema,
  RecordType,
  RecordGroup,
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

const options: Ref<{ value: string; label: string }[]> = ref([])

onMounted(async () => {
  try {
    actionStore.record.exerciseResultIds = actionStore.record.exerciseResultIds ?? []

    const records = (await DB.getRecords(
      RecordGroup.SUB,
      RecordType.EXERCISE
    )) as ExerciseResultRecord[]

    options.value = records.map((r: ExerciseResultRecord) => ({
      value: r.id,
      label: `${truncateString(r.id, 8, '*')}`,
    }))
  } catch (error) {
    log.error('Error with exercise result ids field', error)
  }
})
</script>

<template>
  <div class="text-weight-bold text-body1">Exercise Result Ids</div>

  <div v-if="inspecting">
    <li v-for="(input, i) in actionStore.record.exerciseResultIds" :key="i" class="q-ml-sm">
      {{ input }}
    </li>
  </div>

  <div v-else>
    <p>Ids of all completed exercises associated with this workout.</p>

    <QSelect
      v-model="actionStore.record.exerciseResultIds"
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
