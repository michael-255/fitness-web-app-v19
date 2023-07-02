<script setup lang="ts">
import { allFields } from '@/types/core'
import useActionStore from '@/stores/action'

defineProps<{
  inspecting: boolean
}>()

const actionStore = useActionStore()

function inspectFormat(val: boolean) {
  return val ? 'Yes' : 'No'
}
</script>

<template>
  <!-- Inspection only -->
  <div v-if="inspecting">
    <div class="text-weight-bold text-body1">Active</div>
    <div>{{ inspectFormat(actionStore.record[allFields.Values.active]) }}</div>
  </div>
</template>
