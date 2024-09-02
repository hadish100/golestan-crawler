require('dotenv').config();
const puppeteer = require("puppeteer");
const fs = require("fs").promises;
const axios = require('axios');

const {solve_captcha,sleep,generate_random_name} = require("./captcha_solver.js");

async function check_golestan_for_new_grades()
{
    try
    {
        var browser = await puppeteer.launch({headless:true});
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

async function check_golestan_for_new_courses()
{
    try
    {
        var browser = await puppeteer.launch({headless:true});
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
            document.querySelector("#F20851").value = "102";
            dirok();
        });
    
    
        await page.waitForSelector('iframe[name="Faci3"]');
        await sleep(3000);
    
        const courses_report = await page.evaluate(async () => 
        {
            const frame = document.querySelector('iframe[name="Faci3"]');
            const frameDocument = frame.contentDocument || frame.contentWindow.document;
    
            const masterFrame = frameDocument.querySelector('frame[name="Master"]');
            const masterFrameDocument = masterFrame.contentDocument || masterFrame.contentWindow.document;
    
            const formBodyFrame = masterFrameDocument.querySelector('frame[name="Form_Body"]');
            const formBodyFrameDocument = formBodyFrame.contentDocument || formBodyFrame.contentWindow.document;
    
            var input_1 = formBodyFrameDocument.querySelectorAll("#SF411522_0")[0]; // #GF078012_0
            input_1.value = "43";
            input_1.dispatchEvent(new Event('change', { bubbles: true }));    

            await new Promise(resolve => setTimeout(resolve, 1000));


            const commanderFrame = frameDocument.querySelector('frame[name="Commander"]');
            const commanderFrameDocument = commanderFrame.contentDocument || commanderFrame.contentWindow.document;

            commanderFrameDocument.querySelectorAll("#IM16_ViewRep")[0].click();

            await new Promise(resolve => setTimeout(resolve, 5000));

            const headerFrame = masterFrameDocument.querySelector('frame[name="Header"]');
            const headerFrameDocument = headerFrame.contentDocument || headerFrame.contentWindow.document;

            const formBodyFrame2 = headerFrameDocument.querySelector('frame#Form_Body');
            const formBodyFrameDocument2 = formBodyFrame2.contentDocument || formBodyFrame2.contentWindow.document;

            var courses = [];
            
            var old_page_number = "1";
            var new_page_number = "1";

            while(true)
            {
                var course_trs = formBodyFrameDocument2.querySelectorAll("table#Table3 tbody tr");

                for(var i = 0; i < course_trs.length; i++)
                {
                    courses.push
                    ({
                        course_code:course_trs[i].querySelectorAll("td")[0].innerText,
                        course_name:course_trs[i].querySelectorAll("td")[1].innerText.replaceAll("ي","ی").replaceAll("ك","ک"),
                        course_prof:course_trs[i].querySelectorAll("td")[8].innerText.replaceAll("ي","ی").replaceAll("ك","ک").replace("\n",""),
                        course_time:course_trs[i].querySelectorAll("td")[9].innerText.replaceAll("ي","ی").replaceAll("ك","ک"),
                        course_exam:course_trs[i].querySelectorAll("td")[10].innerText.replaceAll("ي","ی").replaceAll("ك","ک"),
                    })
                }


                const frame3 = document.querySelector('iframe[name="Faci3"]');
                const frameDocument3 = frame3.contentDocument || frame3.contentWindow.document;

                const commanderFrame3 = frameDocument3.querySelector('frame[name="Commander"]');
                const commanderFrameDocument3 = commanderFrame3.contentDocument || commanderFrame3.contentWindow.document;

                commanderFrameDocument3.querySelectorAll("#MoveLeft")[0].click();

                await new Promise(resolve => setTimeout(resolve, 500));

                new_page_number = commanderFrameDocument3.querySelectorAll("#TextPage")[0].value;
                if(new_page_number == old_page_number) break;
                else old_page_number = new_page_number;
            }

            const frame4 = document.querySelector('iframe[name="Faci3"]');
            const frameDocument4 = frame4.contentDocument || frame4.contentWindow.document;

            const commanderFrame4 = frameDocument4.querySelector('frame[name="Commander"]');
            const commanderFrameDocument4 = commanderFrame4.contentDocument || commanderFrame4.contentWindow.document;

            commanderFrameDocument4.querySelectorAll("#IM90_gomenu")[0].click();
            await new Promise(resolve => setTimeout(resolve, 1000));

            const faci2Frame = document.querySelector('iframe[name="Faci2"]');
            const faci2FrameDocument = faci2Frame.contentDocument || faci2Frame.contentWindow.document;

            const faci2MasterFrame = faci2FrameDocument.querySelector('frame[name="Master"]');
            const faci2MasterFrameDocument = faci2MasterFrame.contentDocument || faci2MasterFrame.contentWindow.document;

            const faci2FormBodyFrame = faci2MasterFrameDocument.querySelector('frame[name="Form_Body"]');
            const faci2FormBodyFrameDocument = faci2FormBodyFrame.contentDocument || faci2FormBodyFrame.contentWindow.document;

            faci2FormBodyFrameDocument.querySelectorAll("#OK")[0].click()

            await new Promise(resolve => setTimeout(resolve, 5000));

            const frame5 = document.querySelector('iframe[name="Faci4"]');
            const frameDocument5 = frame5.contentDocument || frame5.contentWindow.document;

            const masterFrame5 = frameDocument5.querySelector('frame[name="Master"]');
            const masterFrameDocument5 = masterFrame5.contentDocument || masterFrame5.contentWindow.document;

            const formBodyFrame5 = masterFrameDocument5.querySelector('frame[name="Form_Body"]');
            const formBodyFrameDocument5 = formBodyFrame5.contentDocument || formBodyFrame5.contentWindow.document;

            var input_2 = formBodyFrameDocument5.querySelectorAll("#GF078012_0")[0];
            input_2.value = "43";
            input_2.dispatchEvent(new Event('change', { bubbles: true }));

            await new Promise(resolve => setTimeout(resolve, 1000));

            const commanderFrame5 = frameDocument5.querySelector('frame[name="Commander"]');
            const commanderFrameDocument5 = commanderFrame5.contentDocument || commanderFrame5.contentWindow.document;

            commanderFrameDocument5.querySelectorAll("#IM16_ViewRep")[0].click();

            await new Promise(resolve => setTimeout(resolve, 5000));

            const headerFrame5 = masterFrameDocument5.querySelector('frame[name="Header"]');
            const headerFrameDocument5 = headerFrame5.contentDocument || headerFrame5.contentWindow.document;

            const formBodyFrame6 = headerFrameDocument5.querySelector('frame#Form_Body');
            const formBodyFrameDocument6 = formBodyFrame6.contentDocument || formBodyFrame6.contentWindow.document;

            var secondary_old_page_number = "1";
            var secondary_new_page_number = "1";

            while(true)
            {
                var course_trs = formBodyFrameDocument6.querySelectorAll("table#Table3 tbody tr");

                for(var i = 0; i < course_trs.length; i++)
                {
                    courses.push
                    ({
                        course_code:course_trs[i].querySelectorAll("td")[0].innerText,
                        course_name:course_trs[i].querySelectorAll("td")[1].innerText.replaceAll("ي","ی").replaceAll("ك","ک"),
                        course_prof:course_trs[i].querySelectorAll("td")[8].innerText.replaceAll("ي","ی").replaceAll("ك","ک").replace("\n",""),
                        course_time:course_trs[i].querySelectorAll("td")[9].innerText.replaceAll("ي","ی").replaceAll("ك","ک"),
                        course_exam:course_trs[i].querySelectorAll("td")[10].innerText.replaceAll("ي","ی").replaceAll("ك","ک"),
                    })
                }

                const frame3 = document.querySelector('iframe[name="Faci4"]');
                const frameDocument3 = frame3.contentDocument || frame3.contentWindow.document;

                const commanderFrame3 = frameDocument3.querySelector('frame[name="Commander"]');
                const commanderFrameDocument3 = commanderFrame3.contentDocument || commanderFrame3.contentWindow.document;

                commanderFrameDocument3.querySelectorAll("#MoveLeft")[0].click();
            
                await new Promise(resolve => setTimeout(resolve, 500));

                secondary_new_page_number = commanderFrameDocument3.querySelectorAll("#TextPage")[0].value;
                if(secondary_new_page_number == secondary_old_page_number) break;
                else secondary_old_page_number = secondary_new_page_number;

            }

            return courses

        });


        await page.close();
        await browser.close();
        return courses_report;
    }

    catch(e)
    {
        await page.close();
        await browser.close();
        throw e;
    }

}


module.exports = {check_golestan_for_new_grades,check_golestan_for_new_courses};