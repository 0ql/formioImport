<script>
  let dropEvent = false, parsed = false, box;
	export let fields;

  function dragEnter(el) {
		box.style.border = "thick dashed #cd6133";
  }

  function dragLeave() {
    box.style.border = "thick dashed #ffbe76";
  }

  function drop(e) {
    dropEvent = true;
    e.preventDefault();

    let fr = new FileReader();
    fr.onload = () => {
      fields = Papa.parse(fr.result);
      parsed = true;
      console.log(fields)
    }
    fr.readAsText(e.dataTransfer.files[0]);
  }
</script>

<div class="mt-5">
	{#if !dropEvent}
		<div class="dropzone text-center" bind:this={box} on:dragenter={dragEnter} on:dragleave={dragLeave} on:drop={drop} ondragover="return false">
			CSV Datei hier hinein ziehen
		</div>
	{:else if parsed}
		<div class="data">
			<div class="mb-3">Die Anzahl der Datensätze Beträgt: {fields.data.length-2}</div>
			{#each fields.data[0] as field, i}
				<div>{i+": "+field}</div>
			{/each}
		</div>
	{/if}
</div>

<style>
  .dropzone {
    padding: 5rem;
    border: thick dashed #ffbe76;
    border-width: 4px;
    border-radius: 8px;
	}
	
	.data {
		background-color: #ecf0f1;
		border-radius: 8px;
		padding: 1rem;
	}
</style>