
import { OpenAI } from "openai";
import type { RequestHandler } from "@sveltejs/kit";
import { PCA } from 'ml-pca';


const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.OPENAI_ORG_ID,
});

const get_embedding = async (input: string) => {
    return await client.embeddings
        .create({
            model: 'text-embedding-3-large',
            dimensions: 3072,
            input
        })
        .then((res) => res.data[0].embedding);
};

function normalizeVector(vector: number[]) {
    // Calculate the magnitude of the vector
    const magnitude = Math.sqrt(vector.reduce((sum, component) => sum + component * component, 0));

    // Normalize each component of the vector
    return vector.map(component => component / magnitude);
}


export const POST: RequestHandler = async (request) => {
    const { prompt } = await request.request.json();
    const embedding: number[] = await get_embedding(prompt);

    // every other item
    const part1 = embedding.filter((_, i) => i % 2 === 0);
    const part2 = embedding.filter((_, i) => i % 2 !== 0);

    // normalize both parts
    const normalizedPart1 = normalizeVector(part1);
    const normalizedPart2 = normalizeVector(part2);

    // reduced embedding is number[2] containing the x and y component of the reduced embedding
    const avg1 = normalizedPart1.reduce((a, b) => a + b, 0) / normalizedPart1.length;
    const avg2 = normalizedPart2.reduce((a, b) => a + b, 0) / normalizedPart2.length;

    const reducedEmbedding = [avg1, avg2];

    //const model = TSNE.TSNE({
    //    dim: 2,
    //    perplexity: 30.0,
    //    earlyExaggeration: 4.0,
    //    learningRate: 100.0,
    //    nIter: 1000,
    //    metric: 'euclidean'
    //});
    //
    //model.init({
    //    data: embedding,
    //    type: 'dense'
    //});
    //
    //model.run();
    //
    //const reducedEmbedding = model.getOutput();
    //
    //console.log(reducedEmbedding);
    //
    //return Response.json({ reducedEmbedding });


    //const part1 = embedding.slice(0, 1536);
    //
    //const part2 = embedding.slice(1536, 3072);
    //
    //const pca = new PCA([part1, part2]);
    //const reduced = pca.predict([part1, part2], { nComponents: 2 });
    //
    //const reducedEmbedding = reduced.getRow(0);
    //console.log(reducedEmbedding);


    return Response.json({ reducedEmbedding });

};
