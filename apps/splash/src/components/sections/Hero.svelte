<script lang="ts">
  import Link from "../common/Link.svelte"
</script>

<div class="flex flex-col justify-center items-center space-y-4 w-3/4">
  <h2>
    Velkommen til Online, linjeforeningen for <Link href="https://www.ntnu.no/studier/bit" external
      >informatikkstudenter ved NTNU</Link
    >!
  </h2>

  <div>
    Det er vi som sørger for at studietiden blir den beste tiden i ditt liv! Vi i Online arrangerer utflukter, turer,
    fester, holder kurs og bedriftspresentasjoner gjennom hele året.
  </div>

  <div>
    Vi har samlet litt info for nye informatikere. Ta en titt på <Link
      external
      href="https://online.ntnu.no/wiki/online/ny-paa-informatikk/">wiki-siden</Link
    > for å sjekke den ut!
  </div>

  <div>
    Ny på master? <Link href="https://online.ntnu.no/events/1802" external>Klikk her</Link> for viktig info om IT-ekskursjonen.
    OBS - kort frist!
  </div>

  <Link href="#events">Hopp til program!</Link>
</div>

<style>
  h2 {
    @apply text-blue-12 text-center text-4xl font-bold;
  }
</style>
