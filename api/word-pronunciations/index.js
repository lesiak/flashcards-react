module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    const word = context.bindingData.word;
    const lang = context.bindingData.lang;
    const forvoKey = process.env.FORVO_KEY;
    const url = `https://apifree.forvo.com/key/${forvoKey}/format/json/action/word-pronunciations/word/${word}/language/${lang}`

    const todoItemResp = await fetch(url);
    const todoItem = await todoItemResp.json();

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: JSON.stringify(todoItem)
    };
}