const fs = require("fs").promises;
const axios = require('axios');


function generate_random_name()
{
    var alphabet = 'abcdefghijklmnopqrstuvwxyz';
    var result = "";

    for(var i=0;i<10;i++)
    {
        result += alphabet[Math.floor(Math.random() * alphabet.length)];
    }

    return result;
}


async function sleep(ms)
{
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function gif_to_base64(path)
{
    const gif = await fs.readFile(path);
    const base64 = gif.toString('base64');
    return base64;
}

async function enqueue_text_captcha(path)
{
    const base64 = await gif_to_base64(path);
    var worker_id = await axios.post("https://api.nopecha.com/",
    {
        'type': 'textcaptcha',
        'image_data':[base64]
    });

    return worker_id.data.data;
}

async function get_worker_result(worker_id)
{
    while(true)
    {
        try
        {
            var result = await axios.get("https://api.nopecha.com?key=&id=" + worker_id);
            return result.data.data[0];
        }
        catch(e)
        {
            console.log("Error in getting captcha result. Retrying...");
            await sleep(2000);
        }
    }
}

async function solve_captcha(path,test=false)
{
    if(test) return "TEST";
    var worker_id = await enqueue_text_captcha(path);
    var result = await get_worker_result(worker_id);
    await fs.unlink(path);
    return result;
}

module.exports = {solve_captcha,sleep,generate_random_name};
