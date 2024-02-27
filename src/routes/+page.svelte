<script lang="ts">
	import { onMount, afterUpdate } from 'svelte';
	import { writable } from 'svelte/store';
	import type { Writable } from 'svelte/store';

	let inputText = '';
	let embedding: number[] = [];
	const texts: Writable<
		{
			text: string;
			embedding: number[];
		}[]
	> = writable([]);

	const get_embedding = async () => {
		// Send the input text to the server
		const response = await fetch('/api/embed', {
			method: 'POST',
			body: JSON.stringify({ prompt: inputText })
		});

		// Get the embedding from the response
		const result = await response.json();
		embedding = result.reducedEmbedding;
		texts.update((current) => [...current, { text: inputText.slice(0, 50), embedding: embedding }]);
		drawDots();
		inputText = '';
		textbox.focus();
	};

	//const embeddings: Writable<number[][]> = writable([]);

	// Example of updating embeddings
	//function updateEmbeddings(newEmbedding: number[]) {
	//	embeddings.update((currentEmbeddings) => [...currentEmbeddings, newEmbedding]);
	//}

	let canvas: null | HTMLCanvasElement;
	let ctx: null | CanvasRenderingContext2D | undefined;
	const upscaleSize = 200000;

	onMount(() => {
		canvas = document.querySelector('canvas');
		ctx = canvas?.getContext('2d');
		drawDots();

		canvas?.addEventListener('mousemove', handleMouseMove);
		textbox = document.querySelector("input");
	});

	afterUpdate(() => {
		drawDots();
	});

	//$: texts.subscribe((items) => {
	//	items.forEach((item) => {
	//		console.log(item.embedding);
	//		// Assuming the embedding has been scaled or mapped appropriately to fit the canvas dimensions
	//		const x = item.embedding[0]; // Use the first dimension for x-coordinate
	//		const y = item.embedding[1]; // Use the second dimension for y-coordinate
	//		console.log(`drawing: ${x}, ${y}`);
	//		ctx?.beginPath();
	//		ctx?.arc(x, y, 5, 0, 2 * Math.PI); // Draw a dot
	//		ctx?.fill();
	//	});
	//})();

	$: texts;

	const drawDots = () => {
		ctx?.clearRect(0, 0, canvas?.width || 0, canvas?.height || 0); // Clear the canvas

		// Translate the origin to the center of the canvas
		ctx?.save(); // Save the current state of the context
		ctx?.translate((canvas?.width || 0) / 2, (canvas?.height || 0) / 2);
		texts.subscribe((items) => {
			items.forEach((item) => {
				console.log(item.embedding);
				// Assuming the embedding has been scaled or mapped appropriately to fit the canvas dimensions
				const x = item.embedding[0] * upscaleSize; // Use the first dimension for x-coordinate
				const y = item.embedding[1] * upscaleSize; // Use the second dimension for y-coordinate
				console.log(`drawing: ${x}, ${y}`);
				ctx?.beginPath();
				ctx?.arc(x, y, 5, 0, 2 * Math.PI); // Draw a dot
				ctx?.fill();
			});
		})();

		ctx?.restore(); // Restore the original state of the context
	};

	const handleMouseMove = (event: MouseEvent) => {
		const rect = canvas?.getBoundingClientRect();
		const x = (event.clientX - (rect?.left || 0));
		const y = (event.clientY - (rect?.top || 0));
		console.log(`mouse is at (${x},${y})`)

		texts.subscribe((items) => {
			items.forEach((item) => {
				const dotX = item.embedding[0] * upscaleSize;
				const dotY = item.embedding[1] * upscaleSize;

				// Check if the mouse is over the dot
				if (Math.sqrt((x - dotX) ** 2 + (y - dotY) ** 2) < 5) {
					// Show the text as a tooltip or similar UI element
					// This is a basic implementation. You might want to use a more sophisticated tooltip UI
					ctx?.fillText(item.text, dotX + 10, dotY);
				}
			});
		})();
	};
</script>

<div class="embedd-box">
	<!-- Text input for embedding -->
	<input type="text" bind:value={inputText} placeholder="Enter text here" />

	<!-- Button to trigger embedding -->
	<button on:click={get_embedding}>Get Embedding</button>
</div>
<canvas width="1500%" height="600%"> </canvas>

<style>
	.embedd-box {
		position: fixed;
		top: 20px;
		left: 20px;
		background: white;
		padding: 20px;
		border: 1px solid #ccc;
		border-radius: 5px;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
		z-index: 2; /* Ensure this is high enough to be above the canvas if needed */
	}

	canvas {
		position: fixed;
		top: 100px; /* Adjust as needed to not overlap with the embed-box */
		left: 20px;
		border: 1px solid #ccc;
		z-index: 1; /* Lower than embed-box to ensure it's below the text input */
	}

	input,
	button {
		margin: 5px 0;
	}

	input {
		padding: 8px;
		width: calc(100% - 22px);
		border: 1px solid #ccc;
		border-radius: 4px;
	}

	button {
		background: #007bff;
		color: white;
		border: none;
		padding: 10px 15px;
		border-radius: 4px;
		cursor: pointer;
	}
	button:hover {
		background: #0056b3;
	}
</style>
