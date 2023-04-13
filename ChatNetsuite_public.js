/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @author Jiyun Mei
 * @email karthous@outlook.com
 * @since 2023.4
 */
define(['N/https', 'N/ui/serverWidget'],
    (https, serverWidget) => {

        const VERSION_NO = '0.02';
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
            log.debug("-> text", text);
            // Set payload
            let payload = {
                "model": MODEL,
                "messages": [{"role": 'user', "content": text}],
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
            log.debug('response body', JSON.parse(response.body));
            // Handle response codes
            let answer;
            switch (response.code) {
                case 200:
                    answer = JSON.parse(response.body).choices[0].message.content;
                    log.debug('answer', answer);
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
            // Create form
            let form = serverWidget.createForm({
                title: 'ChatNetsuite v' + VERSION_NO
            });
            let fieldGroup = form.addFieldGroup({id:'custpage_fieldgroup', label:' '});
            fieldGroup.isSingleColumn = true;
            let inputText = form.addField({
                id: 'custpage_input',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'You',
                container: 'custpage_fieldgroup'
            });
            inputText.defaultValue = '<br><h2 style="color:#607799;">You:</h2>' +
                '<article style="font-size:medium;">' + text + '</article>';
            let answerText = form.addField({
                id: 'custpage_answertext',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'answer',
                container: 'custpage_fieldgroup'
            });
            answerText.defaultValue = '<br>' +
                '<h2 style="color: #607799;">ChatNetsuite:</h2>' +
                '<article style="font-size:medium;">' + answer + '</article>';
            answerText.defaultValue += '<br><br>' +
                '<a href="' + SCRIPT_URL + '" style="color:#607799;">Back</a>';
            return form;
        }

        return {onRequest}
    });
