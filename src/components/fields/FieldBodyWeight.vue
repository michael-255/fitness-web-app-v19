<script setup lang="ts">
import { onMounted } from 'vue'
import { allFields, numberSchema } from '@/types/core'
import useActionStore from '@/stores/action'

defineProps<{
  inspecting: boolean
}>()

const actionStore = useActionStore()

const field = allFields.Values.bodyWeight

onMounted(() => {
  actionStore.record[field] = actionStore.record[field] ?? 0
})

function inspectFormat(val: number) {
  return val ? `${val} lbs` : '-'
}
</script>

<template>
  <div class="text-weight-bold text-body1">Body Weight (lbs)</div>

  <div v-if="inspecting">
    {{ inspectFormat(actionStore.record[field]) }}
  </div>

  <QInput
    v-model.number="actionStore.record[field]"
    :rules="[(val: number) => numberSchema.safeParse(val).success || 'Must be 0 or greater']"
    type="number"
    lazy-rules
    dense
    outlined
    color="primary"
  />
</template>
