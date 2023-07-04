<script setup lang="ts">
import { AppName } from '@/constants/global'
import { useMeta } from 'quasar'
import ResponsivePage from '@/components/ResponsivePage.vue'

useMeta({ title: `${AppName} - Active Workout` })
</script>

<template>
  <ResponsivePage> Active Workout goes here...</ResponsivePage>
</template>
