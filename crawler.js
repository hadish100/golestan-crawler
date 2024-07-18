require('dotenv').config();
const puppeteer = require("puppeteer");
const fs = require("fs").promises;
const axios = require('axios');

const {alert_new_grade,log_report} = require("./bot.js");
const {solve_captcha,sleep,generate_random_name} = require("./captcha_solver.js");

async function check_golestan_for_new_grades()
{
    try
    {
        var browser = await puppeteer.launch({headless:false});
        var page = await browser.newPage();
        page.setDefaultTimeout(30000);
    
        await page.goto("https://golestan.sbu.ac.ir/forms/authenticateuser/main.htm");
        await page.setViewport({width: 1800,height: 1000});
    
        await page.waitForSelector('iframe[name="Faci1"]');
        var frameHandle1 = await page.$('iframe[name="Faci1"]');
        var frame1 = await frameHandle1.contentFrame();
        
        await frame1.waitForSelector('frame[name="Master"]');
        var frameHandle2 = await frame1.$('frame[name="Master"]');
        var frame2 = await frameHandle2.contentFrame();
        
        await frame2.waitForSelector('frame[name="Form_Body"]');
        var frameHandle3 = await frame2.$('frame[name="Form_Body"]');
        var frame3 = await frameHandle3.contentFrame();
        
        await frame3.waitForSelector("#F80351", { visible: true });
        await frame3.waitForSelector("#F80401", { visible: true });
        
        await frame3.waitForSelector("#imgCaptcha", { visible: true });
        const captcha_image = await frame3.$("#imgCaptcha");
        var path = "./captchas/" + generate_random_name() + ".gif";
        const image_url = await captcha_image.evaluate(node => node.src);
        var response = await axios.get(image_url, {responseType: 'arraybuffer'});
        await fs.writeFile(path, response.data);
    
    
        const {golestan_username,golestan_password} = process.env;
        const captcha_text = await solve_captcha(path,false);
    
        console.log(captcha_text);
    
        await frame3.evaluate((golestan_username, golestan_password, captcha_text) => 
        {
            document.querySelector("#F80351").value = golestan_username;
            document.querySelector("#F80401").value = golestan_password;
            document.querySelector("#F51701").value = captcha_text;
        }, golestan_username, golestan_password, captcha_text);
    
    
        await frame3.evaluate(() => 
        {
            document.querySelectorAll("#btnLog")[0].click();
        });
    
        await sleep(3000)
    
        await page.waitForSelector('iframe[name="Faci2"]');
        var frameHandle4 = await page.$('iframe[name="Faci2"]');
        var frame4 = await frameHandle4.contentFrame();
        
        var frameHandle5 = await frame4.$('frame[name="Master"]');
        var frame5 = await frameHandle5.contentFrame();
    
        var frameHandle6 = await frame5.$('frame[name="Form_Body"]');
        var frame6 = await frameHandle6.contentFrame();
    
        await frame6.waitForSelector(".menuright #mendiv > table > tbody tr:nth-child(6) td");
        
        await sleep(3000);
    
        await frame6.evaluate(() =>
        {
            p.click();
            document.querySelector("#F20851").value = "12310";
            dirok();
        });
    
    
        const {semester_to_watch} = process.env;
    
        await page.waitForSelector('iframe[name="Faci3"]');
        await sleep(3000);
    
        var grades_report = await page.evaluate(async (semester_to_watch) => 
        {
            const frame = document.querySelector('iframe[name="Faci3"]');
            const frameDocument = frame.contentDocument || frame.contentWindow.document;
    
            const masterFrame = frameDocument.querySelector('frame[name="Master"]');
            const masterFrameDocument = masterFrame.contentDocument || masterFrame.contentWindow.document;
    
            const formBodyFrame = masterFrameDocument.querySelector('frame[name="Form_Body"]');
            const formBodyFrameDocument = formBodyFrame.contentDocument || formBodyFrame.contentWindow.document;
    
            var trs = formBodyFrameDocument.querySelectorAll("table#T01 tbody tr");
    
            for(var i = 1; i < trs.length; i++)
            {
                if(trs[i].querySelectorAll("td[title='" + semester_to_watch + "']").length > 0)
                {
                    trs[i].querySelectorAll("td[title='" + semester_to_watch + "']")[0].click();
                    break;
                }
            }
    
            await new Promise(resolve => setTimeout(resolve, 3000));
    
            const frameNewForm = formBodyFrameDocument.querySelector('iframe#FrameNewForm');
            const frameNewFormDocument = frameNewForm.contentDocument || frameNewForm.contentWindow.document;
    
            var grade_trs = frameNewFormDocument.querySelectorAll("table#T02 tbody tr");
            var grades = [];
            
            for(var i = 1; i < grade_trs.length; i++)
            {
                var course_grade = grade_trs[i].querySelectorAll("td")[8].innerHTML.replaceAll("<nobr>","").replaceAll("</nobr>","");
                if(course_grade == "") course_grade = null;
                else course_grade = parseFloat(course_grade);
    
                grades.push
                ({
                    course_code:grade_trs[i].querySelectorAll("td")[1].innerText + grade_trs[i].querySelectorAll("td")[2].innerText + grade_trs[i].querySelectorAll("td")[3].innerText + grade_trs[i].querySelectorAll("td")[4].innerText,
                    course_name:grade_trs[i].querySelectorAll("td")[5].innerText.replaceAll("ي","ی").replaceAll("ك","ک"),
                    course_grade,
                })
            }
    
            return grades;
    
        },semester_to_watch);
    
        await page.close();
        await browser.close();
    
        return grades_report;
    }

    catch(e)
    {
        await page.close();
        await browser.close();
        throw e;
    }

}


module.exports = {check_golestan_for_new_grades};