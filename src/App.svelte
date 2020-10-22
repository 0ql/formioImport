<script>
	import Header from "./components/Header.svelte";
	import LiveEndPoint from "./components/LiveEndPoint.svelte";
	import Recource from "./components/Recource.svelte";
	import DefinitionRenderer from "./components/DefinitionRenderer.svelte";
	import DropZone from "./components/DropZone.svelte";
	import Uploader from "./components/Uploader.svelte";

	let recource, apiPath, error = false, errorMsg, definition;
	let fields, keyArray, indexArray, bestätigt = false;

	async function fetchDefinition() {
		// Definition von formio holen
		// validierung der Inputs
		if (!recource || !apiPath) {
			error = true;
			errorMsg = "Bitte füllen sie zuerst die Felder aus";
		} else {
			error = false;
			await fetch(apiPath+'/'+recource)
			.then(res => res.json())
			.then(body => definition = body)
			.catch((msg) => {
				console.log(msg)
				error = true;
				errorMsg = "Die angegebene Url ist fehlerhaft";
			})
		}
	}
</script>

<main>
  <Header />
	<div class="wrap">
		<LiveEndPoint bind:val={apiPath}/>
		<Recource bind:val={recource}/><br>
		<button class="btn" on:click={fetchDefinition}>Bestätigen</button>
	</div>
	<div class="wrap">
		<DropZone bind:fields={fields}/>
	</div>
	{#if error}
		<div>
			{errorMsg}
		</div>
	{/if}
	{#if definition}
		<DefinitionRenderer bind:indexArray={indexArray} bind:keyArray={keyArray} bind:components={definition.components}/>
	{/if}
	{#if definition && fields}
		<button on:click={_ => bestätigt = true}>Bestätigen</button>
	{/if}
	{#if bestätigt && definition}
		<Uploader components={definition.components} indexArray={indexArray} keyArray={keyArray} fields={fields} apiPath={apiPath} recource={recource}/>
	{/if}
</main>


<style>
	.wrap {
		padding-top: 1rem;
		padding-left: 10%;
		padding-right: 10%;
	}

	button {
		margin-top: 2rem;
		padding: 0.6rem;
		border-radius: 6px;
	}
</style>