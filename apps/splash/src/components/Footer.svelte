<script lang="ts">
  import { FacebookIcon, InstagramIcon, GithubIcon } from "svelte-feather-icons"

  const email = "kontakt@online.ntnu.no"
</script>

<footer class="bg-slate-1">
  <div class="flex flex-col items-center justify-center w-11/12 md:w-3/5">
    <div>
      <h2>Har du noen spørsmål?</h2>
      <div>
        <span
          >Dersom du lurer på noe, ikke nøl med å ta kontakt! Du kan nå oss på{" "}
          <a href={`mailto:${email}`}>{email}</a>.
        </span>
      </div>
    </div>

    <div class="flex space-x-2 justify-center items-center">
      <FacebookIcon class="w-8 h-8" />
      <InstagramIcon class="w-8 h-8" />
      <GithubIcon class="w-8 h-8" />
    </div>
  </div>
</footer>

<style>
  footer {
    @apply relative mt-auto flex min-h-[10rem] w-full flex-col items-center justify-center py-8;
  }
</style>
