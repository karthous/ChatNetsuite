/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @author Jiyun Mei
 * @email karthous@outlook.com
 * @since 2023.4
 */
define(['N/https', 'N/ui/serverWidget'],
    (https, serverWidget) => {

        const VERSION_NO = '0.04';
        const CHAT_API_URL = 'https://api.openai.com/v1/chat/completions';
        const DRAW_API_URL = 'https://api.openai.com/v1/images/generations';
        // ENTER YOUR API KEY HERE
        const OPENAI_KEY = 'sk-123456789012345678901234567890123456789012345678';
        const HEADERS = {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': 'Bearer ' + OPENAI_KEY
        };
        const CHAT_MODEL = 'gpt-3.5-turbo';

        /**
         * Handles the request when a user visits the page.
         * If the request method is GET, the initPage will be rendered.
         * Otherwise, the chatPage or drawPage is rendered based on users' choice.
         * @param {Object} scriptContext
         */
        const onRequest = (scriptContext) => {
            if (scriptContext.request.method === 'GET') {
                scriptContext.response.writePage({pageObject: initPage()});
            } else {
                const custpage_chat = scriptContext.request.parameters.custpage_chat;
                const custpage_draw = scriptContext.request.parameters.custpage_draw;
                if (custpage_chat === 'T') {
                    scriptContext.response.writePage({pageObject: chatPage(scriptContext)});
                } else if (custpage_draw === 'T') {
                    scriptContext.response.writePage({pageObject: drawPage(scriptContext)});
                }
            }
        }

        /**
         * Initializes a form with two checkbox fields representing two features
         * and the title 'ChatNetsuite v[VERSION_NO]'.
         */
        const initPage = () => {
            let form = serverWidget.createForm({title: 'ChatNetsuite v' + VERSION_NO});
            let chatField = form.addField({
                id: 'custpage_chat',
                label: 'Chat',
                type: serverWidget.FieldType.CHECKBOX
            });
            let imageField = form.addField({
                id: 'custpage_draw',
                label: 'Create image',
                type: serverWidget.FieldType.CHECKBOX
            });
            form.addSubmitButton({label: 'Submit'});
            return form;
        }

        /**
         * Renders the chat page with a form with the input and answer.
         * @param {Object} scriptContext
         */
        const chatPage = (scriptContext) => {
            let text = scriptContext.request.parameters.custpage_input;
            let pastMsg = scriptContext.request.parameters.custpage_pstmsg;
            if (!text) {
                text = 'Act as a world-class teacher on all matters, ' +
                    'who helps me learn by answering my questions. ' +
                    'Help me master the topic I provide. ' +
                    'Make your answer as short as possible. ';
            }
            let messages = [];
            if (pastMsg) {
                pastMsg = '[' + pastMsg + ']';
                messages = JSON.parse(pastMsg);
            }
            messages.push({"role": 'user', "content": text});
            // Set payload
            let payload = {
                "model": CHAT_MODEL,
                "messages": messages
                // "temperature": 1,
                // "top_p": 1,
                // "n": 1,
                // "stream": false
            };
            // Make API call
            let response = https.post({
                url: CHAT_API_URL,
                body: JSON.stringify(payload),
                headers: HEADERS
            });
            // Handle response codes
            let answer;
            switch (response.code) {
                case 200:
                    answer = JSON.parse(response.body).choices[0].message.content;
                    messages.push(JSON.parse(response.body).choices[0].message);
                    break;
                case 401:
                    answer = 'Incorrect API key provided';
                    messages.push({"role": 'AI', "content": answer});
                    break;
                case 402:
                    answer = 'Server refused to access, please try again later';
                    messages.push({"role": 'AI', "content": answer});
                    break;
                case 502:
                    answer = 'Bad Gateway';
                    messages.push({"role": 'AI', "content": answer});
                    break;
                case 503:
                    answer = 'Server is busy, please try again later';
                    messages.push({"role": 'AI', "content": answer});
                    break;
                case 504:
                    answer = 'Gateway Time-out';
                    messages.push({"role": 'AI', "content": answer});
                    break;
                case 500:
                    answer = 'Internal Server Error';
                    messages.push({"role": 'AI', "content": answer});
                    break;
                default:
                    answer = 'Unexpected Error';
                    messages.push({"role": 'AI', "content": answer});
            }
            // Create form
            let form = serverWidget.createForm({
                title: 'ChatNetsuite v' + VERSION_NO
            });
            let fieldGroup = form.addFieldGroup({
                id: 'custpage_field_group_form',
                label: ' '
            });
            fieldGroup.isSingleColumn = true;
            let bodyText = form.addField({
                id: 'custpage_body_text',
                type: serverWidget.FieldType.INLINEHTML,
                label: ' ',
                container: 'custpage_field_group_form'
            });
            bodyText.defaultValue = '<br>';
            messages.forEach((message, index) => {
                if (index % 2 === 0) {
                    bodyText.defaultValue += '<h2 style="color:#607799;">You:</h2>' +
                        '<article style="font-size:medium;">' + message.content + '</article><br>';
                } else {
                    bodyText.defaultValue += '<h2 style="color:#607799;">ChatNetsuite:</h2>' +
                        '<article style="font-size:medium;">' + message.content + '</article><br>';
                }
            });
            bodyText.defaultValue += '<br>';
            let inputText = form.addField({
                id: 'custpage_input',
                type: serverWidget.FieldType.LONGTEXT,
                label: 'You:',
                container: 'custpage_field_group_form'
            });
            let msgText = form.addField({
                id: 'custpage_pstmsg',
                type: serverWidget.FieldType.LONGTEXT,
                label: ' ',
                container: 'custpage_field_group_end'
            });
            msgText.defaultValue = '';
            messages.forEach((message, j) => {
                msgText.defaultValue += JSON.stringify(message);
                if (j !== messages.length - 1) { msgText.defaultValue += ','; }
            });
            msgText.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
            form.addSubmitButton({label: 'Submit'});
            let chatField = form.addField({
                id: 'custpage_chat',
                label: 'Chat',
                type: serverWidget.FieldType.TEXT
            });
            chatField.defaultValue = 'T';
            chatField.updateDisplayType({displayType : serverWidget.FieldDisplayType.HIDDEN});
            return form;
        }

        /**
         * Renders the draw page with user input and the image generated.
         * @param {Object} scriptContext
         */
        const drawPage = (scriptContext) => {
            let text = scriptContext.request.parameters.custpage_input;
            let form = serverWidget.createForm({title: 'ChatNetsuite v' + VERSION_NO});
            let fieldGroup = form.addFieldGroup({
                id: 'custpage_field_group_form',
                label: ' '
            });
            fieldGroup.isSingleColumn = true;
            let inputField = form.addField({
                id: 'custpage_input',
                label: 'Describe an image',
                type: serverWidget.FieldType.LONGTEXT,
                container: 'custpage_field_group_form'
            });
            if (text) {
                // Set payload
                let payload = {
                    "prompt": text,
                    // "n": 1,
                    "size": '256x256',
                    // "response_format": 'url'
                };
                // Make API call
                let response = https.post({
                    url: DRAW_API_URL,
                    body: JSON.stringify(payload),
                    headers: HEADERS
                });
                let answer;
                switch (response.code) {
                    case 200:
                        answer = '';
                        break;
                    case 401:
                        answer = 'Incorrect API key provided';
                        break;
                    case 402:
                        answer = 'Server refused to access, please try again later';
                        break;
                    case 502:
                        answer = 'Bad Gateway';
                        break;
                    case 503:
                        answer = 'Server is busy, please try again later';
                        break;
                    case 504:
                        answer = 'Gateway Time-out';
                        break;
                    case 500:
                        answer = 'Internal Server Error';
                        break;
                    default:
                        answer = 'Unexpected Error';
                }
                let imgUrl = JSON.parse(response.body).data[0].url;
                let outputField = form.addField({
                    id: 'custpage_output',
                    label: 'Image generated',
                    type: serverWidget.FieldType.INLINEHTML,
                    container: 'custpage_field_group_form'
                });
                outputField.defaultValue = answer;
                if (answer === '') {
                    outputField.defaultValue += '<img src="' + imgUrl + '" alt="' + text + '" />';
                }
            }
            let imageField = form.addField({
                id: 'custpage_draw',
                label: 'Draw',
                type: serverWidget.FieldType.TEXT,
                container: 'custpage_field_group_form'
            });
            imageField.defaultValue = 'T';
            imageField.updateDisplayType({displayType : serverWidget.FieldDisplayType.HIDDEN});
            form.addSubmitButton({label: 'Submit'});
            return form;
        }

        return {onRequest}
    });
