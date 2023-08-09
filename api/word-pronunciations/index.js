module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    const word = context.bindingData.word;
    const lang = context.bindingData.lang;
    var message = `word: ${word}, lang: ${lang}`;

    const todoItemResp = await fetch('https://jsonplaceholder.typicode.com/todos/1');
    const todoItem = await todoItemResp.json();

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: message + JSON.stringify(todoItem)
    };
}