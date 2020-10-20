<script>
	import Header from "./components/Header.svelte";
	import LiveEndPoint from "./components/liveEndPoint.svelte";

</script>

<!-- <main id="drop_zone" ondrop="dropHandler(event);" ondragover="dragOverHandler(event);"> -->
<main>
  <Header />
	<div class="wrap">
		<LiveEndPoint />
		<LiveEndPoint />
	</div>
</main>


<style>
	.wrap {
		padding-top: 1rem;
		padding-left: 10%;
		padding-right: 10%;
	}
</style>