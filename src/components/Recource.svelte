<script>
  export let val;

  val = "in";
</script>


<div>Recource Angeben</div>
<input type="text" placeholder="Recource Angeben" bind:value={val}>

<style>
  input {
    padding: 0.7rem;
    color: #34495e;
    background-color: #fafafa;
    border: 1px solid #bdc3c7;
    border-radius: 6px;
  }
</style>