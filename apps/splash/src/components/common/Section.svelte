<script lang="ts">
  export let title: string
</script>

<div>
  <h2>{title}</h2>

  <slot />
</div>

<style>
  h2 {
    @apply text-blue-12 text-4xl font-bold;
  }

  div {
    @apply p-6;
  }
</style>
