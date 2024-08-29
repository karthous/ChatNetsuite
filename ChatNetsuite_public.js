/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @author Jiyun Mei
 * @email karthous@outlook.com
 * @since 2023.4
 */
define(['N/https', 'N/ui/serverWidget', 'N/file', './chatNetsuite_config'],
    (https, serverWidget, file, config) => {

        const {
            VERSION_NO,
            CHAT_API_URL,
            DRAW_API_URL,
            HEADERS,
            CHAT_MODEL,
            DRAW_MODEL,
            DRAW_QUALITY,
            PROMPT
        } = config;

        const clientScriptModulePath = "./chatNetsuite_router_public.js";

        /**
         * Handles the request when a user visits the page.
         * If the request method is GET, the initPage will be rendered.
         * Otherwise, the chatPage or drawPage is rendered based on users' choice.
         * @param {Object} scriptContext
         */
        const onRequest = (scriptContext) => {
            const {custpage_chat, custpage_draw} = scriptContext.request.parameters;
            scriptContext.response.writePage({
                pageObject: custpage_chat ? chatPage(scriptContext) : custpage_draw ? drawPage(scriptContext) : initPage()});
        }

        /**
         * Initializes a form with two checkbox fields representing two features
         * and the title 'ChatNetsuite v[VERSION_NO]'.
         */
        const initPage = () => {
            let form = serverWidget.createForm({title: 'ChatNetsuite v' + VERSION_NO});
            form.clientScriptModulePath = clientScriptModulePath;
            form = addBtnToPage(form, ['chat', 'draw']);
            let news = form.addField({
                id: 'custpage_news',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'News'
            });
            news.defaultValue = "<small>If you need more features, send a request to the administrator.</small>";
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
                text = PROMPT;
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
            form.clientScriptModulePath = clientScriptModulePath;
            form = addBtnToPage(form, ['draw']);
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
                    bodyText.defaultValue += '<h2 style="color:#607799;">ChatNetSuite:</h2>' +
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
            form.clientScriptModulePath = clientScriptModulePath;
            form = addBtnToPage(form, ['chat']);
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
                    "model": DRAW_MODEL,
                    "prompt": text,
                    "n": 1,
                    "size": '1024x1024',
                    "quality": DRAW_QUALITY
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

        const addBtnToPage = (form, btnNames=[]) => {
            const buttons = {
                chat: {
                    id: 'custpage_chat',
                    label: 'Chat',
                    functionName: 'chat()'
                },
                draw: {
                    id: 'custpage_draw',
                    label: 'Draw',
                    functionName: 'draw()'
                },
            };
            btnNames.forEach(btnName => {
                const button = buttons[btnName];
                if (button) { form.addButton(button); }
            });
            return form;
        }

        return {onRequest}
    });
