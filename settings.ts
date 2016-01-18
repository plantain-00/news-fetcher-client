export let key: string;
export let serverUrl = "http://news.yorkyao.xyz";

try {
    let secret = require("./secret");
    secret.load();
} catch (error) {
    console.log(error);
}
