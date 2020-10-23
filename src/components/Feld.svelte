<script>
	export let msg, index, label;
</script>

<div class="flex mt-1">
	<input placeholder="Index zuordnen" type="number" class="form-control w-25" bind:value={index}>
  <div class="ml-4 pt-2">{msg}</div>
  <div class="ml-3 pt-2">{label}</div>
</div>

<style>
	.small {
    width: 3rem;
  }
</style>