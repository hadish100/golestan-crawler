require('dotenv').config();
const { Telegraf } = require('telegraf');
const bot = new Telegraf(process.env.telegram_bot_token);
const admin_id = process.env.chat_id;


async function alert_new_grade(course_name,course_grade)
{
    var msg = "🔹 "
    msg += "نمرات درس "
    msg += "<b>"
    msg += course_name
    msg += "</b>"
    msg += " در سامانه گلستان وارد شد."
    await bot.telegram.sendMessage(admin_id, msg, {parse_mode: 'HTML'});

    var msg = "🔸 "
    msg += "نمره شما در این درس: "
    msg += "<b>"
    msg += course_grade
    msg += "</b>"
    await bot.telegram.sendMessage(admin_id, msg, {parse_mode: 'HTML'});
}

async function alert_no_new_grade()
{
    var msg = "💢 اکانت گلستان شما بررسی شد. نمره جدیدی در آن به ثبت نرسیده است.";
    await bot.telegram.sendMessage(admin_id, msg);
}

async function init_msg(grade_report)
{
    var msg = "🔻اکانت گلستان شما بررسی شد، نمرات ثبت شده تا الان:";
    await bot.telegram.sendMessage(admin_id, msg, {parse_mode: 'HTML'});

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
        await bot.telegram.sendMessage(admin_id, msg, {parse_mode: 'HTML'});
    }
}

module.exports = {alert_new_grade, alert_no_new_grade, init_msg};