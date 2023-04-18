const commands = `
/register - Зарегистрироваться в курсе. 
<b>В случае если у вас нет никнейма в ТГ в формате</b> @username, вы не сможете пройти курс!
Создать никнейм можно в настройках профиля Телеграмм>Имя пользователя.
/help - Помощь.
`;

const help = `
Материал выдается для Вас каждый день после 13:00`;

const registerMessage = `
<b>Поздравляем</b>, Вы успешно прошли регистрацию на мини-курс от Trade Soul! 
Начало курса - <b>17 апреля.</b> 
<b>👆 План мини-курса находится выше.</b>

<b>‼️Не удаляйте этого бота у себя в сообщениях, так как курс будет проходить прямо тут!</b>

Хотим попросить Вас заполнить форму, по которой мы выберем того, кто пойдет на наше полноценное обучение <b>Trade Soul Edu</b> продолжительностью 6 недель - совершенно бесплатно!

<a href='https://docs.google.com/forms/d/e/1FAIpQLSf-N1TCeChmT9gJnkyUTAGSxEHDee72edl0tUff7h4qMwTlzw/viewform?usp=sf_link'>▶️ Заполнить форму</a>`;


const _help = help;
const _commands = commands;
const _registerMessage = registerMessage;

export { _commands as commands };
export { _help as helpCommand };
export { _registerMessage as registerMessage };