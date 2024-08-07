const fs = require('fs').promises;
const {init_course_msg, alert_no_new_course, alert_new_courses} = require("./bot.js");
const {check_golestan_for_new_courses} = require("./crawler.js");
const {sleep} = require("./captcha_solver.js");

async function main()
{
    var previous_report = await fs.readFile("courses.json", "utf8");
    var courses_report = await check_golestan_for_new_courses();

    for(var i=0;i<courses_report.length;i++)
    {
        for(var j=i+1;j<courses_report.length;j++)
        {
            if(courses_report[i].course_code == courses_report[j].course_code)
            {
                courses_report.splice(j,1);
                j--;
            }
        }
    }

    if(previous_report == "")
    {
        await fs.writeFile("courses.json", JSON.stringify(courses_report, null, 4));
        await init_course_msg(courses_report);
    }

    else
    {
        previous_report = JSON.parse(previous_report);
        var new_course_flag = false;
        var new_courses = [];

        for(var i=0;i<courses_report.length;i++)
        {
            if(!previous_report.some(course => course.course_code == courses_report[i].course_code))
            {
                new_course_flag = true;
                new_courses.push(courses_report[i]);
            }
        }

        if(new_course_flag)
        {
            await alert_new_courses(new_courses);
            await fs.writeFile("courses.json", JSON.stringify(courses_report, null, 4));
        }

        else
        {
            await alert_no_new_course();
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
            await sleep(1000 * 60 * 20);
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