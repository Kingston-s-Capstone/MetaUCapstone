//tokenize text into lowercase alphanumerical words
function tokenize(text) {
    return text 
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .split(/\s+/)
        .filter(Boolean)
}
//convert document into BM25 ready format with meta data
export function prepareDocument(text, meta = {}) {
    return {
        tokens: tokenize(text),
        ...meta
    }
}
//BM25 scoring function
export function computeBM25(queryTokens, documents, {k1 = 1.5, b = 0.75 } = {}) {
    const N = documents.length; //total number of docs
    const avgdl = documents.reduce((sum, doc) => sum + doc.tokens.length, 0) / N //average length of docs

    //compute doc frequency for each term across docs
    const df = {};
    for (const doc of documents) {
        const seen = new Set();
        for (const term of doc.tokens) {
            if (!seen.has(term)) {
                df[term] = (df[term] || 0) + 1;
                seen.add(term)
            }
        }
    }

    //compute inverse document frequency
    const idf = {}
    for (const term in df) {
        idf[term] = Math.log(1 + (N - df[term] + 0.5) / (df[term] + 0.5));
    }

    //score each document using BM25 formula
    return documents.map(doc => {
        const freq = {}
            for (const token of doc.tokens) {
                freq[token] = (freq[token] || 0) + 1; //term frequency in this doc
            }

            const dl = doc.tokens.length; // document length
            let score = 0;
            for (const term of queryTokens) {
                if (!term in freq) continue; //skip if term not in the doc

                const f = freq[term];
                const idfTerm = idf[term] || 0;
                score += idfTerm * ((f * (k1 + 1)) / (f + k1 * (1 - b + b * (dl / avgdl))));
            }

            return { ...doc, score } //return orignal doc metadata + score
        }
    )
}