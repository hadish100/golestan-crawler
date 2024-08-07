const fs = require('fs').promises;
const {alert_new_grade,alert_no_new_grade,init_grade_msg} = require("./bot.js");
const {check_golestan_for_new_grades} = require("./crawler.js");
const {sleep} = require("./captcha_solver.js");

async function main()
{
    var previous_report = await fs.readFile("grades.json", "utf8");
    var grades_report = await check_golestan_for_new_grades();

    if(previous_report == "")
    {
        await fs.writeFile("grades.json", JSON.stringify(grades_report, null, 4));
        await init_grade_msg(grades_report);
    }

    else
    {
        previous_report = JSON.parse(previous_report);
        var new_grade_flag = false;

        for(var i=0;i<grades_report.length;i++)
        {
            if(grades_report[i].course_grade != previous_report[i].course_grade)
            {
                new_grade_flag = true;
                await alert_new_grade(grades_report[i].course_name, grades_report[i].course_grade);
            }
        }

        if(new_grade_flag)
        {
            await fs.writeFile("grades.json", JSON.stringify(grades_report, null, 4));
        }

        else
        {
            await alert_no_new_grade();
        }
        
    }
}


async function job()
{

    while(true)
    {
        try
        {
            await main();
            await sleep(1000 * 60 * 30);
        }

        catch(e)
        {
            console.log(e);
            await sleep(10000);
            continue;
        }
    }
}

job();