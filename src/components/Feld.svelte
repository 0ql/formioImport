<script>
	export let msg, index, label;
</script>

<div class="flex mt-3">
  <!-- <input placeholder="Index zuordnen" type="number"
  class="form-control w-25" bind:value={index}> -->
  <div class="input-group input-group">
    <div class="input-group-prepend">
      <span class="input-group-text" id="inputGroup-sizing-sm">{msg+" ("+label+")"}</span>
    </div>
    <input bind:value={index} placeholder="Index zuordnen" type="number" class="form-control" aria-label="Small" aria-describedby="inputGroup-sizing-sm">
  </div>
</div>