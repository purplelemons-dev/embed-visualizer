
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

export const POST: RequestHandler = async (request) => {
    const { prompt } = await request.request.json();
    const embedding = await get_embedding(prompt);

    const part1 = embedding.slice(0, 1536);

    const part2 = embedding.slice(1536, 3072);

    // average of part 1
    const avg1 = part1.reduce((a, b) => a + b, 0) / part1.length;

    // average of part 2
    const avg2 = part2.reduce((a, b) => a + b, 0) / part2.length;

    // average of all
    const reducedEmbedding = [avg1, avg2]

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
