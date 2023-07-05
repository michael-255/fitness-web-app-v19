<script setup lang="ts">
import { Field } from '@/types/core'
import useActionStore from '@/stores/action'

defineProps<{
  inspecting: boolean
}>()

const actionStore = useActionStore()

function inspectFormat(val: string) {
  return `${val || '-'}`
}
</script>

<template>
  <!-- Inspection only -->
  <div v-if="inspecting">
    <div class="text-weight-bold text-body1">Stack Trace</div>
    <div>{{ inspectFormat(actionStore.record[Field.STACK_TRACE]) }}</div>
  </div>
</template>
