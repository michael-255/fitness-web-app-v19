<script setup lang="ts">
import { Field } from '@/types/core'
import useActionStore from '@/stores/action'

defineProps<{
  inspecting: boolean
}>()

const actionStore = useActionStore()

function inspectFormat(val: number) {
  return `${val || '-'}`
}
</script>

<template>
  <!-- Inspection only -->
  <div v-if="inspecting">
    <div class="text-weight-bold text-body1">Auto Id</div>
    <div>{{ inspectFormat(actionStore.record[Field.AUTO_ID]) }}</div>
  </div>
</template>
