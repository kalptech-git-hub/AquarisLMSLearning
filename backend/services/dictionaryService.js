const JISHO_API_URL = "https://jisho.org/api/v1/search/words";

/**
 * Looks up a word (Japanese or English) using Jisho's public API and
 * reshapes the response into a simple shape the frontend widget expects.
 * Returns null if no match was found.
 */
const searchWord = async (query) => {
    const response = await fetch(
        `${JISHO_API_URL}?keyword=${encodeURIComponent(query)}`,
        {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
                Accept: "application/json",
            },
        }
    );

    if (!response.ok) {
        throw new Error(`Jisho API responded with status ${response.status}`);
    }

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
        return null;
    }

    // Jisho returns results ranked by relevance — take the top match.
    const entry = data.data[0];
    const japanese = entry.japanese?.[0] || {};

    const seenMeanings = new Set();
    const senses = (entry.senses || [])
        .slice(0, 3)
        .map((sense) => {
            const meanings = (sense.english_definitions || []).filter((m) => {
                const key = m.toLowerCase();
                if (seenMeanings.has(key)) return false;
                seenMeanings.add(key);
                return true;
            });

            return {
                partsOfSpeech: (sense.parts_of_speech || []).join(", "),
                meanings,
            };
        })
        .filter((sense) => sense.meanings.length > 0);

    return {
        word: japanese.word || japanese.reading || query,
        reading: japanese.reading || "",
        isCommon: Boolean(entry.is_common),
        senses,
    };
};

module.exports = { searchWord };