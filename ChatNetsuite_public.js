/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @author Jiyun Mei
 * @email karthous@outlook.com
 * @since 2023.4
 */
define(['N/https', 'N/ui/serverWidget'],
    (https, serverWidget) => {

        const VERSION_NO = '0.03';
        // ENTER YOUR SCRIPT URL HERE
        const SCRIPT_URL = 'https://1234567.app.netsuite.com/app/site/hosting/scriptlet.nl?script=1234&deploy=1';
        const API_URL = 'https://api.openai.com/v1/chat/completions';
        // ENTER YOUR API KEY HERE
        const OPENAI_KEY = 'sk-123456789012345678901234567890123456789012345678';
        const HEADERS = {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': 'Bearer ' + OPENAI_KEY
        };
        const MODEL = 'gpt-3.5-turbo';

        /**
         * Handles the request when a user visits the page.
         * If the request method is GET, the initPage will be rendered.
         * Otherwise, the answerPage is rendered.
         * @param {Object} scriptContext
         */
        const onRequest = (scriptContext) => {
            if (scriptContext.request.method === 'GET') {
                scriptContext.response.writePage({pageObject: initPage()});
            } else {
                scriptContext.response.writePage({pageObject: answerPage(scriptContext)});
            }
        }

        /**
         * Creates an HTML form with two fields, a text input and a submit button.
         * The form is initialized with the title 'ChatNetsuite v[VERSION_NO]'.
         * The text input is labeled 'Input' and the submit button is labeled 'Ask'.
         */
        const initPage = () => {
            let form = serverWidget.createForm({title: 'ChatNetsuite v' + VERSION_NO});
            form.addField({id:'custpage_input', label:'Input', type: serverWidget.FieldType.LONGTEXT});
            form.addSubmitButton({label: 'Ask'});
            return form;
        }

        /**
         * Renders the answer page with the answer to the customer's query.
         * It first retrieves the input text from the request parameter and
         * makes an API call to OpenAI using the provided key and model to get the answer.
         * The answer is parsed from the response body and a form with the input and answer is created.
         * The form is then returned to the user.
         * @param {Object} scriptContext
         */
        const answerPage = (scriptContext) => {
            let text = scriptContext.request.parameters.custpage_input;
            let pastMsg = scriptContext.request.parameters.custpage_pstmsg;
            let messages = [];
            if (pastMsg) {
                pastMsg = '[' + pastMsg + ']';
                messages = JSON.parse(pastMsg);
            }
            messages.push({"role": 'user', "content": text});
            // Set payload
            let payload = {
                "model": MODEL,
                "messages": messages
                // "temperature": 1,
                // "top_p": 1,
                // "n": 1,
                // "stream": false
            };
            // Make API call
            let response = https.post({
                url: API_URL,
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
                label: 'Input',
                container: 'custpage_field_group_form'
            });
            let fieldGroupEnd = form.addFieldGroup({
                id: 'custpage_field_group_end',
                label: ' '
            });
            let footText = form.addField({
                id: 'custpage_footer',
                type: serverWidget.FieldType.INLINEHTML,
                label: ' ',
                container: 'custpage_field_group_end'
            });
            footText.defaultValue = '<br>' +
                '<a href="' + SCRIPT_URL + '" style="background-color: rgb(67 151 253); color: white; ' +
                'text-decoration: none; font-weight: bold; ' +
                'padding: 3px 12px; ' +
                'border-style: solid; border-width: 1px; border-color: rgb(18 90 178); border-radius: 3px;">Back</a>';
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
            return form;
        }

        return {onRequest}
    });
