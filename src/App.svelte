<script>
	import { onMount } from 'svelte'
	import './App.css'
	import Loader from './components/Loader.svelte'

	let respuesta = []
	let paisDeOrigen = 've'
	let categoria = 'general'
	let loader = false

	const obtenerNoticias = async (paisDeOrigen, categoria) => {
		try {
			loader = true
			const fetchData = await fetch(`https://newsapi.org/v2/top-headlines?country=${paisDeOrigen}&category=${categoria}&apiKey=1380d78ddac345b481518f6cffb95140`)
			const json = await fetchData.json()
			const response = await json.articles
			console.log(response);
			respuesta = response
			loader = false
		} catch(err) {
			console.log(err)
			loader = false
		}
	}

	onMount(() => {
    obtenerNoticias(paisDeOrigen,categoria)
  })

	$: obtenerNoticias(paisDeOrigen, categoria)


</script>

<main>
	<nav>
		<div class="title">
			<h2>App de noticias con Sveltejs</h2>
		</div>
		<div class="form">
			<div class="pais">
				<select class="select_box" bind:value={paisDeOrigen}>
				  <option selec value="ve">Venezuela</option>
				  <option value="co">Colombia</option>
				  <option value="ar">Argentina</option>
				</select>
			</div>
			<div class="categoria">
				<select class="select_box" bind:value={categoria}>
				  <option selected value="general">General</option>
				  <option value="business">Negocios</option>
				  <option value="entertainment">Entretenimiento</option>
				  <option value="health">Salud</option>
				  <option value="science">Ciencia</option>
				  <option value="sports">Deportes</option>
				  <option value="technology">Tecnologia</option>
				</select>
			</div>
		</div>
	</nav>

	<section>
		{#if respuesta.length > 0}
			{#each respuesta as {title, url}}
			<div class="card">
				<div class="card_content">
					<div class="card-title">{title}</div>
					<div class="card-link"><a href={url ? url : 'https://www.publicdomainpictures.net/pictures/280000/velka/not-found-image-15383864787lu.jpg'} target="_blank">Seguir leyendo</a></div>
				</div>
			</div>
			{/each}
		{/if}
	</section>

	{#if loader}
		<Loader/>
	{/if}
	
</main>

<style>
	nav {
		display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
		padding: 15px;
		background: #e6e6e6;
	}

	nav .title {
		margin-bottom: 20px;
	}

	section	{
		width: 60%;
		margin:0 auto;
	}

	.card {
		width: 100%;
		border: 1px solid black;
		border-radius: 10px;
		margin: 20px 0;
		padding: 20px;
	}

	.card .card-title {
		font-weight: bold;
		font-size: 1.5rem;
	}

	.card .card-link a {
		display: inline-block;
		text-decoration: none;
		color:  white;
		background: blue;
		border-radius: 5px;
		padding: 10px;
		margin-top: 20px;
	}
	/*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*/

	.card .card_content {
		padding: 5px;
	}

	.form, .pais, .categoria {
		display: flex;
		margin: 0 10px;
	}
	.select_box {
		padding: 8px 12px;
		color: #333333;
		background: #eeeeee;
		border: 1px solid #dddddd;
		cursor: pointer;
		border-radius: 5px;
	}
	.select_box:focus,
	.select_box:hover {
		outline: none;
		border: 1px solid #bbbbbb;
	}
	.select_box option {
		background: white;
	}
	@media screen and (max-width: 570px) {
		.card .card-title {
			font-size: 1rem;
		}

		section {
			width: 95%;
		}
	}
</style>
