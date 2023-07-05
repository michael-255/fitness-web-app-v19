<script setup lang="ts">
import { Field } from '@/types/core'
import { onMounted } from 'vue'
import useActionStore from '@/stores/action'

defineProps<{
  inspecting: boolean
}>()

const actionStore = useActionStore()

const field = Field.MULTIPLE_SETS

onMounted(() => {
  actionStore.record[field] = actionStore.record[field] ?? true
})

function inspectFormat(val: boolean) {
  return val ? 'Yes' : 'No'
}
</script>

<template>
  <div class="text-weight-bold text-body1">Multiple Sets</div>

  <div v-if="inspecting">
    {{ inspectFormat(actionStore.record[field]) }}
  </div>

  <div v-else>
    <p>Whether the record provides the ability to record multiple sets.</p>
    <QToggle v-model="actionStore.record[field]" />
  </div>
</template>
