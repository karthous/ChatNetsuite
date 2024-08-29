define(['./api_key'], (api_key) => {
    const VERSION_NO = '0.06';

    const HOST = 'https://api.openai.com';
    const CHAT_API_URL = HOST + '/v1/chat/completions';
    const DRAW_API_URL = HOST + '/v1/images/generations';
    const HEADERS = {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': 'Bearer ' + api_key.openai
    };

    const CHAT_MODEL = 'gpt-3.5-turbo';
    const DRAW_MODEL = 'dall-e-3';
    const DRAW_QUALITY = 'hd';
    const PROMPT = 'Act as a world-class teacher on all matters, ' +
        'who helps me learn by answering my questions. ' +
        'Help me master the topic I provide. ' +
        'Make your answer as short as possible. ';

    return {
        VERSION_NO,
        HOST,
        CHAT_API_URL,
        DRAW_API_URL,
        HEADERS,
        CHAT_MODEL,
        DRAW_MODEL,
        DRAW_QUALITY,
        PROMPT
    }
});