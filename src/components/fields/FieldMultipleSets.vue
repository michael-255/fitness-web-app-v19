<script setup lang="ts">
import { onMounted } from 'vue'
import useActionStore from '@/stores/action'

defineProps<{
  inspecting: boolean
}>()

const actionStore = useActionStore()

onMounted(() => {
  actionStore.record.multipleSets = actionStore.record.multipleSets ?? true
})

function inspectFormat(val: boolean) {
  return val ? 'Yes' : 'No'
}
</script>

<template>
  <div class="text-weight-bold text-body1">Multiple Sets</div>

  <div v-if="inspecting">{{ inspectFormat(actionStore.record.multipleSets) }}</div>

  <div v-else>
    <p>
      Whether the record allows recording multiple sets or only a single set. This is irrelevant for
      instructional records with no inputs.
    </p>
    <QToggle v-model="actionStore.record.multipleSets" />
  </div>
</template>
