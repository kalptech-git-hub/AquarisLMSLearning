const Kuroshiro = require("kuroshiro").default;
const KuromojiAnalyzer = require("kuroshiro-analyzer-kuromoji");

let kuroshiroInstance = null;
let initPromise = null;

exports.getKuroshiro = async () => {

    if (kuroshiroInstance) {
        return kuroshiroInstance;
    }

    if (!initPromise) {

        kuroshiroInstance = new Kuroshiro();

        initPromise = kuroshiroInstance.init(
            new KuromojiAnalyzer()
        );

    }

    await initPromise;

    return kuroshiroInstance;

};