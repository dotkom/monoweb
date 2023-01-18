<script lang="ts">
  export let external: boolean = false
  export let href: string
</script>

<a {href} target={external ? "_blank" : "_self"} rel={external ? "noopener noreferrer" : ""}>
  <slot />
</a>
