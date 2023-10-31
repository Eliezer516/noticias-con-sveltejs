<script>
	import './App.css'

	let respuesta = []

	let paisDeOrigen = 've'
	let categoria = 'general'

	const obtenerNoticias = async (paisDeOrigen, categoria) => {
		const fetchData = await fetch(`https://newsapi.org/v2/top-headlines?country=${paisDeOrigen}&category=${categoria}&apiKey=1380d78ddac345b481518f6cffb95140`)
		const json = await fetchData.json()
		const response = await json.articles
		console.table(response);
		respuesta = response
	}

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
				  <option value="ve" selected disabled>Pais</option>
				  <option value="ve">Venezuela</option>
				  <option value="co">Colombia</option>
				  <option value="ar">Argentina</option>
				</select>
			</div>
			<div class="categoria">
				<select class="select_box" bind:value={categoria}>
				  <option value="general" selected disabled>Categoria</option>
				  <option value="general">General</option>
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
		{#each respuesta as {title, url, urlToImage}}
		<div class="card">
			<div class="card-img">
				<img src={urlToImage ? urlToImage : 'https://www.publicdomainpictures.net/pictures/280000/velka/not-found-image-15383864787lu.jpg'} alt="">
			</div>
			<div class="card_content">
				<div class="card-title">{title}</div>
				<div class="card-link"><a href={url ? url : 'https://www.publicdomainpictures.net/pictures/280000/velka/not-found-image-15383864787lu.jpg'} target="_blank">Seguir leyendo</a></div>
			</div>
		</div>
		{/each}
	</section>
	
</main>

<style>
	nav {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		padding: 15px;
		background: #e6e6e6;
	}

	section	{
		display: grid;
		grid-gap: 1rem;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
		padding: 1rem;
	}

	.card {
		width: 100%;
	}

	.card .card-img img {
		width: 100%;
	}

	.card .card-title {
		font-weight: bold;
	}

	.card .card-link a {
		display: inline-block;
		text-decoration: none;
		color:  white;
		background: blue;
		border-radius: 5px;
		padding: 10px;
		margin: 5px 0;
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
	@media (min-width: 570px) {
		nav {
			flex-direction: row;
			justify-content: space-around;
		}
	}
</style>
