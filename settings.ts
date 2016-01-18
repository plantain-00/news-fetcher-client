export let key: string;
export let serverUrl = "https://news.yorkyao.xyz";

try {
    let secret = require("./secret");
    secret.load();
} catch (error) {
    console.log(error);
}
