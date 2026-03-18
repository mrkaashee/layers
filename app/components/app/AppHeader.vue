<script lang="ts" setup>
const { links } = useNavigation()
</script>

<template>
  <UHeader title="Tools">
    <UNavigationMenu :items="links" />

    <template #right>
      <UColorModeButton />
      <UButton
        icon="i-simple-icons-github"
        color="neutral"
        variant="ghost"
        to="https://github.com/mrkaashee/tools"
        target="_blank" />
    </template>

    <template #body>
      <UNavigationMenu :items="links" orientation="vertical" />
    </template>
  </UHeader>
</template>
