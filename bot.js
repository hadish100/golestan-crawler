require('dotenv').config();
const { Telegraf } = require('telegraf');
const bot = new Telegraf(process.env.telegram_bot_token);
const { sleep } = require('./captcha_solver');
const { grade_chat_id } = process.env;
const { course_chat_id } = process.env;


async function alert_new_grade(course_name,course_grade)
{
    var msg = "🔹 "
    msg += "نمرات درس "
    msg += "<b>"
    msg += course_name
    msg += "</b>"
    msg += " در سامانه گلستان وارد شد."
    await bot.telegram.sendMessage(grade_chat_id, msg, {parse_mode: 'HTML'});

    var msg = "🔸 "
    msg += "نمره شما در این درس: "
    msg += "<b>"
    msg += course_grade
    msg += "</b>"
    await bot.telegram.sendMessage(grade_chat_id, msg, {parse_mode: 'HTML'});
}

async function alert_no_new_grade()
{
    var msg = "💢 اکانت گلستان شما بررسی شد. نمره جدیدی در آن به ثبت نرسیده است.";
    await bot.telegram.sendMessage(grade_chat_id, msg);
}

async function init_grade_msg(grade_report)
{
    var msg = "🔻اکانت گلستان شما بررسی شد، نمرات ثبت شده تا الان:";
    await bot.telegram.sendMessage(grade_chat_id, msg, {parse_mode: 'HTML'});

    for(var i=0;i<grade_report.length;i++)
    {
        if(grade_report[i].course_grade == null) continue;
        var msg = "";
        if(i%2==0) msg += "🔹 ";else msg += "🔸 ";
        msg += "<b>";
        msg += grade_report[i].course_name;
        msg += "</b>";
        msg += " : ";
        msg += grade_report[i].course_grade;
        await bot.telegram.sendMessage(grade_chat_id, msg, {parse_mode: 'HTML'});
    }
}

async function alert_new_courses(course_report)
{
    var start_msg = "🔹 دروس جدیدی در گلستان به ثبت رسیده است:";
    await bot.telegram.sendMessage(course_chat_id, start_msg, {parse_mode: 'HTML'});

    var msg = "";

    for(var i=0;i<course_report.length;i++)
    {
        msg += "🔺 کد درس:";
        msg += "<b>";
        msg += " ";
        msg += course_report[i].course_code;
        msg += " ";
        msg += "</b>";

        msg += "\n";

        msg += "🔸 نام درس:"
        msg += "<b>";
        msg += " ";
        msg += course_report[i].course_name;
        msg += " ";
        msg += "</b>";

        msg += "\n";

        msg += "🔹 استاد درس:"
        msg += "<b>";
        msg += " ";
        msg += course_report[i].course_prof;
        msg += " ";
        msg += "</b>";

        msg += "\n";
        msg += "\n";

        if(i>0 && i%15==0)
        {
            await bot.telegram.sendMessage(course_chat_id, msg, {parse_mode: 'HTML'});
            msg = "";
            await sleep(2000);
        }

    }

    if(msg!="") await bot.telegram.sendMessage(course_chat_id, msg, {parse_mode: 'HTML'});
}

async function alert_no_new_course()
{
    var msg = "💢 گزارش ۱۰۲ گلستان بررسی شد. درس جدیدی در آن به ثبت نرسیده است.";
    await bot.telegram.sendMessage(course_chat_id, msg);
}

async function init_course_msg(course_report)
{
    var start_msg = "🔻گزارش ۱۰۲ گلستان بررسی شد. دروس ثبت شده تا این لحظه:";
    await bot.telegram.sendMessage(course_chat_id, start_msg, {parse_mode: 'HTML'});

    var msg = "";

    for(var i=0;i<course_report.length;i++)
    {
        msg += "🔺 کد درس:";
        msg += "<b>";
        msg += " ";
        msg += course_report[i].course_code;
        msg += " ";
        msg += "</b>";

        msg += "\n";

        msg += "🔸 نام درس:"
        msg += "<b>";
        msg += " ";
        msg += course_report[i].course_name;
        msg += " ";
        msg += "</b>";

        msg += "\n";

        msg += "🔹 استاد درس:"
        msg += "<b>";
        msg += " ";
        msg += course_report[i].course_prof;
        msg += " ";
        msg += "</b>";

        msg += "\n";
        msg += "\n";

        if(i>0 && i%15==0)
        {
            await bot.telegram.sendMessage(course_chat_id, msg, {parse_mode: 'HTML'});
            msg = "";
            await sleep(2000);
        }

    }

    if(msg!="") await bot.telegram.sendMessage(course_chat_id, msg, {parse_mode: 'HTML'});
}

async function test()
{
    await bot.telegram.sendMessage(grade_chat_id, "TEST");
    await bot.telegram.sendMessage(course_chat_id, "TEST");
}

module.exports = {alert_new_grade, alert_no_new_grade, init_grade_msg, init_course_msg, alert_no_new_course, alert_new_courses, test};