const { searchWord } = require("../services/dictionaryService");

const searchDictionary = async (req, res) => {
    const { q } = req.query;

    if (!q || !q.trim()) {
        return res.status(400).json({ message: "A search term is required" });
    }

    try {
        const result = await searchWord(q.trim());

        if (!result) {
            return res
                .status(404)
                .json({ message: `No result found for "${q.trim()}"` });
        }

        return res.status(200).json(result);
    } catch (err) {
        console.error("Dictionary search error:", err);
        return res
            .status(500)
            .json({ message: "Dictionary lookup failed. Please try again." });
    }
};

module.exports = { searchDictionary };