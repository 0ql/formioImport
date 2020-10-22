<script>
	export let msg, index;
</script>

<div class="flex mt-1">
	<input placeholder="Index zuordnen" type="number" class="form-control w-25" bind:value={index}>
  <div class="ml-4 pt-2">{msg}</div>
</div>

<style>
	.small {
    width: 3rem;
  }
</style>